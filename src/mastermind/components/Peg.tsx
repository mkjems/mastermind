import React from "react";

import { TOP_VIEW_COLORS } from "../script/constants";
import type { PegValue } from "../types";
import Hole from "./Hole";
import PegIllu from "./PegIllu";

interface PegProps {
  id: number;
  peg: PegValue;
  onPegClick?: (id: number) => void;
  isSelected?: boolean;
  isActiveRow?: boolean;
}

const Peg = ({ id, peg, onPegClick, isSelected, isActiveRow }: PegProps) => {
  let markup = null;
  if (peg === "select" && isSelected) {
    markup = <Hole isSelected={true} isActiveRow={isActiveRow} />;
  } else if (peg === "select") {
    markup = <Hole isActiveRow={isActiveRow} />;
  } else if (peg === "none") {
    markup = <Hole />;
  } else {
    markup = <PegIllu colors={TOP_VIEW_COLORS[peg]} isSelected={isSelected} />;
  }
  return (
    <div className="peg" onClick={() => onPegClick?.(id)}>
      {markup}
    </div>
  );
};

export default Peg;
