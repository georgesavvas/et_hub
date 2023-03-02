/* eslint-disable react/no-unknown-property */
import React from "react";
import DataPlaceholder from "../../components/DataPlaceholder";
import Widget from "./Widget";

import styles from "./Wiki.module.css";


const Wiki = () => {
  return (
    <div className={styles.container}>
      <webview
        partition="persist:hub_wiki"
        src="https://www.notion.so/etcvfx/Asset-Build-Groups-and-Types-202ebd8521f54f4ca331bd4e36dcc364?pvs=4"
        allowpopups="true"
        className={styles.webview}>
      </webview>
      {/* <DataPlaceholder text="Wiki" /> */}
    </div>
  );
};

export default Wiki;
