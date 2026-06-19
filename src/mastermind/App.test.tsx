// @vitest-environment jsdom
import React from 'react';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import App from './App';
import reducer from './reducers';
import {init, showColorPicker, startGame} from './gameActions';

const initialState = () => reducer(undefined, init());

describe('App', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders the intro screen', () => {
		render(<App state={initialState()} dispatch={vi.fn()} />);

		expect(screen.getByRole('heading', {name: 'Mastermind'})).toBeTruthy();
		expect(screen.getByRole('button', {name: 'Start game'})).toBeTruthy();
	});

	it('dispatches start game from the intro screen', () => {
		const dispatch = vi.fn();

		render(<App state={initialState()} dispatch={dispatch} />);
		fireEvent.click(screen.getByRole('button', {name: 'Start game'}));

		expect(dispatch).toHaveBeenCalledWith(startGame());
	});

	it('dispatches show color picker when an active peg is clicked', () => {
		const dispatch = vi.fn();
		const playingState = reducer(initialState(), startGame());
		const {container} = render(<App state={playingState} dispatch={dispatch} />);

		fireEvent.click(container.querySelector('.board-row .peg')!);

		expect(dispatch).toHaveBeenCalledWith(showColorPicker(0));
	});
});
