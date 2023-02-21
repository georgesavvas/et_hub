import React, {useState, useEffect} from "react";
import DataPlaceholder from "../../components/DataPlaceholder";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import debounce from "lodash.debounce";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";

import styles from "./Notes.module.css";


const debounced = debounce(fn => fn(), 500);

const Notes = () => {
  const [first, setFirst] = useState(true);
  const [value, setValue] = useState();

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

  return (
    <div className={styles.container}>
      {!value || value === "<p><br></p>" ? <DataPlaceholder text="Notes" /> : null}
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
  );
};

export default Notes;
