import React from "react";

import styles from "./Overlay.module.css";

interface OverlayProps {
  children: React.ReactNode;
}

// A floating dark panel rendered over the board. The parent must be positioned
// (the Board's frame is) so the overlay can fill it. Reused by the main menu and
// the rules page.
const Overlay = ({ children }: OverlayProps) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>{children}</div>
    </div>
  );
};

export default Overlay;
