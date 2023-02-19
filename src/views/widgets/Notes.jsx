import React from "react";
import DataPlaceholder from "../../components/DataPlaceholder";

import styles from "./Notes.module.css";


const Notes = () => {
  return (
    <div className={styles.container}>
      <DataPlaceholder text="Notes" />
    </div>
  );
};

export default Notes;
