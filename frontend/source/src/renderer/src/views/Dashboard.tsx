import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import {
  Button,
  Col,
  Divider,
  Input,
  InputNumber,
  Row,
  Slider,
  Space,
  Switch,
  Typography,
  message,
} from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import React, { useContext, useEffect, useState } from "react";

import CodeEditor from "@uiw/react-textarea-code-editor";
import { ConfigContext } from "../contexts/ConfigContext";
import WIDGETS from "./widgets";
import _ from "lodash";
import loadFromLS from "../utils/loadFromLS";
import saveToLS from "../utils/saveToLS";
import serverRequest from "../services/serverRequest";
import styles from "./Dashboard.module.css";

const { Text } = Typography;

const RGL = WidthProvider(GridLayout);

const getNewWidgetId = (widgets, type) => {
  const existing = widgets.map((w) => w.i);
  let index = 0;
  while (existing.includes(`${type}_${index}`)) {
    index++;
  }
  return `${type}_${index}`;
};

const Dashboard = () => {
  const {
    layout,
    setLayout,
    layoutEditable,
    setLayoutEditable,
    resetLayout,
    user,
    selectedLayout,
    setSelectedLayout,
    layouts,
  } = useContext(ConfigContext);
  const [mounted, setMounted] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [overwriteLoading, setOverwriteLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const { rows, columns } = layout;

  const setLayoutKey = (key, value) => {
    setLayout((prev) => ({ ...prev, [key]: value }));
  };

  const setWidgetConfigKey = (id, key, value) => {
    setLayout((prev) => {
      const existing = { ...prev };
      // if (!existing.widgets[index].config) existing.widgets[index].config = {};
      existing.config[id][key] = value;
      return existing;
    });
  };

  const topBarStyle = {
    minHeight: layoutEditable ? "50px" : 0,
    maxHeight: layoutEditable ? "50px" : 0,
    padding: layoutEditable ? "5px 15px 0 15px" : 0,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLayoutChange = (widgets) => {
    const newLayout = { ...layout, widgets: widgets };
    setLayout(newLayout);
    saveToLS("layout", newLayout);
  };

  const handleDrop = (currentWidgets, item, e) => {
    const widgetType = e.dataTransfer.getData("text/hub_view");
    if (widgetType == "") return;
    const widget = WIDGETS[widgetType];
    if (!widget) {
      console.log("Unknown widget type", widgetType);
      return;
    }
    const x = currentWidgets.length;
    const id = getNewWidgetId(currentWidgets, widgetType);
    const newWidget = {
      i: id,
      x: item.x,
      y: item.y,
      w: widget.w,
      h: widget.h,
    };
    currentWidgets[x - 1] = newWidget;
    const newLayout = {
      ...layout,
      widgets: currentWidgets,
      config: { ...layout.config, [id]: _.cloneDeep(widget.config) },
    };
    setLayout(newLayout);
    saveToLS("layout", newLayout);
  };

  const handleRemoveWidget = (i) => {
    const newWidgets = layout.widgets.filter((w) => w.i != i);
    const newLayout = { ...layout, widgets: newWidgets };
    setLayout(newLayout);
    saveToLS("layout", layout);
  };

  const margin = 10;
  const rowHeight = (window.innerHeight - (layoutEditable ? 50 : 0) - margin * (rows + 1)) / rows;

  const handleDropDragOver = (e) => {
    const data = e.dataTransfer.types.filter((d) => d.includes("/hub_view/"));
    if (!data.length) return;
    const widgetType = data[0].split("/").at(-1);
    if (!widgetType) return;
    const widget = WIDGETS[widgetType];
    if (!widget) {
      console.log("Unknown widget type", widgetType);
      return;
    }
    return {
      w: widget.w,
      h: widget.h,
    };
  };

  const handleDragStart = (layout, oldItem, newItem, placeholder, e) => e.preventDefault();
  const handleResizeStart = (layout, oldItem, newItem, placeholder, e) => e.preventDefault();

  const handleLayoutOverwrite = () => {
    const data = {
      layout_id: selectedLayout,
      user: user,
      layout: layout,
    };
    serverRequest("create_layout", data, "api/v2").then((resp) => {
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
      setLayoutEditable(false);
    });
  };

  const handleLayoutSave = () => {
    const data = {
      user: user,
      layout: layout,
    };
    serverRequest("create_layout", data, "api/v2").then((resp) => {
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
      setLayoutEditable(false);
    });
  };

  const layoutEqual = _.isEqual(layout, layouts[selectedLayout]?.data);
  const overwriteDisabled = !layout.name || layouts[selectedLayout]?.user !== user || layoutEqual;
  const saveDisabled = !layout.name || layoutEqual;

  return (
    <div className={styles.container}>
      {contextHolder}
      <div className={styles.topBar} style={topBarStyle}>
        <Text>Rows</Text>
        <Slider
          min={2}
          max={12}
          style={{ flexGrow: 1, maxWidth: 200 }}
          value={rows}
          onChange={(value) => setLayoutKey("rows", value)}
        />
        <InputNumber
          min={2}
          max={12}
          style={{ width: "60px", margin: "0 4px" }}
          value={rows}
          onChange={(value) => setLayoutKey("rows", value)}
        />
        <Divider type="vertical" />
        <Text>Columns</Text>
        <Slider
          min={2}
          max={12}
          style={{ flexGrow: 1, maxWidth: 200 }}
          value={columns}
          onChange={(value) => setLayoutKey("columns", value)}
        />
        <InputNumber
          min={2}
          max={12}
          style={{ width: "60px", margin: "0 4px" }}
          value={columns}
          onChange={(value) => setLayoutKey("columns", value)}
        />
        <Divider type="vertical" />
        <Input
          placeholder="Layout Name"
          style={{ width: "fit-content" }}
          value={layout.name}
          onChange={(e) => setLayoutKey("name", e.target.value)}
        />
        <Divider type="vertical" />
        <Switch value={layout.public} onChange={(value) => setLayoutKey("public", value)} />
        <Text onClick={() => setLayoutKey("public", !layout.public)} style={{ cursor: "pointer" }}>
          Make public
        </Text>
        <Divider type="vertical" />
        <Button onClick={() => resetLayout()}>Reset to default</Button>
        <Button onClick={() => resetLayout(true)}>Reset to last saved</Button>
        <Button
          type="primary"
          loading={overwriteLoading}
          disabled={overwriteDisabled}
          onClick={handleLayoutOverwrite}
        >
          Overwrite
        </Button>
        <Button
          type="primary"
          loading={saveLoading}
          disabled={saveDisabled}
          onClick={handleLayoutSave}
        >
          Save as new
        </Button>
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
        style={{ height: "100%", width: "100%" }}
        resizeHandles={layoutEditable ? ["s", "se", "n", "e"] : []}
      >
        {layout.widgets?.map((w) => {
          const widgetType = w.i.split("_")[0];
          if (!widgetType || !(widgetType in WIDGETS)) {
            return <div key={w.i} />;
          }
          const SelectedWidget = WIDGETS[widgetType].component;
          return (
            <div key={w.i}>
              <SelectedWidget
                rglKey={w.i}
                config={layout.config[w.i] || {}}
                setConfig={(key, value) => setWidgetConfigKey(w.i, key, value)}
                onRemove={handleRemoveWidget}
              />
            </div>
          );
        })}
      </RGL>
    </div>
  );
};

export default Dashboard;
