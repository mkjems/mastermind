// @vitest-environment jsdom
import React from 'react';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import App from './App.jsx';
import reducer from './reducers/index.js';
import {INIT, START_GAME} from './gameActions.js';

const initialState = () => reducer(undefined, {type: INIT});

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

		expect(dispatch).toHaveBeenCalledWith({type: START_GAME});
	});
});
