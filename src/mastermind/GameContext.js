import {createContext, useContext} from 'react';

// Holds the whole-game view state and the action handlers. Provided once by App
// and read by any gameplay component via useGame(), so we don't thread the same
// props through every layer. Per-instance values (a row's pegs, a peg's id) stay
// explicit props — only genuinely global state lives here.
export const GameContext = createContext(null);

export const useGame = () => useContext(GameContext);
