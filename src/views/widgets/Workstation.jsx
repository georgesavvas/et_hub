import React from "react";
import DataPlaceholder from "../../components/DataPlaceholder";

import styles from "./Workstation.module.css";


const Workstation = () => {
  return (
    <div className={styles.container}>
      <DataPlaceholder text="Workstation" />
    </div>
  );
};

export default Workstation;
