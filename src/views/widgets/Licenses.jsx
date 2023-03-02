import React, {useState, useContext} from "react";

import DataPlaceholder from "../../components/DataPlaceholder";
import FilterField from "../../components/FilterField";
import { DataGrid } from "@mui/x-data-grid";

import styles from "./Licenses.module.css";
import {DataContext} from "../../contexts/DataContext";


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
  const {licenses} = useContext(DataContext);
  const [filterValue, setFilterValue] = useState("");

  const columns = [...COLUMNS];
  if (props.size[0] > 250) columns.splice(1, 0, userColumn);
  if (props.size[0] > 400) columns.splice(2, 0, wsColumn);

  const data = licenses.data?.map((d, i) => ({id: i, ...d})).filter(
    d => (d.app + d.user + d.ws).includes(filterValue)
  ) || [];

  return (
    <div className={styles.container}>
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
  );
};

export default Licenses;