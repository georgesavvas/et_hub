import React from "react";
import DataPlaceholder from "../../components/DataPlaceholder";

import styles from "./Todo.module.css";


const Todo = () => {
  return (
    <div className={styles.container}>
      <DataPlaceholder text="Todo" />
    </div>
  );
};

export default Todo;
