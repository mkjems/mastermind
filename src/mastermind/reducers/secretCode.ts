import { PEG_COLORS } from "../script/constants";
import { CONFIRM_SECRET, RESET_ALL, START_GAME } from "../gameActions";
import type { DecoratedAction } from "../gameActions";
import type { Color } from "../types";

const createSecretCode = (): Color[] => {
  return ["", "", "", ""].reduce<{ pool: Color[]; drawn: Color[] }>(
    (acc) => {
      const randomValue = Math.floor(Math.random() * acc.pool.length);
      const newColor = acc.pool[randomValue];
      const newPool = acc.pool.filter((color) => {
        return color !== newColor;
      });

      return {
        pool: newPool,
        drawn: acc.drawn.concat(newColor),
      };
    },
    { pool: [...PEG_COLORS], drawn: [] },
  ).drawn;
};

const secretCodeReducer = (
  state: Color[] = createSecretCode(),
  action: DecoratedAction,
): Color[] => {
  switch (action.type) {
    case START_GAME:
    case RESET_ALL:
      return createSecretCode();
    case CONFIRM_SECRET:
      return action.secret;
    default:
      return state;
  }
};

export default secretCodeReducer;
