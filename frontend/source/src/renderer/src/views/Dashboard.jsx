import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { Button, Col, Divider, Input, InputNumber, Row, Slider, Space, Switch, Typography, message } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import React, {useContext, useEffect, useState} from "react";

import CodeEditor from "@uiw/react-textarea-code-editor";
import { ConfigContext } from "../contexts/ConfigContext";
import _ from "lodash";
import loadFromLS from "../utils/loadFromLS";
import saveToLS from "../utils/saveToLS";
import serverRequest from "../services/serverRequest";
import styles from "./Dashboard.module.css";
import widgetsList from "./widgets";

const { Text } = Typography;

const RGL = WidthProvider(GridLayout);

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
  const {layout, setLayout, layoutEditable, resetLayout, appLook, user, setAppLook, selectedLayout, setSelectedLayout, layouts}  = useContext(ConfigContext);
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [overwriteLoading, setOverwriteLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const {rows, columns} = layout;

  const setLayoutKey = (key, value) => {
    setLayout((prev) => ({ ...prev, [key]: value }));
  };

  const topBarStyle = {
    minHeight: layoutEditable ? "50px" : 0,
    maxHeight: layoutEditable ? "50px" : 0,
    padding: layoutEditable ? "5px 15px 0 15px" : 0,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLayoutChange = widgets => {
    const newLayout = {...layout, widgets: widgets};
    setLayout(newLayout);
    saveToLS("layout", newLayout);
  };

  const handleDrop = (widgets, item, e) => {
    const widgetType = e.dataTransfer.getData("text/hub_view");
    if (widgetType == "") return;
    const x = widgets.length;
    const defaultSize = defaultSizes[widgetType];
    const widget = {
      i: widgetType + "_" + x,
      x: item.x,
      y: item.y,
      w: defaultSize.w,
      h: defaultSize.h
    };
    widgets[x - 1] = widget;
    const newLayout = {...layout, widgets: widgets};
    setLayout(newLayout);
    saveToLS("layout", newLayout);
  };

  const handleRemoveWidget = i => {
    const newWidgets = layout.filter(w => w.i != i);
    const newLayout = {...layout, widgets: newWidgets};
    setLayout(newLayout);
    saveToLS("layout", layout);
  };

  const margin = 10;
  const rowHeight = (window.innerHeight - (layoutEditable ? 50 : 0) - margin * (rows + 1)) / rows;

  const handleDropDragOver = e => {
    const data = e.dataTransfer.types.filter(d => d.includes("/hub_view/"));
    if (!data.length) return;
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

  const handleLayoutOverwrite = () => {
    const data = {
      layout_id: selectedLayout,
      user: user,
      layout: layout,
    };
    serverRequest("create_layout", data, "api/v2").then(resp => {
      setOverwriteLoading(true);
      setSelectedLayout(resp.data);
      if (resp.ok) {
        messageApi.open({
          type: "success",
          content: "Layout saved",
        });
      } else {
        messageApi.open({
          type: "error",
          content: "Error saving layout",
        });
      }
      setOverwriteLoading(false);
    });
  };

  const handleLayoutSave = () => {
    const data = {
      user: user,
      layout: layout,
    };
    serverRequest("create_layout", data, "api/v2").then(resp => {
      setSaveLoading(true);
      setSelectedLayout(resp.data);
      if (resp.ok) {
        messageApi.open({
          type: "success",
          content: "Layout saved",
        });
      } else {
        messageApi.open({
          type: "error",
          content: "Error saving layout",
        });
      }
      setSaveLoading(false);
    });
  };

  const layoutEqual = _.isEqual(layout, layouts[selectedLayout]?.data)
  const overwriteDisabled = !layout.name || layouts[selectedLayout]?.user !== user || layoutEqual;
  const saveDisabled = !layout.name || layoutEqual;

  return (
    <div className={styles.container}>
      {contextHolder}
      <div className={styles.topBar} style={topBarStyle}>
        <Text>Rows</Text>
        <Slider min={2} max={12} style={{flexGrow: 1, maxWidth: 200}} value={rows} onChange={(value) => setLayoutKey("rows", value)} />
        <InputNumber min={2} max={12} style={{ width: "60px", margin: "0 4px" }} value={rows} onChange={(value) => setLayoutKey("rows", value)} />
        <Divider type="vertical" />
        <Text>Columns</Text>
        <Slider min={2} max={12} style={{flexGrow: 1, maxWidth: 200}} value={columns} onChange={(value) => setLayoutKey("columns", value)} />
        <InputNumber min={2} max={12} style={{ width: "60px", margin: "0 4px" }} value={columns} onChange={(value) => setLayoutKey("columns", value)} />
        <Divider type="vertical" />
        <Input placeholder="Layout Name" style={{width: "fit-content"}} value={layout.name} onChange={e => setLayoutKey("name", e.target.value)} />
        <Divider type="vertical" />
        <Switch value={layout.public} onChange={(value) => setLayoutKey("public", value)} />
        <Text onClick={() => setLayoutKey("public", !layout.public)} style={{cursor: "pointer"}}>Make public</Text>
        <Divider type="vertical" />
        <Button onClick={() => resetLayout()}>Reset to default</Button>
        <Button onClick={() => resetLayout(true)}>Reset to last saved</Button>
        <Button type="primary" loading={overwriteLoading} disabled={overwriteDisabled} onClick={handleLayoutOverwrite}>Overwrite</Button>
        <Button type="primary" loading={saveLoading} disabled={saveDisabled} onClick={handleLayoutSave}>Save as new</Button>
      </div>
      <RGL
        layout={layout.widgets}
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
        {layout.widgets?.map(w => {
          const widgetType = w.i.split("_")[0];
          if (!widgetType || !(widgetType in widgetsList)) {
            return <div key={w.i} />;
          }
          const SelectedWidget = widgetsList[widgetType];
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
