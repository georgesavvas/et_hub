import React, {useState, useEffect} from "react";

import DataPlaceholder from "../../components/DataPlaceholder";
import { DataGrid } from "@mui/x-data-grid";
import {ResponsiveWaffle} from "@nivo/waffle";

import styles from "./Licenses.module.css";
import { Divider, Typography } from "@mui/material";


const columns = [
  {
    field: "app",
    headerName: "App",
    width: 100
  },
  {
    field: "user",
    headerName: "Artist",
    flex: 0.9
  },
  {
    field: "ws",
    headerName: "WS",
    flex: 0.6
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

const testData = {"data":[{"app":"maya","free":9,"total":27,"user":"hanp","ws":"ws43"},{"app":"maya","free":9,"total":27,"user":"elliott","ws":"ws120"},{"app":"maya","free":9,"total":27,"user":"poul","ws":"ws15"},{"app":"maya","free":9,"total":27,"user":"matteolm","ws":"ws24"},{"app":"maya","free":9,"total":27,"user":"fabrice","ws":"ws44"},{"app":"maya","free":9,"total":27,"user":"josepha","ws":"ws16"},{"app":"maya","free":9,"total":27,"user":"adriant","ws":"ws124"},{"app":"maya","free":9,"total":27,"user":"clementine","ws":"ws62"},{"app":"maya","free":9,"total":27,"user":"robinm","ws":"ws114"},{"app":"maya","free":9,"total":27,"user":"bibin","ws":"ws37"},{"app":"maya","free":9,"total":27,"user":"gererd","ws":"ws46"},{"app":"maya","free":9,"total":27,"user":"zhane","ws":"ws42"},{"app":"maya","free":9,"total":27,"user":"andras","ws":"ws39"},{"app":"maya","free":9,"total":27,"user":"mathilde","ws":"ws118"},{"app":"maya","free":9,"total":27,"user":"nikolai","ws":"ws138"},{"app":"maya","free":9,"total":27,"user":"tomharrison","ws":"ws103"},{"app":"maya","free":9,"total":27,"user":"freda","ws":"ws13"},{"app":"maya","free":9,"total":27,"user":"aidanc","ws":"ws33"},{"app":"arnold","free":112,"total":150,"user":"ws108","ws":"ws108"},{"app":"arnold","free":112,"total":150,"user":"ws39","ws":"ws39"},{"app":"arnold","free":112,"total":150,"user":"ws23","ws":"ws23"},{"app":"arnold","free":112,"total":150,"user":"render-60","ws":"render-60"},{"app":"arnold","free":112,"total":150,"user":"ws21","ws":"ws21"},{"app":"arnold","free":112,"total":150,"user":"render-24","ws":"render-24"},{"app":"arnold","free":112,"total":150,"user":"render-65","ws":"render-65"},{"app":"arnold","free":112,"total":150,"user":"render-57","ws":"render-57"},{"app":"arnold","free":112,"total":150,"user":"render-64","ws":"render-64"},{"app":"arnold","free":112,"total":150,"user":"render-61","ws":"render-61"},{"app":"arnold","free":112,"total":150,"user":"render-66","ws":"render-66"},{"app":"arnold","free":112,"total":150,"user":"render-71","ws":"render-71"},{"app":"arnold","free":112,"total":150,"user":"render-01","ws":"render-01"},{"app":"arnold","free":112,"total":150,"user":"render-18","ws":"render-18"},{"app":"arnold","free":112,"total":150,"user":"render-11","ws":"render-11"},{"app":"arnold","free":112,"total":150,"user":"render-08","ws":"render-08"},{"app":"arnold","free":112,"total":150,"user":"render-17","ws":"render-17"},{"app":"arnold","free":112,"total":150,"user":"render-68","ws":"render-68"},{"app":"arnold","free":112,"total":150,"user":"render-16","ws":"render-16"},{"app":"arnold","free":112,"total":150,"user":"ws07","ws":"ws07"},{"app":"arnold","free":112,"total":150,"user":"ws47","ws":"ws47"},{"app":"arnold","free":112,"total":150,"user":"render-62","ws":"render-62"},{"app":"arnold","free":112,"total":150,"user":"render-59","ws":"render-59"},{"app":"arnold","free":112,"total":150,"user":"render-67","ws":"render-67"},{"app":"arnold","free":112,"total":150,"user":"render-05","ws":"render-05"},{"app":"arnold","free":112,"total":150,"user":"render-10","ws":"render-10"},{"app":"arnold","free":112,"total":150,"user":"render-02","ws":"render-02"},{"app":"arnold","free":112,"total":150,"user":"ws36","ws":"ws36"},{"app":"arnold","free":112,"total":150,"user":"ws28","ws":"ws28"},{"app":"arnold","free":112,"total":150,"user":"render-21","ws":"render-21"},{"app":"arnold","free":112,"total":150,"user":"render-23","ws":"render-23"},{"app":"arnold","free":112,"total":150,"user":"render-07","ws":"render-07"},{"app":"arnold","free":112,"total":150,"user":"render-58","ws":"render-58"},{"app":"arnold","free":112,"total":150,"user":"ws51","ws":"ws51"},{"app":"arnold","free":112,"total":150,"user":"render-63","ws":"render-63"},{"app":"arnold","free":112,"total":150,"user":"ws03","ws":"ws03"},{"app":"arnold","free":112,"total":150,"user":"render-06","ws":"render-06"},{"app":"arnold","free":112,"total":150,"user":"render-12","ws":"render-12"},{"app":"mari_i","free":6,"total":9,"user":"adriant","ws":"ws124"},{"app":"mari_i","free":6,"total":9,"user":"poul","ws":"ws15"},{"app":"mari_i","free":6,"total":9,"user":"joed","ws":"ws23"},{"app":"nukex_i","free":6,"total":14,"user":"stirling","ws":"flame09"},{"app":"nukex_i","free":6,"total":14,"user":"tane","ws":"ws26"},{"app":"nukex_i","free":6,"total":14,"user":"richr","ws":"ws11"},{"app":"nukex_i","free":6,"total":14,"user":"scottm","ws":"ws12"},{"app":"nukex_i","free":6,"total":14,"user":"amys","ws":"ws40"},{"app":"nukex_i","free":6,"total":14,"user":"alexga","ws":"flame06.london.etc"},{"app":"nukex_i","free":6,"total":14,"user":"bradleyc","ws":"ws02"},{"app":"nukex_i","free":6,"total":14,"user":"chris","ws":"ws117"},{"app":"hiero_i","free":2,"total":6,"user":"fabrice","ws":"ws44"},{"app":"hiero_i","free":2,"total":6,"user":"dean","ws":"ws51"},{"app":"hiero_i","free":2,"total":6,"user":"tomcl","ws":"ws27"},{"app":"hiero_i","free":2,"total":6,"user":"simonf","ws":"ws30"},{"app":"nuke_r","free":8,"total":30,"user":"petter","ws":"render-87"},{"app":"nuke_r","free":8,"total":30,"user":"bradleyc","ws":"render-87"},{"app":"nuke_r","free":8,"total":30,"user":"constantin","ws":"render-185"},{"app":"nuke_r","free":8,"total":30,"user":"petter","ws":"render-185"},{"app":"nuke_r","free":8,"total":30,"user":"petter","ws":"render-180"},{"app":"nuke_r","free":8,"total":30,"user":"petter","ws":"render-176.london.etc"},{"app":"nuke_r","free":8,"total":30,"user":"constantin","ws":"render-182"},{"app":"nuke_r","free":8,"total":30,"user":"richr","ws":"render-182"},{"app":"nuke_r","free":8,"total":30,"user":"constantin","ws":"render-178.london.etc"},{"app":"nuke_r","free":8,"total":30,"user":"constantin","ws":"render-187"},{"app":"nuke_r","free":8,"total":30,"user":"constantin","ws":"render-88"},{"app":"nuke_r","free":8,"total":30,"user":"seb","ws":"render-88"},{"app":"nuke_r","free":8,"total":30,"user":"bradleyc","ws":"render-82"},{"app":"nuke_r","free":8,"total":30,"user":"petter","ws":"render-73"},{"app":"nuke_r","free":8,"total":30,"user":"bradleyc","ws":"render-73"},{"app":"nuke_r","free":8,"total":30,"user":"richr","ws":"render-81"},{"app":"nuke_r","free":8,"total":30,"user":"petter","ws":"render-81"},{"app":"nuke_r","free":8,"total":30,"user":"petter","ws":"render-86"},{"app":"nuke_r","free":8,"total":30,"user":"bradleyc","ws":"render-86"},{"app":"nuke_r","free":8,"total":30,"user":"petter","ws":"render-74"},{"app":"nuke_r","free":8,"total":30,"user":"bradleyc","ws":"render-83"},{"app":"nuke_r","free":8,"total":30,"user":"seb","ws":"render-83"},{"app":"nuke_r","free":8,"total":30,"user":"petter","ws":"render-90"},{"app":"nuke_r","free":8,"total":30,"user":"seb","ws":"render-174.london.etc"},{"app":"nuke_r","free":8,"total":30,"user":"petter","ws":"render-184"},{"app":"nuke_r","free":8,"total":30,"user":"richr","ws":"render-184"},{"app":"nuke_r","free":8,"total":30,"user":"richr","ws":"render-92"},{"app":"nuke_r","free":8,"total":30,"user":"richr","ws":"render-165"},{"app":"nuke_r","free":8,"total":30,"user":"petter","ws":"render-186"},{"app":"nuke_r","free":8,"total":30,"user":"seb","ws":"render-183"},{"app":"nuke_r","free":8,"total":30,"user":"amys","ws":"render-91"},{"app":"nuke_i","free":8,"total":44,"user":"george","ws":"ws20"},{"app":"nuke_i","free":8,"total":44,"user":"poul","ws":"ws15"},{"app":"nuke_i","free":8,"total":44,"user":"elliott","ws":"ws120"},{"app":"nuke_i","free":8,"total":44,"user":"simonf","ws":"ws30"},{"app":"nuke_i","free":8,"total":44,"user":"jackp","ws":"ws28"},{"app":"nuke_i","free":8,"total":44,"user":"stirling","ws":"flame09"},{"app":"nuke_i","free":8,"total":44,"user":"jordan","ws":"ws21"},{"app":"nuke_i","free":8,"total":44,"user":"jaison","ws":"ws22"},{"app":"nuke_i","free":8,"total":44,"user":"joed","ws":"ws23"},{"app":"nuke_i","free":8,"total":44,"user":"tane","ws":"ws26"},{"app":"nuke_i","free":8,"total":44,"user":"tobin","ws":"ws65"},{"app":"nuke_i","free":8,"total":44,"user":"patrickk","ws":"ws07"},{"app":"nuke_i","free":8,"total":44,"user":"alessandrog","ws":"ws36"},{"app":"nuke_i","free":8,"total":44,"user":"albertos","ws":"ws109"},{"app":"nuke_i","free":8,"total":44,"user":"bibin","ws":"ws37"},{"app":"nuke_i","free":8,"total":44,"user":"richr","ws":"ws11"},{"app":"nuke_i","free":8,"total":44,"user":"kristoffer","ws":"ws45"},{"app":"nuke_i","free":8,"total":44,"user":"catarina","ws":"ws41"},{"app":"nuke_i","free":8,"total":44,"user":"constantin","ws":"ws61"},{"app":"nuke_i","free":8,"total":44,"user":"petter","ws":"ws49"},{"app":"nuke_i","free":8,"total":44,"user":"danielb","ws":"ws106"},{"app":"nuke_i","free":8,"total":44,"user":"scottm","ws":"ws12"},{"app":"nuke_i","free":8,"total":44,"user":"dorianne","ws":"ws64"},{"app":"nuke_i","free":8,"total":44,"user":"tomcl","ws":"ws27"},{"app":"nuke_i","free":8,"total":44,"user":"seb","ws":"ws115"},{"app":"nuke_i","free":8,"total":44,"user":"amys","ws":"ws40"},{"app":"nuke_i","free":8,"total":44,"user":"georgeg","ws":"ws131"},{"app":"nuke_i","free":8,"total":44,"user":"alexga","ws":"flame06.london.etc"},{"app":"nuke_i","free":8,"total":44,"user":"iain","ws":"flame07"},{"app":"nuke_i","free":8,"total":44,"user":"charlieh","ws":"ws03"},{"app":"nuke_i","free":8,"total":44,"user":"bradleyc","ws":"ws02"},{"app":"nuke_i","free":8,"total":44,"user":"chris","ws":"ws117"},{"app":"nuke_i","free":8,"total":44,"user":"alberto","ws":"ws08"},{"app":"nuke_i","free":8,"total":44,"user":"christianb","ws":"ws121"},{"app":"nuke_i","free":8,"total":44,"user":"dean","ws":"ws51"},{"app":"nuke_i","free":8,"total":44,"user":"adamwo","ws":"ws48"},{"app":"houdini_core","free":4,"total":19,"user":"charlieh","ws":"ws03.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"hendrik","ws":"ws47.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"tomharrison","ws":"ws103.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"jackp","ws":"ws28.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"andras","ws":"ws39.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"alessandrog","ws":"ws36.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"ogi","ws":"ws32.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"patrickk","ws":"ws07.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"dean","ws":"ws51.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"joed","ws":"ws23.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"jordan","ws":"ws21.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"kristoffer","ws":"ws45.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"elliott","ws":"ws120.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"dorianne","ws":"ws64.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"aidanc","ws":"ws33.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"reece","ws":"ws31.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"zhane","ws":"ws42.london.etc"},{"app":"houdini_core","free":4,"total":19,"user":"gregm","ws":"ws06.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"dieuwer","ws":"ws200.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"iono","ws":"ws107.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"albertos","ws":"ws109.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"christianbo","ws":"ws29.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"lukaz","ws":"ws202.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"sergio","ws":"ws05.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"dany","ws":"ws04.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"tobin","ws":"ws65.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"vahid","ws":"ws108.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"igor","ws":"ws25.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"george","ws":"ws20.london.etc"},{"app":"houdini_fx","free":1,"total":12,"user":"tarkan","ws":"ws201.london.etc"},{"app":"houdini_engine","free":10,"total":10,"user":"ogi","ws":"render-77.london.etc"},{"app":"sapphire_avx","free":1,"total":3,"user":"nina","ws":"flame12.london.etc"},{"app":"sapphire_avx","free":1,"total":3,"user":"scottr","ws":"flame08.london.etc"},{"app":"rvsolo","free":0,"total":0,"user":"andras","ws":"192.168.11.39"},{"app":"rvsolo","free":0,"total":0,"user":"ogi","ws":"192.168.11.32"},{"app":"rvsolo","free":0,"total":0,"user":"iono","ws":"192.168.11.107"},{"app":"rvsolo","free":0,"total":0,"user":"tane","ws":"192.168.11.26"},{"app":"rvsolo","free":0,"total":0,"user":"gererd","ws":"192.168.11.46"},{"app":"rvsolo","free":0,"total":0,"user":"dieuwer","ws":"192.168.11.200"},{"app":"rvsolo","free":0,"total":0,"user":"gregm","ws":"192.168.11.6"},{"app":"rvsolo","free":0,"total":0,"user":"hanp","ws":"192.168.11.43"},{"app":"rvsolo","free":0,"total":0,"user":"simonf","ws":"192.168.11.30"},{"app":"rvsolo","free":0,"total":0,"user":"vahid","ws":"192.168.11.108"},{"app":"nukex_i","free":13,"total":14,"user":"tarkan","ws":"ws201"},{"app":"nuke_i","free":40,"total":41,"user":"tarkan","ws":"ws201"}]};

// const ArtistCell = ({
//   position,
//   size,
//   x,
//   y,
//   color,
//   fill,
//   opacity,
//   borderWidth,
//   borderColor,
//   data,
//   onHover,
//   onLeave,
//   onClick,
// }) => {
//   const ws = artid
//   return (
//     <div style={{backgroundColor: "red", width: size, height: size, position: "absolute", left: x, top: y}}>
//       <Typography></Typography>
//     </div>
//   );
// };

const Licenses = () => {
  const [loadedData, setLoadedData] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");

  useEffect(() => {
    // serverRequest("studio_jobs").then(resp => {
    //   setLoadedData(resp.data || []);
    // });
    // setLoadedData(testData.data.map((d, i) => ({id: i, ...d})));
    const data = {};
    testData.data.forEach(entry => {
      const app = entry.app;
      if (!selectedApp) setSelectedApp(app);
      if (!data[app]) {
        data[app] = {
          free: entry.free,
          used: entry.total - entry.free,
          total: entry.total,
          users: []
        };
      }
      data[app].users.push({
        name: entry.user,
        ws: entry.ws
      });
    });
    setLoadedData(data);
  }, []);

  // const artistData = Object.entries(artistTiles).map(([app, tile]) => ({
  //   id: "free",
  //   label: tile.artist,
  //   value: 1
  // }));

  if (!loadedData[selectedApp]) return null;

  const total = loadedData[selectedApp].free + loadedData[selectedApp].used;
  const rows = Math.round(Math.sqrt(total));
  const columns = total / rows;
  const chartData = [
    {
      id: "used",
      label: "used",
      value: loadedData[selectedApp].used,
      color: "rgb(150,0,0)"
    },
    {
      id: "free",
      label: "free",
      value: loadedData[selectedApp].free,
      color: "rgb(0,150,0)"
    }
  ];

  const getTile = ([app, tile]) => {
    const isSelected = app == selectedApp;
    const tileStyle = {
      minHeight: isSelected ? "100px" : "30px"
    };
    return (
      <div key={app} className={styles.appTile} style={tileStyle}
        onClick={() => setSelectedApp(app)}>
        <Typography variant="body1">{app}</Typography>
        <Typography variant="body1">{tile.free}/{tile.total}</Typography>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.appTileContainer}>
        {Object.entries(loadedData).map(data => getTile(data))}
      </div>
      {/* <Divider />
      <div className={styles.artistTileContainer}>
        <ResponsiveWaffle
          data={chartData}
          total={total}
          rows={rows}
          columns={columns}
          emptyOpacity={1}
          // cellComponent={ArtistCell}
          // colors={{ scheme: "nivo" }}
          animate={true}
          motionStiffness={90}
          motionDamping={11}
        />
      </div> */}
      {/* <DataGrid
        rows={loadedData}
        columns={columns}
        disableSelectionOnClick
        headerHeight={30}
        hideFooter
        disableColumnMenu
        rowHeight={25}
        components={{
          NoRowsOverlay: () => <DataPlaceholder text="No data" />
        }}
      /> */}
    </div>
  );
};

export default Licenses;
