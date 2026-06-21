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

- [ ] Should look like the design
- [ ] We are missing the green checkmark to submit. (The red x is submitting at the moment)
- [ ] We need a new button ('<' ) to 'undo' the last score peg selection.
