import React, {useEffect, useState} from "react";
import { ResponsiveTreeMap } from "@nivo/treemap";
import styles from "./NivoTreeMap.module.css";
import {TreeMapNode} from "./NivoNode.tsx";
import stc from "string-to-color";


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const COLOURS = {
  Error: "rgb(150, 50, 50)",
  Running: "rgb(50, 150, 50)",
  Finished: "rgb(50, 50, 100)",
  Waiting: "rgb(100, 100, 100)"
};

const nivoTheme = {
  fontSize: 14,
  labels: {
    text: {
      whiteSpace: "break-spaces",
      fontFamily: "Roboto",
    }
  },
  tooltip: {
    container: {
      background: "rgb(20, 20, 20)",
      color: "rgb(200, 200, 200)",
      fontSize: 16
    },
  }
};

const TreeMap = props => {
  const [formattedData, setFormattedData] = useState({});

  useEffect(() => {
    setFormattedData(getViewState(props.data));
  }, [props]);

  const {
    selectedArtists,
    selectedProjects,
    layerMask,
    selectedNode,
    setSelectedNode,
    filtersEnabled,
    selectedMetric
  } = props;
  const allowedLayers = layerMask ?
    layerMask.replaceAll(" ", "").split(",") : [];

  const isJobIncluded = job => {
    if (!filtersEnabled) return true;
    if (selectedProjects.length && !selectedProjects.includes(job.show)) return;
    if (selectedArtists.length && !selectedArtists.includes(job.user)) return;
    return true;
  };

  const isLayerIncluded = layer => {
    if (!allowedLayers.length) return true;
    return allowedLayers.some(pref => layer.name.startsWith(pref + "."));
  };

  const getViewState = farmData => {
    const data = {name: "Farm", path: "Farm", color: "#000000"};
    const shows = {};
    farmData.data?.jobs.filter(isJobIncluded).forEach(job => {
      const show = job.show.slice(0, job.show.lastIndexOf("_"));
      const shot = job.shot;
      if (!shows[show]) shows[show] = {
        name: show,
        color: stc(show),
        path: [data.name, show].join("."),
        shots: {}
      };
      if (!shows[show].shots[shot]) shows[show].shots[shot] = [];
      let metric = 0;
      if (selectedMetric in job && job.layers.some(isLayerIncluded)) {
        metric = job[selectedMetric];
      } else {
        const layer_metric = job.layers.filter(
          isLayerIncluded
        ).map(l => l[selectedMetric]);
        metric = layer_metric.reduce((a, b) => a + b, 0);
        // value = metric && layer_metric.length ? (metric / layer_metric.length) : 0;
      }
      // const s = [data.name, job.show, shot, job.name].join(".").includes(selectedNode);
      // console.log(selectedNode, [data.name, job.show, shot, job.name].join("."));
      if (metric > 0) {
        shows[show].shots[shot].push({
          name: job.name,
          metric: metric,
          value: metric || 0.01,
          user: job.user,
          color: stc(show),
          show: show,
          shot: shot,
          path: [data.name, show, shot, job.name].join(".")
        });
      }
    });
    data.children = Object.values(shows).map(show => {
      show.children = Object.entries(show.shots).map(([shot, renders]) => {
        return {
          name: shot,
          color: show.color,
          path: [data.name, show.name, shot].join("."),
          children: renders
        };
      });
      return show;
    });
    // console.log(data);
    return data;
  };

  const getParentLabel = node => {
    return node.id;
    // if (!selectedNode) return node.id;
    // if (selectedNode.includes(node.path)) return node.id;
    // if (node.path.includes(selectedNode)) return node.id;
    // return "";
  };

  const getLabel = node => {
    if (!node.data.show) return;
    return [
      node.data.shot.replace("_", " / "), node.data.user, node.data.metric
    ].join("\n");
  };

  const handleNodeClick = node => {
    console.log(node);
    // setSelectedNode(node.path);
  };

  return (
    <div className={styles.graph}>
      <ResponsiveTreeMap data={formattedData}
        identity="name"
        // value={n => n.path.includes(selectedNode) ? n.value : 0.01}
        // tile="binary"
        valueFormat={v => `${v} ${props.labels[selectedMetric]}`}
        // margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        labelSkipSize={32}
        parentLabelSize={24}
        labelTextColor="lightgrey"
        // orientLabel={false}
        parentLabelTextColor="lightgrey"
        nodeComponent={node => <TreeMapNode {...node} /> }
        // colors={node => COLOURS[node.id] || "rgb(10, 10, 10)"}
        // colors={{scheme: "dark2"}}
        colors={node => node.data.color}
        // borderColor={{from: "color", modifiers: [["darker", 0.1]]}}
        nodeOpacity={0.1}
        // borderColor="rgb(10, 10, 10)"
        // borderWidth={2}
        theme={nivoTheme}
        // onClick={node => console.log(node.data)}
        onClick={handleNodeClick}
        // animate={false}
        // outerPadding={5}
        // innerPadding={5}
        // leavesOnly
        parentLabel={getParentLabel}
        label={getLabel}
        // label={node => node.data.user}
        // label={node => `${node.id}: ${node.formattedValue}`}
        motionConfig="slow"
      />
    </div>
  );
};

export default TreeMap;
