import React from 'react';
import {createRoot} from 'react-dom/client';
import {createStore} from 'redux';

import reducer from './reducers';
import './style/mastermind.css';
import App from './containers/App';
import { loadState, saveState } from './script/localStorage';

const store = createStore(reducer, loadState())
const root = createRoot(document.getElementById('app'));

const renderFunc = () => {
    root.render(<App dispatch={store.dispatch} getState={store.getState} />);
};

store.subscribe(renderFunc)

store.subscribe(()=>{
	saveState(store.getState());
});

renderFunc();
