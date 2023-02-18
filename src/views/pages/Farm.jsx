import React from "react";
import DataPlaceholder from "../../components/DataPlaceholder";

import styles from "./Farm.module.css";


const Farm = () => {
  return (
    <div className={styles.container}>
      <DataPlaceholder text="Farm" />
    </div>
  );
};

export default Farm;
