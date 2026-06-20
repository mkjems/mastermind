import React, { useEffect, useReducer } from "react";
import { createRoot } from "react-dom/client";

import reducer from "./reducers";
import "./style/mastermind.css";
import App from "./App";
import { loadState, saveState } from "./script/sessionStorage";
import { init } from "./gameActions";

const container = document.getElementById("app");
if (container === null) {
  throw new Error("Root element #app not found");
}
const root = createRoot(container);

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
