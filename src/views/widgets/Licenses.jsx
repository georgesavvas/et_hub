import React from "react";

import DataPlaceholder from "../../components/DataPlaceholder";
import { DataGrid } from "@mui/x-data-grid";

import styles from "./Licenses.module.css";


const columns = [
  {
    field: "app",
    headerName: "App"
  },
  {
    field: "artist",
    headerName: "Artist"
  },
  {
    field: "ws",
    headerName: "Workstation"
  },
  {
    field: "available",
    headerName: "Available",
    type: "number"
  },
  {
    field: "total",
    headerName: "Total",
    type: "number"
  }
];

const data = [
  {
    id: 0,
    app: "houdinicore",
    artist: "george",
    ws: "ws20",
    available: 3,
    total: 20
  },
  {
    id: 1,
    app: "houdinicore",
    artist: "george",
    ws: "ws20",
    available: 3,
    total: 20
  },
  {
    id: 2,
    app: "houdinicore",
    artist: "george",
    ws: "ws20",
    available: 3,
    total: 20
  },
  {
    id: 3,
    app: "houdinicore",
    artist: "george",
    ws: "ws20",
    available: 3,
    total: 20
  }
];

const Licenses = () => {

  return (
    <div className={styles.container}>
      <DataGrid
        rows={data}
        columns={columns}
        disableSelectionOnClick
        headerHeight={30}
        hideFooter
        rowHeight={25}
        components={{
          NoRowsOverlay: () => <DataPlaceholder text="No data" />
        }}
      />
    </div>
  );
};

export default Licenses;
