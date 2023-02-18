import React from "react";
import DataPlaceholder from "../../components/DataPlaceholder";

import styles from "./Settings.module.css";


const Settings = () => {
  return (
    <div className={styles.container}>
      <DataPlaceholder text="Settings" />
    </div>
  );
};

export default Settings;
