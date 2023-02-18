import React from "react";
import DataPlaceholder from "../../components/DataPlaceholder";

import styles from "./Help.module.css";


const Help = () => {
  return (
    <div className={styles.container}>
      <DataPlaceholder text="Help" />
    </div>
  );
};

export default Help;
