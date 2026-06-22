# Deployment

Mastermind is deployed as a static Vite/React app in a Docker container.

## Production File Serving

Use `nginxinc/nginx-unprivileged:stable-alpine` to serve the built `dist/`
folder in production.

Why this choice:

- The app is static after `npm run build`, so it does not need a Node server at
  runtime.
- The image runs Nginx as an unprivileged user.
- It listens on internal port `8080`, which matches the VPS Compose convention
  from the parallel-project deployment guide.
- The custom Nginx config includes SPA fallback, so a refreshed client-side URL
  returns `index.html`.

The VPS already has Caddy on public ports `80` and `443`. Caddy should keep
handling HTTPS and domain routing, then proxy `mastermind.mkjems.dk` to the
container's private localhost port, `127.0.0.1:8081`.

Target shape:

```text
Browser
  -> https://mastermind.mkjems.dk
  -> Caddy on the VPS
  -> http://127.0.0.1:8081
  -> Mastermind container port 8080
```

## Docker Image

The production [Dockerfile](../Dockerfile):

1. Uses `node:22-alpine` to install dependencies and run `npm run build`.
2. Copies the generated `dist/` folder into
   `nginxinc/nginx-unprivileged:stable-alpine`.
3. Serves the app on port `8080` using [docker/nginx.conf](../docker/nginx.conf).

The planned GHCR image is:

```text
ghcr.io/mkjems/mastermind:latest
```

## VPS Compose

Mastermind runs from `/opt/mastermind` on the VPS. The Compose file is
`/opt/mastermind/compose.yaml`:

```yaml
services:
  mastermind:
    image: ghcr.io/mkjems/mastermind:latest
    ports:
      - "127.0.0.1:8081:8080"
    restart: unless-stopped
```

The left side, `127.0.0.1:8081`, is the private host port on the VPS. The right
side, `8080`, is the port inside the container. Do not expose this as a public
host port; Caddy is the public entrypoint.

## Caddy

The VPS Caddyfile at `/etc/caddy/Caddyfile` routes
`mastermind.mkjems.dk` to the Mastermind container:

```caddyfile
mastermind.mkjems.dk {
    reverse_proxy 127.0.0.1:8081
}
```

After editing the Caddyfile, validate and reload Caddy:

```sh
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

With DNS pointed at the VPS, Caddy handles the HTTP-to-HTTPS redirect and the
TLS certificate automatically.

## Local Docker Check

Build the production image:

```sh
docker build -t ghcr.io/mkjems/mastermind:latest .
```

Run Mastermind locally on host port `8081`, mapped to the container's internal
port `8080`:

```sh
docker run --rm -p 8081:8080 ghcr.io/mkjems/mastermind:latest
```

This means `http://localhost:8081` serves Mastermind. It is fine if another
project, such as Gunfight, is already using `http://localhost:8080`; each
project needs its own host port, while the containers can all use internal port
`8080`.

## GitHub Actions Deployment

The workflow at [.github/workflows/deploy.yml](../.github/workflows/deploy.yml)
runs on pushes to `master` and can also be started manually from GitHub Actions.
The pipeline has been verified end to end: a push to `master` builds, pushes,
deploys, and smoke-tests the live site.

The flow is:

1. Run `npm ci` and `npm run check`.
2. Build the Docker image and push `ghcr.io/mkjems/mastermind:latest` to GHCR.
3. SSH into the VPS.
4. Run `docker compose pull` and `docker compose up -d` in `/opt/mastermind`.
5. Smoke-test the local container health endpoint and
   `https://mastermind.mkjems.dk`.

Required GitHub repository secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`

Before the first successful workflow run pushed the image, the VPS command
`docker compose pull` failed with `not found` for
`ghcr.io/mkjems/mastermind:latest`. If that happens again, check that the build
job pushed the same image tag that `/opt/mastermind/compose.yaml` pulls.

## Deployment Troubleshooting

If the GitHub Actions `check` and `build` jobs pass but `deploy` fails with:

```text
ssh.ParsePrivateKey: ssh: no key found
ssh: handshake failed: ssh: unable to authenticate
```

then the workflow reached the SSH step, but `VPS_SSH_KEY` is not a usable
private key. Check that the GitHub secret contains the complete private key,
including the begin/end lines:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

Do not put a public key (`ssh-ed25519 ...` or `ssh-rsa ...`) in `VPS_SSH_KEY`.
The matching public key must be in the VPS user's `~/.ssh/authorized_keys`.

If the workflow pulls the image and starts the container, but then fails with:

```text
curl: (35) TLS connect error
```

on `https://mastermind.mkjems.dk`, the Docker deploy itself worked. Finish or
verify the Caddy site block for `mastermind.mkjems.dk`, reload Caddy, and then
rerun the workflow or the public smoke check.
