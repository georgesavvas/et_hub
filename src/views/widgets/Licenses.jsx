import React from "react";
import DataPlaceholder from "../../components/DataPlaceholder";

import styles from "./Licenses.module.css";


const Licenses = () => {
  return (
    <div className={styles.container}>
      <DataPlaceholder text="Licenses" />
    </div>
  );
};

export default Licenses;
