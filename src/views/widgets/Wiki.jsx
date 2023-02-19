import React from "react";
import DataPlaceholder from "../../components/DataPlaceholder";

import styles from "./Wiki.module.css";


const Wiki = () => {
  return (
    <div className={styles.container}>
      <DataPlaceholder text="Wiki" />
    </div>
  );
};

export default Wiki;
