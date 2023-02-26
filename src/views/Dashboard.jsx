import React, {useState, useEffect} from "react";

import styles from "./Dashboard.module.css";
import GridLayout, {WidthProvider} from "react-grid-layout";
import loadFromLS from "../utils/loadFromLS";
import saveToLS from "../utils/saveToLS";
import Widget from "./widgets/Widget";
import {Button, DialogTitle, Slider, TextField, Typography} from "@mui/material";
import Settings from "@mui/icons-material/Settings";
import Modal from "../components/Modal";
import CodeEditor from "@uiw/react-textarea-code-editor";


import "/node_modules/react-grid-layout/css/styles.css";


const RGL = WidthProvider(GridLayout);

const defaultLayout = [
  {
    "w": 5,
    "h": 2,
    "x": 1,
    "y": 1,
    "i": "projects_1",
  },
  {
    "w": 2,
    "h": 1,
    "x": 6,
    "y": 0,
    "i": "workstation_2"
  },
  {
    "w": 1,
    "h": 3,
    "x": 0,
    "y": 1,
    "i": "licenses_3"
  },
  {
    "w": 5,
    "h": 3,
    "x": 1,
    "y": 3,
    "i": "farm_4"
  },
  {
    "w": 2,
    "h": 2,
    "x": 6,
    "y": 1,
    "i": "todo_5"
  },
  {
    "w": 2,
    "h": 3,
    "x": 6,
    "y": 3,
    "i": "notes_6"
  },
  {
    "w": 2,
    "h": 1,
    "x": 0,
    "y": 0,
    "i": "apps_7"
  },
  {
    "w": 4,
    "h": 1,
    "x": 2,
    "y": 0,
    "i": "wiki_8"
  },
  {
    "w": 1,
    "h": 2,
    "x": 0,
    "y": 4,
    "i": "support_9"
  }
];

const defaultSizes = {
  apps: {w: 3, h: 1},
  projects: {w: 4, h: 2},
  workstation: {w: 2, h: 1},
  farm: {w: 4, h: 2},
  support: {w: 2, h: 4},
  wiki: {w: 2, h: 2},
  todo: {w: 2, h: 3},
  notes: {w: 2, h: 3},
  licenses: {w: 2, h: 4},
  rundeck: {w: 1, h: 2}
};

const DashboardSettings = props => {
  const [layoutCode, setLayoutCode] = useState("");
  const [rows, setRows] = useState();
  const [columns, setColumns] = useState();

  useEffect(() => {
    setLayoutCode(JSON.stringify(props.layout, null, 4));
    setRows(props.rows);
    setColumns(props.columns);
  }, [props.layout, props.rows, props.columns]);

  const handleConfirm = () => {
    const json = JSON.parse(layoutCode);
    props.setLayout(json);
    props.setRows(rows);
    props.setColumns(columns);
    props.onClose();
  };

  const modalButtons = [
    <Button key="close" onClick={props.onClose} size="small"
      variant="outlined" color="error">
      Cancel
    </Button>,
    ...props.buttons, 
    <Button key="confirm" onClick={handleConfirm} size="small"
      variant="outlined" color="success">
      Confirm
    </Button>
  ];

  return (
    <Modal title="Dashboard Settings" open={props.open} onClose={props.onClose}
      fullHeight buttons={modalButtons}>
      <DialogTitle>Layout</DialogTitle>
      <div className={styles.settingsColumn}>
        <div className={styles.settingsRow}>
          <Typography>Rows</Typography>
          <Slider
            size="small"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={4}
            max={16}
            value={rows}
            onChange={e => setRows(e.target.value)}
          />
        </div>
        <div className={styles.settingsRow}>
          <Typography>Columns</Typography>
          <Slider
            size="small"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={4}
            max={12}
            value={columns}
            onChange={e => setColumns(e.target.value)}
          />
        </div>
      </div>
      <DialogTitle>Widget Config</DialogTitle>
      <CodeEditor
        value={layoutCode}
        language="js"
        onChange={e => setLayoutCode(e.target.value)}
        padding={15}
        data-color-mode="dark"
        style={{
          fontSize: 12
        }}
      />
    </Modal>
  );
};

const Dashboard = () => {
  const [layout, setLayout] = useState([]);
  const [rows, setRows] = useState(6);
  const [columns, setColumns] = useState(8);
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLayout = loadFromLS("layout") || [...defaultLayout];
    setLayout(savedLayout);
  }, []);


  const handleOpenSettings = () => setSettingsOpen(true);
  const handleCloseSettings = () => setSettingsOpen(false);

  const handleLayoutChange = newLayout => {
    setLayout(newLayout);
    saveToLS("layout", newLayout);
  };

  const handleDrop = (layout, layoutItem, e) => {
    const view_type = e.dataTransfer.getData("text/hub_view");
    if (view_type == "") return;
    const x = layout.length;
    const defaultSize = defaultSizes[view_type];
    const widget = {
      i: view_type + "_" + x,
      x: layoutItem.x,
      y: layoutItem.y,
      w: defaultSize.w,
      h: defaultSize.h
    };
    layout[x - 1] = widget;
    setLayout(layout);
    saveToLS("layout", layout);
  };

  const handleRemoveWidget = i => {
    const newLayout = layout.filter(w => w.i != i);
    setLayout(newLayout);
    saveToLS("layout", layout);
  };

  const margin = 10;
  const rowHeight = (window.innerHeight - 50 - margin * (rows + 1)) / rows;

  const handleResetLayout = () => {
    setLayout(defaultLayout);
    setRows(6);
    setColumns(8);
  };

  const handleDropDragOver = e => {
    const data = e.dataTransfer.types.filter(d => d.includes("/hub_view/"));
    if (!data.length) return;
    const view_type = data[0].split("/").at(-1);
    const defaultSize = defaultSizes[view_type];
    if (!view_type || !defaultSize) return;
    const widget = {
      w: defaultSize.w,
      h: defaultSize.h
    };
    return widget;
  };

  const handleDragStart = (layout, oldItem, newItem, placeholder, e) =>
    e.preventDefault();
  const handleResizeStart = (layout, oldItem, newItem, placeholder, e) =>
    e.preventDefault();

  return (
    <div className={styles.container}>
      <DashboardSettings open={settingsOpen} onClose={handleCloseSettings}
        layout={layout} setLayout={setLayout} rows={rows} setRows={setRows}
        columns={columns} setColumns={setColumns}
        buttons={[
          <Button key="reset" onClick={handleResetLayout} size="small"
            variant="outlined" color="warning">
            Reset Layout
          </Button>
        ]} />
      <div className={styles.top}>
        <Button onClick={handleResetLayout} variant="outlined" color="secondary"
          size="small">
          Reset Layout
        </Button>
        <Settings className={styles.settingsButton}
          onClick={handleOpenSettings} />
      </div>
      <div>
        <RGL
          layout={layout}
          onLayoutChange={handleLayoutChange}
          width={1200}
          onDropDragOver={handleDropDragOver}
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
          // resizeHandles={["se", "sw"]}
          onDragStart={handleDragStart}
          onResizeStart={handleResizeStart}
        >
          {layout.map(w => 
            <div key={w.i}>
              <Widget widget={w.i.split("_")[0]} rglKey={w.i} onRemove={handleRemoveWidget} />
            </div>
          )}
        </RGL>
      </div>
    </div>
  );
};

export default Dashboard;
