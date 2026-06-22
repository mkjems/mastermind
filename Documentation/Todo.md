# TODO - this is where we decide and describe the next steps we will make.

## P3 - Improve design

Goal: A beautiful skeuomorphic Mastermind game — it should look and feel like a
physical board in front of you — that works well on mobile and desktop.

### Locked design decisions

- **Full merge:** one shared `Board` component renders both modes. Orientation is
  flipped with CSS (`flex-direction: column-reverse`) so the data/row order stays the
  same and only the visuals flip. This retires the separate
  `AlgorithmGame` / `AlgorithmBoard` tree; both modes (and the menu/rules backdrop)
  render through the same board.
- **Peg styling:** placed pegs in holes render as round glossy **domes** (`Peg`,
  top-down view); the color **palette / picker** uses the illustrated **mushroom**
  pegs (`PegIllu` top-view, `PegSideways` side-view).
- **Animated cover:** one `HiddenCode` cover with three states — `closed`, `peek`
  (partial lift, `translateY`), `open` (slid aside, `translateX`). Reused for
  reveal-on-win, reveal-on-give-up, and the Peek button.
- Build order: **P3.0 foundation → P3.5 → P3.2 → P3.3 → P3.4 → P3.1 polish.**

### Key files (current state)

- Layout grid + all classes: [style/mastermind.css](../src/mastermind/style/mastermind.css)
  (`#app` grid, `.board`, `.board-row`, `.picker-box`, `.bottom-part`).
- Board frame: [components/BoardRidge.tsx](../src/mastermind/components/BoardRidge.tsx)
  - [BoardRidge.module.css](../src/mastermind/components/BoardRidge.module.css).
- Cover: [components/HiddenCode.tsx](../src/mastermind/components/HiddenCode.tsx)
  - [HiddenCode.module.css](../src/mastermind/components/HiddenCode.module.css)
    (currently animates `height`; needs to animate `transform`).
- Human screen: [Gameplay.tsx](../src/mastermind/components/Gameplay.tsx),
  [BoardRow.tsx](../src/mastermind/components/BoardRow.tsx),
  [ColorPicker.tsx](../src/mastermind/components/ColorPicker.tsx).
- Algorithm screen (to retire): [AlgorithmGame.tsx](../src/mastermind/components/AlgorithmGame.tsx),
  [AlgorithmBoard.tsx](../src/mastermind/components/AlgorithmBoard.tsx),
  [SecretBar.tsx](../src/mastermind/components/SecretBar.tsx),
  [SecretSetup.tsx](../src/mastermind/components/SecretSetup.tsx),
  [AlgorithmResult.tsx](../src/mastermind/components/AlgorithmResult.tsx).
- Intro: [Intro.tsx](../src/mastermind/components/Intro.tsx) (title, buttons, inline `Rules`).
- Wiring: [App.tsx](../src/mastermind/App.tsx), [GameContext.ts](../src/mastermind/GameContext.ts).

---

### P3.0 - Shared foundation (do first — unblocks everything)

**Aim:** Maybe we should unite the `<Gameplay>` and `<AlgorithmGame>` components and
have one that can handle both (and maybe also the main screen background). Everything
else is built on top of this one board.

**Steps:**

- [x] **Board component** — new [components/Board.tsx]. Wraps `BoardRidge` and renders
      the rows from context. A single inner flex column holds `[cover, ...rows]`;
      `flex-direction: column` for human, `column-reverse` for algorithm. Because the
      cover is the first child, reversing alone moves it from top to bottom and makes
      rows build upward — covering both P3.3 orientation requirements at once.
- [x] Board accepts a `footer` slot (palette / feedback picker / Peek / Give-up) and an
      `overlay` slot (menu / rules / win-lost-gaveup messages) so all screens compose
      through it.
- [x] **Cover refactor** — [HiddenCode.tsx] takes a `coverState: 'closed' | 'peek' | 'open'`
      prop instead of the boolean. Rewrite [HiddenCode.module.css]: `.slider` gets
      `transition: transform .5s ease`; `closed` = covering, `peek` =
      `translateY(-35%)` (partial lift), `open` = `translateX(105%)` (slide aside).
      Derive `coverState` from `gameStatus` (+ a transient Peek flag) in `App`/context.
- [x] **Overlay primitive** — new [components/Overlay.tsx] + module css: a dark, rounded,
      centered panel rendered above the board (matches the menu mockup). Reused by P3.5
      menu and P3.4 rules.
- [x] Make the empty `board` data available at the intro: `App` now builds `GameContext`
      unconditionally and renders `Intro` inside the provider, so a `Board` backdrop can
      mount at intro in P3.5.
- [x] Keep `npm run check` green after the refactor (typecheck + 51 tests + build all
      pass; the only `format:check` warning is pre-existing `package.json` drift on master).

### P3.5 - Home / Main screen (build first after foundation)

**Aim:**

- Home screen should show the main menu overlaying an 'empty' board.
- The background board should be a real rendered board, not an image.
- Main menu buttons should be stacked vertically.

**Steps:**

- [x] Render the empty `Board` (real holes, no game) as the backdrop via new
      [components/Home.tsx] — no image background. `.frame` takes the board's grid slot.
- [x] New [components/Menu.tsx]: `Overlay` panel with the `Mastermind` title and three
      **vertically stacked** buttons — `Play a game`, `Play algorithm`, `See rules`.
- [x] Wire buttons via `GameContext` (`onStartGame`, `onStartAlgorithm`, `onToggleRules`).
      "See rules" toggles a Rules overlay (extracted to [components/Rules.tsx] — also
      covers the first two P3.4 steps).
- [x] Style the buttons as the blue pills from the mockup (Menu module css).
- [x] Replaced the intro branch in [App.tsx] with `<Home />`; deleted the old `Intro.tsx`.

### P3.2 - Human-guessing screen

**Aim:**

- The secret code should be at the **top** of the screen and guessing should look like
  it does now.
- If the user gives up there should be an animation revealing the code by sliding the
  cover to the side (CSS transform).
- If the user guesses the code there should be a reveal of the code using an animation.

**Steps:**

- [x] Render human mode through `Board` ([Gameplay.tsx] now just composes `Board` with a
      top-down cover, a give-up footer, and the result overlay); `BoardRow` still draws rows.
- [x] **Give up → reveal:** cover slides aside (HiddenCode derives `open` once the code is
      revealed). Give-up message now floats in an `Overlay` panel.
- [x] **Win → reveal:** same slide-aside reveal on `won`; win message in an `Overlay`
      (centred, so the revealed code stays visible above it). Lost message too.
- [x] Active hole already shows the ring highlight (selected ellipse in [Hole.tsx]).
- [x] Palette stays mushroom pegs via `ColorPicker` (`PegSideways`) + `Checkmark` — unchanged.
- [x] Stripped the inline Won/Lost/GaveUp out of [BoardRow.tsx] (kept the ColorPicker);
      simplified those three to plain content for the overlay panel.

### P3.3 - Algorithm-guessing screen (uses the merged `Board`)

**Aim:**

- The secret code should be at the **bottom** of the screen, to give the impression
  that you are playing at the opposite end from the computer.
- The guessing rows should start from the bottom and progress upwards.
- Human feedback is given in much the same way as guessing — only using the other
  (red/white) pegs.
- When the human sets the code it should be done almost like guessing the code, but the
  'target' is visually the bottom row.
- When the user gives feedback there should be a 'Peek' button that lifts the cover of
  the secret code a little bit (humans forget such things easily).

**Steps:**

- [x] Render algorithm mode through the **same `Board`** (orientation `bottom-up`, cover
      at the bottom). [AlgorithmGame.tsx] now composes `Board` for play + result.
- [x] Setup: [SecretSetup.tsx] rewritten to render through `Board` — the target row +
      mushroom palette + ✓ live in the footer at the bottom, picked like guessing.
- [x] Play: computer guesses (domes) build bottom→up; the active guess is scored with
      `FeedbackPicker` in the footer. The "thinking" beat is preserved via Board's new
      `revealedRows` prop (the fresh guess is withheld until revealed).
- [x] **Peek button** in the footer toggles `coverState='peek'` to lift the bottom cover;
      toggling again (or game over → `open`) returns it. Board gained `coverState`,
      `revealedRows`, and `interactive` props to support all this.
- [x] Deleted `AlgorithmBoard`, `AlgorithmResult`, `SecretBar`. Solver + reducers
      untouched. **Deviations:** kept `SecretSetup` (rewritten through `Board`) and
      `AlgorithmGame` (now the single algorithm entry) rather than deleting them — both
      hold genuinely distinct logic and folding them in would bloat one file.
- [x] **Polish (img 2/3):** feedback scoring lifted into [AlgorithmGame.tsx]; the score
      shows live as dots on the guess row (Board `liveFeedback`), the red/white/✗ buttons
      sit just above the guess (Board `activeRowExtra`), and Peek sits beside the secret
      in a bottom box (Board `coverAction` + `.secret-box`). [FeedbackPicker.tsx] is now a
      controlled buttons+error component.

### P3.4 - Rules page

**Aim:**

-[ ] Show the rules overlaying the empty board — much like the main menu. -[ ] Make a design mockup (still missing).

**Steps:**

- [x] Extract the inline `Rules` into [components/Rules.tsx] (done during P3.5).
- [x] Show it in an `Overlay` over the empty `Board`, opened from the menu's `See rules`.
- [ ] Polish the rules overlay layout/styling (basic version is functional).
- [ ] (Mockup still missing — follows the main-menu layout unless we design a dedicated one.)

### P3.1 - General polish (last)

**Aim:** Tie it all together — consistent, responsive, and clean.

**Steps:**

- [ ] Responsive sizing pass for mobile and desktop (review `#app` grid + the
      `max-width: 550px` block in [mastermind.css]).
- [ ] Consistent skeuomorphic board/ridge/hole/peg styling across all screens.
- [ ] Audit: domes in holes, mushrooms in palette — confirm everywhere; remove dead
      CSS/components left over from the merge.
- [ ] Final `npm run check` + manual pass on both modes, all reveal animations, and Peek.

## P3.6 Get Select code in algo game finished from a look and feel perspective

- [ ] Should look like the design
- [x] The holes should be using the pulsating animation like the 'guess selector' in the human game.
- [x] The secret holes should align with the other holes on the board.

## P3.7 Finish 'Give feed back in algo game' from a look and feel perspective

- [x] Should look like the design
- [x] We are missing the green checkmark to submit. (The red x is submitting at the moment)
- [x] We need a new button ('<' ) to 'undo' the last score peg selection.
- [x] The feedback buttons themselves are the main look-and-feel problem: they
      currently look like generic gray UI buttons with tiny symbols inside, not like
      tactile Mastermind scoring pieces.

**Concrete work outline:**

- [x] Use `ALGO_GAME2_GIVE_FEEDBACK_PEEK.png` as the visual target for the active
      feedback state: bottom-up board, current computer guess visible near the bottom,
      score preview shown in the row's feedback holes, scoring controls above the
      current guess, and the Peek control staying beside the covered secret.
- [x] Rework [FeedbackPicker.tsx](../src/mastermind/components/FeedbackPicker.tsx)
      from the temporary three gray capsule buttons into the intended physical
      controls: red feedback peg button, white feedback peg button, green circular
      submit/checkmark button, and a `<` undo button. Remove the red `x` as the
      submit action.
- [x] Make the red/white controls read as the same small feedback pegs used in the
      board's score holes, just presented as clickable pieces. The click target can
      be larger than the visible peg, but the visible control should not be a big
      gray rounded rectangle with a tiny dot in it.
- [x] Make the submit action match the design: a prominent green round button with
      a white checkmark, positioned with the feedback controls above the active
      guess, not as a generic form submit button.
- [x] Add the undo control as a subdued secondary piece so it is discoverable but
      does not compete visually with red/white scoring or the green submit action.
- [x] Update the feedback-entry flow in
      [AlgorithmGame.tsx](../src/mastermind/components/AlgorithmGame.tsx):
      red/white append to the current score, undo removes the latest score peg, the
      green check submits the score padded with `none`, validation errors clear on
      the next edit, and the score does not auto-submit just because four pegs were
      selected.
- [x] Keep using `Board`'s `liveFeedback` and `activeRowExtra` hooks, but tune the
      active-row layout so the controls sit visually like board pieces, not as a
      generic form block.
- [x] Add styling in [style/mastermind.css](../src/mastermind/style/mastermind.css)
      for the feedback controls: consistent peg sizing, green circular checkmark,
      compact undo button, no inline styles, and responsive spacing that still fits
      the narrow board.
- [x] Make interaction states explicit: undo disabled/visually muted when no score
      has been entered, submit available for zero-to-four feedback pegs, clear
      accessible labels, and no layout shift when an error message appears.
- [x] Add or update tests covering red/white entry, undo, submit via the green
      checkmark, padding with `none`, and mismatch validation reset.
- [x] Manual QA after implementation: algorithm setup, feedback scoring, Peek/Hide,
      solved state, inconsistent-feedback state, desktop width, and mobile width.

## P4 - Deployment

Goal: Deploy Mastermind as a parallel project on the same Hetzner VPS as
Gunfight, following
[How-to-deploy-parallel-project-on-vps.md](How-to-deploy-parallel-project-on-vps.md):
GitHub Actions builds and pushes a GHCR image, the VPS pulls it with Docker
Compose from `/opt/mastermind`, and Caddy routes `mastermind.mkjems.dk` to a
unique private localhost port.

### P4.0 - Locked deployment shape

- [x] Project slug / Compose service name: `mastermind`.
- [x] Production domain: `mastermind.mkjems.dk`.
- [x] VPS app directory: `/opt/mastermind`.
- [x] Reverse proxy: existing Caddy on public ports `80` and `443`.
- [x] Image strategy: GitHub Actions builds the Docker image and pushes it to a
      registry; the VPS pulls the image.
- [x] GHCR image name: `ghcr.io/mkjems/mastermind:latest`.
- [x] Container port: `8080`.
- [x] Deploy branch: `master`.
- [ ] Choose the VPS private host port after checking `ss -ltnp`; likely
      `127.0.0.1:8081` if Gunfight keeps `127.0.0.1:8080`.

### P4.1 - Make local docker file

- [x] Add a production [Dockerfile](../Dockerfile) with a multi-stage build:
      use Node 22, run `npm ci`, run `npm run build`, then serve `dist/` from a
      small static web server image.
- [x] Configure the container's static web server to listen on internal port
      `8080`, matching the VPS Compose convention.
- [x] Configure the static server for SPA fallback so refreshing a client-side
      route still serves `index.html`.
- [x] Add a [.dockerignore](../.dockerignore) that excludes `node_modules`,
      `dist`, local logs, editor files, and git metadata from the Docker build
      context.
- [ ] Build the image locally with Docker/OrbStack/Apple container tooling and
      tag it as `ghcr.io/mkjems/mastermind:latest` for parity with CI.
- [ ] Run the production container locally with a host-port mapping to internal
      port `8080`.
- [ ] Verify the app loads from the local container and that browser refreshes
      still return the SPA.
- [x] Decide whether to add a dedicated `npm run check:deploy` script or use
      the existing `npm run check` directly in the GitHub Action. Decision: use
      the existing `npm run check`.
- [x] Run the chosen deploy check before treating the Docker setup as ready
      (`npm run check` passes).

### P4.2 - Make support for multiple simultaneous docker instances running on my vps on different domains

- [ ] Create a DNS `A` record for `mastermind.mkjems.dk` pointing to the same
      Hetzner VPS IP as `gunfight.mkjems.dk`.
- [ ] SSH into the VPS and create the separate app directory:
      `/opt/mastermind`.
- [ ] Check existing bound ports on the VPS with `ss -ltnp` before selecting
      Mastermind's private localhost port.
- [ ] Create `/opt/mastermind/compose.yaml` with one `mastermind` service using
      image `ghcr.io/mkjems/mastermind:latest`.
- [ ] In the VPS Compose file, publish only a private localhost port, for
      example `"127.0.0.1:8081:8080"`; do not expose a public host port.
- [ ] Use `restart: unless-stopped` in the VPS Compose file.
- [ ] If the GHCR package is private, log in once on the VPS with a GitHub token
      that has package read access.
- [ ] Add a `mastermind.mkjems.dk` site block to `/etc/caddy/Caddyfile` that
      reverse-proxies to Mastermind's private localhost port.
- [ ] Validate and reload Caddy with `sudo caddy validate --config
      /etc/caddy/Caddyfile` and `sudo systemctl reload caddy`.
- [ ] Confirm Gunfight still keeps its existing route:
      `gunfight.mkjems.dk -> Caddy -> 127.0.0.1:8080`.

### P4.3 - Create github action for project that will deploy new version on pushes to master branch.

- [ ] Create `.github/workflows/deploy.yml` triggered by pushes to `master`.
- [ ] Give the workflow `contents: read` and `packages: write` permissions.
- [ ] Add a `check` job that checks out the repo, sets up Node 22 with npm
      caching, runs `npm ci`, and runs the chosen deploy check.
- [ ] Add a `build` job that logs in to `ghcr.io` with `GITHUB_TOKEN`, builds
      the Docker image, and pushes `ghcr.io/mkjems/mastermind:latest`.
- [ ] Add GitHub repository secrets for SSH deploy access: `VPS_HOST`,
      `VPS_USER`, and `VPS_SSH_KEY`.
- [ ] Prepare the VPS deploy user so the SSH key can connect and the user can
      run Docker Compose in `/opt/mastermind`.
- [ ] Add a `deploy` job using `appleboy/ssh-action` that runs:
      `cd /opt/mastermind`, `docker compose pull`, `docker compose up -d`, and
      `docker image prune -f`.
- [ ] Make sure the image name pushed by the workflow exactly matches the image
      name in `/opt/mastermind/compose.yaml`.
- [ ] Add a post-deploy smoke check that verifies
      `https://mastermind.mkjems.dk` returns the built app.
- [ ] Confirm a push to `master` deploys successfully and leaves the old
      container replaced by the new one.

### P4.4 - Verify the live deployment

- [ ] From a local machine, run `curl -I http://mastermind.mkjems.dk` and
      confirm HTTP redirects to HTTPS.
- [ ] From a local machine, run `curl -I https://mastermind.mkjems.dk` and
      confirm HTTPS returns the Mastermind app.
- [ ] Confirm `https://gunfight.mkjems.dk` still works after adding
      Mastermind.
- [ ] On the VPS, run `cd /opt/mastermind && docker compose ps`.
- [ ] On the VPS, inspect recent logs with
      `cd /opt/mastermind && docker compose logs --tail=100`.
- [ ] Validate Caddy again after deployment with `sudo caddy validate --config
      /etc/caddy/Caddyfile`.
- [ ] Check recent Caddy logs with `sudo journalctl -u caddy --no-pager -n
      100` if routing or HTTPS fails.

### P4.5 - Write documentation about how deployment is done in this project

- [ ] Expand [Deployment.md](Deployment.md) with the final architecture:
      GHCR image, VPS Compose file in `/opt/mastermind`, private localhost
      port, Caddy domain routing, and GitHub Actions.
- [ ] Document local Docker usage: build, run, stop, logs, and how to change the
      local host port.
- [ ] Document one-time VPS setup: DNS, `/opt/mastermind/compose.yaml`, GHCR
      read access if needed, Caddy site block, Caddy validate/reload.
- [ ] Document the normal deploy flow from `master`: check, build/push GHCR,
      SSH to VPS, `docker compose pull`, `docker compose up -d`.
- [ ] Document how to add another project on the same VPS: new domain, new
      `/opt/<project>` directory, new GHCR image, unique private localhost port,
      and new Caddy site block.
- [ ] Document troubleshooting commands: `docker compose ps`, logs, rebuild,
      `ss -ltnp`, Caddy validate/reload, Caddy logs, and smoke-test URL checks.
- [ ] Document common mistakes from the parallel-project guide, especially
      reusing Gunfight's `127.0.0.1:8080`, exposing a public port, forgetting
      DNS/Caddy reload, and mismatching GHCR image names.
- [ ] Keep the TODO checked off as each deployment piece is implemented and move
      the finished deployment plan to Completed-plans when P4 is complete.
