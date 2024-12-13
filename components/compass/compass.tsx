import React from "react";
import styles from "./compass.module.css";

interface CompassProps {
  stationName: string;
  direction: string;
  angle: number;
}

const Compass: React.FC<CompassProps> = ({ stationName, direction, angle }) => {
  return (
    <div className={styles.compassContainer}>
      <div className={styles.compass}>
        <div className={styles.cardinals}>
          <span className={styles.north}>N</span>
          <span className={styles.east}>E</span>
          <span className={styles.south}>S</span>
          <span className={styles.west}>W</span>
        </div>
        <div
          className={styles.needle}
          style={{ transform: `rotate(${angle}deg)` }}
        ></div>
      </div>
    </div>
  );
};

export default Compass;
