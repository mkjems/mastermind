import React, {useEffect, useReducer} from 'react';
import {createRoot} from 'react-dom/client';

import reducer from './reducers';
import './style/mastermind.css';
import App from './App.jsx';
import {loadState, saveState} from './script/sessionStorage.js';
import {init} from './gameActions.js';

const root = createRoot(document.getElementById('app'));

function loadInitialState() {
    return loadState() ?? reducer(undefined, init());
}

function Mastermind() {
    const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

    useEffect(() => {
        saveState(state);
    }, [state]);

    return <App state={state} dispatch={dispatch} />;
}

root.render(<Mastermind />);
