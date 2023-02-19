import React from "react";
import DataPlaceholder from "../../components/DataPlaceholder";

import styles from "./Apps.module.css";


const Apps = () => {
  return (
    <div className={styles.container}>
      <DataPlaceholder text="Apps" />
    </div>
  );
};

export default Apps;
