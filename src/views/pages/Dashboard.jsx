import React, {useState, useEffect} from "react";

import styles from "./Dashboard.module.css";
import RGL, { WidthProvider } from "react-grid-layout";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import Widget from "../widgets/Widget";
import { Button } from "@mui/material";

// import "./Dashboard.module.css";

const ReactGridLayout = WidthProvider(RGL);

const defaultLayout = [
  {i: "widget_0", x: 0, y: 0, w: 4, h: 2, isResizable: true, resizeHandles: ["se"]},
  {i: "widget_1", x: 0, y: 1, w: 2, h: 1, isResizable: true},
  {i: "widget_2", x: 2, y: 1, w: 2, h: 1, isResizable: true},
];

const style = {
  height: "100%",
  width: "100%",
  backgroundColor: "grey"
};

const Dashboard = () => {
  const [layout, setLayout] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLayout = loadFromLS("layout") || defaultLayout;
    setLayout(savedLayout);
  }, []);

  const handleLayoutChange = newLayout => {
    saveToLS("layout", newLayout);
  };

  const handleDrop = (layout, layoutItem, e) => {
    const view_type = e.dataTransfer.getData("hub_view");
    console.log(view_type);
    if (view_type == "") {
      return(false);
    }
    const x = layout.length;
    layout[x-1].i = view_type + "_" + x;
    setLayout(layout);
    saveToLS("layout", layout);
  };

  const margin = window.innerHeight / 100;
  const row_height = window.innerHeight / 7.5 - margin;

  const handleResetLayout = () => setLayout(defaultLayout);

  return (
    <div className={styles.container}>
      <div>
        <Button onClick={handleResetLayout} variant="outlined">
          Reset Layout
        </Button>
      </div>
      <ReactGridLayout
        layout={layout}
        onLayoutChange={handleLayoutChange}
        // droppingItem={{i: "yourbox", w: 1, h: 1}}
        onDrop={handleDrop}
        // isDroppable={true}
        rowHeight={row_height}
        margin={[margin, margin]}
        cols={4}
        compactType={"vertical"}
        // draggableHandle=".dragHandle"
        measureBeforeMount={false}
        useCSSTransforms={mounted}
      >
        {layout.map(w =>
          <div key={w.i} style={style} data-grid={w}>
            {/* <Widget title={w.i} /> */}
          </div>,
        )}
      </ReactGridLayout>
    </div>
  );
};

export default Dashboard;
