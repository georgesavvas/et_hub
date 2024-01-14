import { Breadcrumb, Progress, Typography } from "antd";

import { DataContext } from "../../contexts/DataContext";
import DataPlaceholder from "../../components/DataPlaceholder";
import Widget from "./Widget";
import styles from "./RenderList.module.css";
import { useContext } from "react";
import { useResizeDetector } from "react-resize-detector";

const { Title, Text, Paragraph } = Typography;

const ignoreLayers = ["cuenotify", "metadata", "publish", "register", "mp4", "jpg", "postprocess"];

const Render = (props) => {
  const { name, layers, show, shot, version, user } = props.job;
  const layersFiltered = layers.filter(
    (layer) => ignoreLayers.findIndex((name) => layer.name.startsWith(name)) < 0,
  );
  console.log(layersFiltered);
  const percent =
    layersFiltered.reduce((prev, l) => {
      return (prev += l.percentCompleted);
    }, 0) / layersFiltered.length;
  return (
    <div className={styles.renderContainer}>
      <Breadcrumb items={[{ title: show }, { title: shot }, { title: version }, { title: user }]} />
      <Progress percent={percent} showInfo={false} style={{ margin: 0 }} />
    </div>
  );
};

const RenderList = (props) => {
  const { farm } = useContext(DataContext);
  const { width, height, ref } = useResizeDetector();
  const compact = width < 650 && height < 500;

  if (!farm?.data)
    return (
      <Widget {...props}>
        <DataPlaceholder text="No data" />
      </Widget>
    );

  console.log({ ...farm?.data });

  return (
    <Widget {...props}>
      <div id="widgetContainer" className={styles.container} ref={ref}>
        {farm.data.jobs.map((job) => (
          <Render key={job.name} job={job} />
        ))}
      </div>
    </Widget>
  );
};

export default RenderList;
