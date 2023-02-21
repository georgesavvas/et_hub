import React, {useState, useContext} from "react";
import DataPlaceholder from "../../components/DataPlaceholder";
import {DataContext} from "../../contexts/DataContext";

import styles from "./Apps.module.css";


const App = props => {
  return (
    <div>App</div>
  );
};

const Apps = () => {
  const {licenses} = useContext(DataContext);
  
  return (
    <div className={styles.container}>
      <DataPlaceholder text="Apps" />
    </div>
  );
};

export default Apps;
