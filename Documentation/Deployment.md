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
container's private localhost port.

Target shape:

```text
Browser
  -> https://mastermind.mkjems.dk
  -> Caddy on the VPS
  -> http://127.0.0.1:<unique-port>
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
