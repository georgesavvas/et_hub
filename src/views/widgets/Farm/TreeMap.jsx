import React from "react";
import {Treemap, ResponsiveContainer} from "recharts";
import stc from "string-to-color";


const COLOURS = {
  Error: "rgb(150, 50, 50)",
  Running: "rgb(50, 150, 50)",
  Finished: "rgb(50, 50, 100)",
  Waiting: "rgb(100, 100, 100)"
};

const TreeMapComponent = props => {
  const {depth, x, y, width, height, showColour} = props;
  const maxWidth = 80;
  const maxHeight = 40;

  const valid = width > maxWidth && height > maxHeight;
  const rotateValid = width > maxHeight && height > maxWidth;

  const getLabel = () => {
    if (!valid && !rotateValid) return null;
    // if (depth === 1) return (
    //   <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle"
    //     fill="rgb(200, 200, 200)" fontSize={18} fontWeight="bold">
    //     {name}
    //   </text>
    // );
    if (depth === 3) return (
      <g
        transform={`
          translate(${x + width / 2} ${y + height / 2})
          rotate(${!valid && rotateValid ? -90 : 0} 0 0)
        `}
      >
        {/* <text x={x + width / 2} y={y + height / 2 + 7 - 15} textAnchor="middle"
          fill="rgb(200, 200, 200)" fontSize={16}>
          {props.show}
        </text> */}
        <text y={4 - 8} textAnchor="middle"
          fill="rgb(200, 200, 200)" fontSize={12}>
          {props.shot.replace("_", " / ")}
        </text>
        <text y={4 + 8} textAnchor="middle"
          fill="rgb(200, 200, 200)" fontSize={12}>
          {props.user}
        </text>
      </g>
    );
  };

  const getColour = () => {
    if (depth === 3) return showColour + "50";
    return "#00000000";
  };

  return (
    <g>
      <rect
        onClick={() => console.log(props)}
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: getColour(),
          stroke: "rgb(40, 40, 40)",
          strokeWidth: depth === 1 ? 5 : 2
          // strokeOpacity: 1 / (depth + 0.01)
        }}
      />
      {getLabel()}
    </g>
  );
};

const TreeMap = props => {
  const farmData = props.data;
  const {selectedArtists, selectedProjects, layerMask} = props;

  const getViewState = () => {
    if (!farmData?.data) return [];
    const shows = {};
    const allowedLayers = layerMask.replaceAll(" ", "").split(",");
    farmData.data.jobs.filter(j => !selectedArtists.length || selectedArtists.includes(j.user)).forEach(job => {
      const show = job.show;
      const showColour = stc(show);
      const shot = job.shot;
      if (!shows[show]) shows[show] = {
        name: show,
        showColour: showColour,
        path: [show].join("."),
        shots: {}
      };
      if (!shows[show].shots[shot]) shows[show].shots[shot] = [];
      const layer_progress = job.layers.filter(l => {
        return allowedLayers.some(name => l.name.startsWith(name + "."));
      }).map(l => l.totalFrames);
      const sum = layer_progress.reduce((a, b) => a + b, 0);
      const progress = (sum / layer_progress.length);
      shows[show].shots[shot].push({
        name: job.name,
        progress: progress,
        // value: progress || 0.05,
        value: 1,
        user: job.user,
        show: show,
        showColour: showColour,
        shot: shot,
        path: [show, shot, job.name].join(".")
      });
    });
    const data = Object.values(shows).map(show => {
      show.children = Object.entries(show.shots).map(([shot, renders]) => {
        return {
          name: shot,
          path: [show.name, shot].join("."),
          children: renders
        };
      });
      return show;
    });
    // console.log(data);
    return data;
  };

  const projects = new Set();
  const artists = new Set();
  farmData.data?.jobs.forEach(job => {
    artists.add(job.user);
    projects.add(job.show);
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={getViewState()}
        dataKey="value"
        aspectRatio={2}
        animationDuration={250}
        content={<TreeMapComponent />}
      />
    </ResponsiveContainer>
  );
};

export default TreeMap;