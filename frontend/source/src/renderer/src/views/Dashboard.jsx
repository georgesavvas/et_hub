import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { Button, Col, Divider, Input, InputNumber, Row, Slider, Space, Switch, Typography } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import React, {useContext, useEffect, useState} from "react";

// import {Button, DialogTitle, Slider, Typography} from "@mui/material";
// import Settings from "@mui/icons-material/Settings";
// import Modal from "../components/Modal";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { ConfigContext } from "../contexts/ConfigContext";
// import Support from "./widgets/Support";
import Projects from "./widgets/Projects";
import Widget from "./widgets/Widget";
// import Farm from "./widgets/Farm/Farm";
import loadFromLS from "../utils/loadFromLS";
import saveToLS from "../utils/saveToLS";
import styles from "./Dashboard.module.css";

// import Workstation from "./widgets/Workstation";
// import Wiki from "./widgets/Wiki";
// import Apps from "./widgets/Apps";
// import Todo from "./widgets/Todo";
// import Notes from "./widgets/Notes";
// import Licenses from "./widgets/Licenses";

const { Text } = Typography;

// const widgets = {};
const widgets = {
  projects: Projects,
  // workstation: Workstation,
  // farm: Farm,
  // support: Support,
  // wiki: Wiki,
  // apps: Apps,
  // todo: Todo,
  // notes: Notes,
  // licenses: Licenses
};

const RGL = WidthProvider(GridLayout);

// const defaultLayout = [
//   {
//     "w": 4,
//     "h": 2,
//     "x": 2,
//     "y": 1,
//     "i": "projects_1"
//   },
//   {
//     "w": 2,
//     "h": 1,
//     "x": 6,
//     "y": 0,
//     "i": "workstation_2"
//   },
//   {
//     "w": 2,
//     "h": 2,
//     "x": 0,
//     "y": 0,
//     "i": "licenses_3"
//   },
//   {
//     "w": 4,
//     "h": 3,
//     "x": 2,
//     "y": 3,
//     "i": "farm_4"
//   },
//   {
//     "w": 2,
//     "h": 3,
//     "x": 6,
//     "y": 1,
//     "i": "todo_5"
//   },
//   {
//     "w": 2,
//     "h": 2,
//     "x": 6,
//     "y": 4,
//     "i": "notes_6"
//   },
//   {
//     "w": 4,
//     "h": 1,
//     "x": 2,
//     "y": 0,
//     "i": "apps_7"
//   },
//   {
//     "w": 2,
//     "h": 2,
//     "x": 0,
//     "y": 2,
//     "i": "wiki_8"
//   },
//   {
//     "w": 2,
//     "h": 2,
//     "x": 0,
//     "y": 4,
//     "i": "support_9"
//   }
// ];

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

  // const modalButtons = [
  //   <Button key="close" onClick={props.onClose} size="small"
  //     variant="outlined" color="error">
  //     Cancel
  //   </Button>,
  //   ...props.buttons,
  //   <Button key="confirm" onClick={handleConfirm} size="small"
  //     variant="outlined" color="success">
  //     Confirm
  //   </Button>
  // ];

  return (
    <div />
    // <Modal title="Dashboard Settings" open={props.open} onClose={props.onClose}
    //   fullHeight buttons={modalButtons}>
    //   <DialogTitle>Layout</DialogTitle>
    //   <div className={styles.settingsColumn}>
    //     <div className={styles.settingsRow}>
    //       <Typography>Rows</Typography>
    //       <Slider
    //         size="small"
    //         valueLabelDisplay="auto"
    //         step={1}
    //         marks
    //         min={4}
    //         max={16}
    //         value={rows}
    //         onChange={e => setRows(e.target.value)}
    //       />
    //     </div>
    //     <div className={styles.settingsRow}>
    //       <Typography>Columns</Typography>
    //       <Slider
    //         size="small"
    //         valueLabelDisplay="auto"
    //         step={1}
    //         marks
    //         min={4}
    //         max={12}
    //         value={columns}
    //         onChange={e => setColumns(e.target.value)}
    //       />
    //     </div>
    //   </div>
    //   <DialogTitle>Widget Config</DialogTitle>
    //   <CodeEditor
    //     value={layoutCode}
    //     language="js"
    //     onChange={e => setLayoutCode(e.target.value)}
    //     padding={15}
    //     data-color-mode="dark"
    //     style={{
    //       fontSize: 12
    //     }}
    //   />
    // </Modal>
  );
};

const Dashboard = () => {
  const {layout, setLayout, layoutEditable, rows, setRows, columns, setColumns, resetLayout}  = useContext(ConfigContext);
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const topBarStyle = {
    minHeight: layoutEditable ? "50px" : 0,
    maxHeight: layoutEditable ? "50px" : 0,
    padding: layoutEditable ? "5px 15px 0 15px" : 0,
  };

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
    const widgetType = e.dataTransfer.getData("text/hub_view");
    if (widgetType == "") return;
    const x = layout.length;
    const defaultSize = defaultSizes[widgetType];
    const widget = {
      i: widgetType + "_" + x,
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
  const rowHeight = (window.innerHeight - (layoutEditable ? 50 : 0) - margin * (rows + 1)) / rows;

  const handleDropDragOver = e => {
    const data = e.dataTransfer.types.filter(d => d.includes("/hub_view/"));
    if (!data.length) return;
    console.log(data);
    const widgetType = data[0].split("/").at(-1);
    const defaultSize = defaultSizes[widgetType];
    if (!widgetType || !defaultSize) return;
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
      <div className={styles.topBar} style={topBarStyle}>
        <Text>Rows</Text>
        <Slider min={2} max={12} style={{flexGrow: 1, maxWidth: 200}} value={rows} onChange={setRows} />
        <InputNumber min={2} max={12} style={{ width: "60px", margin: "0 4px" }} value={rows} onChange={setRows} />
        <Divider type="vertical" />
        <Text>Columns</Text>
        <Slider min={2} max={12} style={{flexGrow: 1, maxWidth: 200}} value={columns} onChange={setColumns} />
        <InputNumber min={2} max={12} style={{ width: "60px", margin: "0 4px" }} value={columns} onChange={setColumns} />
        <Divider type="vertical" />
        <Input placeholder="Layout Name" style={{width: "fit-content"}} />
        <Divider type="vertical" />
        <Switch />
        <Text>Make public</Text>
        <Divider type="vertical" />
        <Button onClick={resetLayout}>Reset to default</Button>
        <Button onClick={resetLayout}>Reset to last saved</Button>
        <Button style={{width: "100px"}} type="primary">Save</Button>
      </div>
      <RGL
        layout={layout}
        onLayoutChange={handleLayoutChange}
        onDropDragOver={handleDropDragOver}
        onDrop={handleDrop}
        isDroppable={layoutEditable}
        rowHeight={rowHeight}
        margin={[margin, margin]}
        cols={columns}
        autoSize={false}
        measureBeforeMount={true}
        useCSSTransforms={mounted}
        isBounded={true}
        onDragStart={handleDragStart}
        onResizeStart={handleResizeStart}
        compactType="vertical"
        isDraggable={layoutEditable}
        isResizable={layoutEditable}
        style={{height: "100%", width: "100%"}}
        resizeHandles={layoutEditable ? ["s", "se", "n", "ne", "e"] : []}
      >
        {layout.map(w => {
          const widgetType = w.i.split("_")[0];
          if (!widgetType || !(widgetType in widgets)) {
            return <div key={w.i} />;
          }
          const SelectedWidget = widgets[widgetType];
          return (
            <div key={w.i}>
              <SelectedWidget rglKey={w.i} onRemove={handleRemoveWidget} />
            </div>
          );
        })}
      </RGL>
    </div>
  );
};

export default Dashboard;
