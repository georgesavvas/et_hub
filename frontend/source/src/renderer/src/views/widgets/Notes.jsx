import React, {useState, useEffect} from "react";
import DataPlaceholder from "../../components/DataPlaceholder";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import debounce from "lodash.debounce";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import Widget from "./Widget";
import {Typography, TextField} from "@mui/material";

import styles from "./Notes.module.css";


const debounced = debounce(fn => fn(), 500);

const Notes = props => {
  const [mounted, setMounted] = useState(false);
  const [first, setFirst] = useState(true);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [value, setValue] = useState();
  const title = widgetConfig.title;
  const setTitle = value => handleConfigEdit("title", value);

  const defaultConfig = {
    selected: "",
    filterValue: "",
    title: "Notes"
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

  useEffect(() => {
    setValue(loadFromLS("widget_notes"));
    setFirst(false);
  }, []);

  useEffect(() => {
    if (first) return;
    debounced(
      () => saveToLS("widget_notes", value)
    );
  }, [value]);

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
      <div className={styles.container}>
        {!value || value === "<p><br></p>" ?
          <DataPlaceholder text="Start scribbling..." />
          : null
        }
        <ReactQuill
          theme="bubble"
          value={value}
          // onBlur={(range, source, quill) => setValue(quill.getHTML())}
          onChange={setValue}
          // modules={modules}
          style={{
            background: "rgb(30, 30, 30)",
            height: "100%"
            // resize: "vertical",
            // border:null
          }}
        />
      </div>
    </Widget>
  );
};

export default Notes;
