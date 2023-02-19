import React from "react";
import DataPlaceholder from "../../components/DataPlaceholder";

import styles from "./Rundeck.module.css";


const Rundeck = () => {
  return (
    <div className={styles.container}>
      <DataPlaceholder text="Rundeck" />
    </div>
  );
};

export default Rundeck;
