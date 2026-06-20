// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import reducer from "./reducers";
import {
  confirmSecret,
  init,
  showColorPicker,
  startAlgorithm,
  startGame,
  submitFeedback,
} from "./gameActions";
import type { Color } from "./types";

const initialState = () => reducer(undefined, init());

const SECRET: Color[] = ["blue", "orange", "green", "white"];
// The computer's opening guess is deterministic; against SECRET it scores exactly
// one white (the shared 'green', out of position) and nothing else.
const guessingState = () =>
  reducer(reducer(initialState(), startAlgorithm()), confirmSecret(SECRET));

describe("App", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the intro screen", () => {
    render(<App state={initialState()} dispatch={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Mastermind" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start game" })).toBeTruthy();
  });

  it("dispatches start game from the intro screen", () => {
    const dispatch = vi.fn();

    render(<App state={initialState()} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: "Start game" }));

    expect(dispatch).toHaveBeenCalledWith(startGame());
  });

  it("dispatches show color picker when an active peg is clicked", () => {
    const dispatch = vi.fn();
    const playingState = reducer(initialState(), startGame());
    const { container } = render(
      <App state={playingState} dispatch={dispatch} />,
    );

    fireEvent.click(container.querySelector(".board-row .peg")!);

    expect(dispatch).toHaveBeenCalledWith(showColorPicker(0));
  });

  it("submits feedback the player scores for a computer guess", async () => {
    const dispatch = vi.fn();
    render(<App state={guessingState()} dispatch={dispatch} />);

    // The scoring picker appears after the computer's "thinking" beat.
    // Correct score for the opener vs SECRET: one white, then done.
    fireEvent.click(await screen.findByRole("button", { name: "white" }));
    fireEvent.click(screen.getByRole("button", { name: "no more pegs" }));

    expect(dispatch).toHaveBeenCalledWith(
      submitFeedback(["white", "none", "none", "none"]),
    );
  });

  it("rejects feedback that does not match the secret", async () => {
    const dispatch = vi.fn();
    render(<App state={guessingState()} dispatch={dispatch} />);

    // A red is wrong here (the true score has no reds), so nothing is dispatched.
    fireEvent.click(await screen.findByRole("button", { name: "red" }));
    fireEvent.click(screen.getByRole("button", { name: "no more pegs" }));

    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByText(/doesn't match your secret/i)).toBeTruthy();
  });
});
