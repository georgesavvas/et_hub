import React, {useState, useEffect} from "react";

import styles from "./Dashboard.module.css";
import GridLayout, {WidthProvider} from "react-grid-layout";
import loadFromLS from "../utils/loadFromLS";
import saveToLS from "../utils/saveToLS";
import Widget from "./widgets/Widget";
import {Button} from "@mui/material";
import Settings from "@mui/icons-material/Settings";

import "/node_modules/react-grid-layout/css/styles.css";


const RGL = WidthProvider(GridLayout);

const defaultLayout = [
  {i: "apps_0", x: 0, y: 0, w: 4, h: 2},
  {i: "farm_0", x: 0, y: 1, w: 2, h: 1},
  {i: "projects_0", x: 2, y: 1, w: 2, h: 1},
];

const Dashboard = () => {
  const [layout, setLayout] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLayout = loadFromLS("layout") || [...defaultLayout];
    setLayout(savedLayout);
  }, []);

  const handleLayoutChange = newLayout => {
    setLayout(newLayout);
    saveToLS("layout", newLayout);
  };

  const handleDrop = (layout, layoutItem, e) => {
    const view_type = e.dataTransfer.getData("hub_view");
    if (view_type == "") return;
    const x = layout.length;
    layout[x-1].i = view_type + "_" + x;
    setLayout(layout);
    saveToLS("layout", layout);
  };

  const columns = 4;
  const margin = 10;
  const rowHeight = window.innerHeight / 7.5;

  const handleResetLayout = () => setLayout(defaultLayout);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Button onClick={handleResetLayout} variant="outlined" color="secondary" size="small">
          Reset Layout
        </Button>
        <Settings className={styles.settingsButton} />
      </div>
      <RGL
        layout={layout}
        onLayoutChange={handleLayoutChange}
        width={1200}
        onDrop={handleDrop}
        isDroppable={true}
        rowHeight={rowHeight}
        margin={[margin, margin]}
        cols={columns}
        compactType={"vertical"}
        draggableHandle=".dragHandle"
        measureBeforeMount={false}
        useCSSTransforms={mounted}
        isBounded
      >
        {layout.map(w => 
          <div key={w.i}>
            <Widget widget={w.i.split("_")[0]} rglKey={w.i} />
          </div>
        )}
      </RGL>
    </div>
  );
};

export default Dashboard;
