import React, {useContext} from "react";
import { ResponsiveTreeMap } from "@nivo/treemap";
import DataPlaceholder from "../../components/DataPlaceholder";
import {DataContext} from "../../contexts/DataContext";

import styles from "./Farm.module.css";


const Farm = () => {
  const {farm} = useContext(DataContext);
  console.log(farm.data);

  return (
    <div className={styles.container}>
      {/* <DataPlaceholder text="Farm" /> */}
      <ResponsiveTreeMap
        data={farm.data}
        identity="name"
        value="loc"
        valueFormat=" >-.2s"
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        labelSkipSize={12}
        labelTextColor={{
          from: "color",
          modifiers: [
            [
              "darker",
              1.2
            ]
          ]
        }}
        parentLabelPosition="left"
        parentLabelTextColor={{
          from: "color",
          modifiers: [
            [
              "darker",
              2
            ]
          ]
        }}
        colors={{ scheme: "nivo" }}
        borderColor={{
          from: "color",
          modifiers: [
            [
              "darker",
              0.1
            ]
          ]
        }}
      />
    </div>
  );
};

export default Farm;
