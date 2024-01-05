import React, {useContext, useEffect, useState} from "react";

import {DataContext} from "../../contexts/DataContext";
import DataPlaceholder from "../../components/DataPlaceholder";
import FilterField from "../../components/FilterField";
import Widget from "./Widget";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import styles from "./Licenses.module.css";
import { useResizeDetector } from "react-resize-detector";

const COLUMNS = [
  {
    field: "app",
    headerName: "App",
    width: 80
  },
  {
    field: "free",
    headerName: "Free",
    type: "number",
    flex: 0.5
  },
  {
    field: "total",
    headerName: "Total",
    type: "number",
    flex: 0.5
  }
];

const userColumn = {
  field: "user",
  headerName: "Artist",
  flex: 0.9
};

const wsColumn = {
  field: "ws",
  headerName: "WS",
  flex: 0.6
};

const Licenses = props => {
  const [mounted, setMounted] = useState(false);
  const {width, ref} = useResizeDetector();
  const {licenses} = useContext(DataContext);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const title = widgetConfig.title;
  const setTitle = value => handleConfigEdit("title", value);

  const defaultConfig = {
    selected: "",
    filterValue: "",
    title: "Licenses"
  };

  useEffect(() => {
    setMounted(true);
    const savedConfig = loadFromLS(props.rglKey) || {...defaultConfig};
    setWidgetConfig(savedConfig);
  }, []);

  const handleConfigEdit = (key, value) => {
    setWidgetConfig(prev => {
      const existing = {...prev};
      existing[key] = value;
      saveToLS(props.rglKey, existing);
      return existing;
    });
  };

  const columns = [...COLUMNS];
  if (width > 250) columns.splice(1, 0, userColumn);
  if (width > 400) columns.splice(2, 0, wsColumn);

  const data = licenses.data?.map((d, i) => ({id: i, ...d})).filter(
    d => (d.app + d.user + d.ws).includes(filterValue)
  ) || [];

  const Settings = <>
    <TextField
      label="Widget name"
      value={title}
      onChange={e => setTitle(e.target.value)}
      size="small"
    />
  </>;

  return (
    <Widget
      settings={Settings}
      settingsOpen={settingsOpen}
      setSettingsOpen={setSettingsOpen}
      title={title}
      onRemove={props.onRemove}
      rglKey={props.rglKey}
    >
      <div className={styles.container} ref={ref}>
        <FilterField filterValue={filterValue} setFilterValue={setFilterValue} />
        <div className={styles.table}>
          <DataGrid
            rows={data}
            columns={columns}
            disableSelectionOnClick
            headerHeight={30}
            hideFooter
            disableColumnMenu
            rowHeight={25}
            components={{
              NoRowsOverlay: () => <DataPlaceholder text="No data" />
            }}
          />
        </div>
      </div>
    </Widget>
  );
};

export default Licenses;
