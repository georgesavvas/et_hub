import {
  Avatar,
  Button,
  Cascader,
  Divider,
  Input,
  Modal,
  Pagination,
  Segmented,
  Select,
  Slider,
  Space,
  Spin,
  Typography,
} from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";
import serverRequest, { formatURL } from "../../services/serverRequest";

import { CopyOutlined } from "@ant-design/icons";
import { CopyToClipboard } from "../../components/ContextActions";
import { DataContext } from "../../contexts/DataContext";
import DataPlaceholder from "../../components/DataPlaceholder";
import Widget from "./Widget";
import styles from "./VoltBrowser.module.css";
import { useResizeDetector } from "react-resize-detector";

const { Title, Text, Paragraph } = Typography;

const assetsPerPage = 50;

const formatVersion = (n = 0) => `v${n.toString().padStart(3, "0")}`;

const getTimeFormatted = (date) => {
  if (!date) return "";
  return new Date(date * 1000).toLocaleString([], {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimeAgo = (date) => {
  if (!date) return "";
  const now = new Date().getTime() / 1000;
  let timeAgo = Math.round(now - date);
  let timeUnit = timeAgo > 1 ? "seconds ago" : "second ago";
  let timeUnitEnum = 0;
  if (timeAgo > 60) {
    timeAgo = Math.round(timeAgo / 60);
    timeUnit = timeAgo > 1 ? "minutes ago" : "minute ago";
    timeUnitEnum = 1;
  }
  if (timeUnitEnum === 1 && timeAgo > 59) {
    timeAgo = Math.round(timeAgo / 60);
    timeUnit = timeAgo > 1 ? "hours ago" : "hour ago";
    timeUnitEnum = 2;
  }
  if (timeUnitEnum === 2 && timeAgo > 23) {
    timeAgo = Math.round(timeAgo / 24);
    timeUnit = timeAgo > 1 ? "days ago" : "day ago";
    timeUnitEnum = 3;
  }
  if (timeUnitEnum === 3 && timeAgo > 6) {
    timeAgo = Math.round(timeAgo / 7);
    timeUnit = timeAgo > 1 ? "weeks ago" : "week ago";
    timeUnitEnum = 4;
  }
  if (timeUnitEnum === 4 && timeAgo > 3) {
    timeAgo = Math.round(timeAgo / 4);
    timeUnit = timeAgo > 1 ? "months ago" : "month ago";
    timeUnitEnum = 5;
  }
  if (timeUnitEnum === 5 && timeAgo > 11) {
    timeAgo = Math.round(timeAgo / 12);
    timeUnit = timeAgo > 1 ? "years ago" : "year ago";
    timeUnitEnum = 6;
  }
  return `${timeAgo} ${timeUnit}`;
};

const assetRow = (props) => {
  return <div></div>;
};

const VoltBrowser = (props) => {
  const { projects, users } = useContext(DataContext);
  const [project, setProject] = useState("");
  const [context, setContext] = useState("");
  const [fullscreenAsset, setFullscreenAsset] = useState(null);
  const [fullscreenVersions, setFullscreenVersions] = useState([]);
  const [selectedFullscreenVersion, setSelectedFullscreenVersion] = useState(null);
  const [contextValue, setContextValue] = useState([]);
  const [assets, setAssets] = useState([]);
  const [latest, setLatest] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const [treeLoading, setTreeLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [tileSize, setTileSize] = useState(200);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [forceRefresh, setForceRefresh] = useState(0);
  const { width, height, ref } = useResizeDetector();
  const compact = width < 650 && height < 500;

  useEffect(() => {
    if (!project) return;
    serverRequest("get_project_tree", { project: `/project/tvc/${project}` }, "api/v2").then(
      (resp) => {
        setData(resp.data);
        setTreeLoading(false);
      },
    );
  }, [project]);

  useEffect(() => {
    if (!context) return;
    serverRequest("get_assets", { uri: context, latest: latest }, "api/v2").then((resp) => {
      setAssets(resp.data);
      setAssetsLoading(false);
    });
    setAssetsLoading(false);
  }, [context, forceRefresh, latest]);

  useEffect(() => {
    if (fullscreenAsset === null) {
      setFullscreenVersions([]);
      setSelectedFullscreenVersion({});
      return;
    }
    serverRequest("get_assets", { uri: fullscreenAsset.asset, latest: false }, "api/v2").then(
      (resp) => {
        if (!resp.data) return;
        setFullscreenVersions(resp.data);
        setSelectedFullscreenVersion(resp.data.at(0) || {});
      },
    );
  }, [fullscreenAsset]);

  const assetsFiltered = useMemo(() => {
    if (!assets) return [];
    if (!filterValue) return assets;
    const words = filterValue.toLowerCase().split(" ");
    return assets.filter((a) => {
      const realName = users[a.user]?.real_name;
      const filterString = `${realName}${a.user}${a.asset}${a.version}${a.kind_name}`.toLowerCase();
      return words.every((w) => filterString.includes(w));
    });
  }, [assets, filterValue]);

  const pages = Math.ceil(assetsFiltered.length / assetsPerPage) || 1;
  const start = (page - 1) * assetsPerPage;
  const end = page * assetsPerPage;
  const assetsPaginated = assetsFiltered.slice(start, end);

  const getNode = (node) => {
    return {
      value: node.name,
      label: node.name,
      children: node.nodes.map((child) => getNode(child)),
    };
  };

  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const onChange = (value: string) => {
    setTreeLoading(true);
    setAssetsLoading(true);
    setProject(value);
    setContext(`/project/tvc/${value}`);
    setContextValue([]);
  };

  const handleContextChange = (value) => {
    if (!value) value = [];
    setContextValue(value);
    setContext(`/project/tvc/${project}/${value.join("/")}`);
  };

  if (!projects || Object.keys(projects).length === 0) return <DataPlaceholder text="No data" />;

  const projectList = Object.keys(projects).map((project) => ({
    value: project,
    label: project,
  }));

  const displayRender = (labels: string[]) => labels.join(" / ");

  const dropdownRender = (menus: React.ReactNode) => <div className={styles.cascader}>{menus}</div>;

  const style = {
    width: "100%",
    maxWidth: "300px",
    aspectRatio: 16 / 9,
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "rgb(0, 0, 0)",
  };

  const handleMouseEnter = (e) => {
    e.target.play();
  };

  const handleMouseLeave = (e) => {
    e.target.pause();
  };

  const handleCopyPath = () => {
    CopyToClipboard(selectedFullscreenVersion?.path, props.messageApi);
  };

  const handleCopyVri = () => {
    CopyToClipboard(selectedFullscreenVersion?.vri, props.messageApi);
  };

  const profile = users[selectedFullscreenVersion?.user]?.profile || {};
  const createdDateAgo = getTimeAgo(selectedFullscreenVersion?.created_date);
  const createdDate = getTimeFormatted(selectedFullscreenVersion?.created_date);

  // console.log(assets.map((a) => getTimeAgo(a.created_date)));

  return (
    <Widget {...props}>
      <div id="widgetContainer" className={styles.container} ref={ref}>
        <Modal
          width="75%"
          // centered
          open={fullscreenAsset !== null}
          onCancel={() => setFullscreenAsset(null)}
          footer={null}
        >
          <div className={styles.fullscreenAssetDetails}>
            <div className={styles.row}>
              <Avatar size={48} src={profile.image_48} style={{ minWidth: "max-content" }} />
              <div className={styles.column} style={{ marginRight: 20, minWidth: "max-content" }}>
                <Title level={5} style={{ margin: 0 }}>
                  {profile.real_name}
                </Title>
                {profile.title && <Text>{profile.title}</Text>}
              </div>
              <div className={styles.column} style={{ minWidth: "max-content" }}>
                <Text>{createdDateAgo}</Text>
                <Text>{createdDate}</Text>
              </div>
              <div className={styles.row} style={{ justifyContent: "flex-end" }}>
                <Segmented
                  value={selectedFullscreenVersion?.version}
                  onChange={(value) =>
                    setSelectedFullscreenVersion(
                      fullscreenVersions.find((a) => a.version === value),
                    )
                  }
                  options={fullscreenVersions.slice(0, 5).map((a) => ({
                    value: a.version,
                    label: formatVersion(a.version),
                  }))}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.row}>
                <Title level={4} style={{ marginTop: "5px", marginBottom: 0 }}>
                  {selectedFullscreenVersion.name}
                </Title>
              </div>
              <div className={styles.row} style={{ justifyContent: "flex-end" }}>
                <Text>{selectedFullscreenVersion.db_path}</Text>
                <Button icon={<CopyOutlined />} onClick={handleCopyPath}>
                  Path
                </Button>
                <Button icon={<CopyOutlined />} type="primary" onClick={handleCopyVri}>
                  VRI
                </Button>
              </div>
            </div>
          </div>
          {fullscreenAsset?.path && (
            <video
              key={selectedFullscreenVersion?.uri}
              width="100%"
              height="100%"
              controls
              loop
              // style={style}
              // poster={formatURL(`files${asset.path}/thumbnail.jpg`)}
              src={formatURL(`files${selectedFullscreenVersion?.path}/webview.mp4`)}
            />
          )}
        </Modal>
        <div className={styles.row}>
          <Select
            showSearch
            placeholder="Project"
            optionFilterProp="children"
            onChange={onChange}
            filterOption={filterOption}
            options={projectList}
            style={{ width: "50%" }}
          />
          <Cascader
            showSearch
            fieldNames={{ label: "name", value: "name", children: "nodes" }}
            value={contextValue}
            onChange={handleContextChange}
            placeholder="Context"
            options={data}
            expandTrigger="hover"
            changeOnSelect
            displayRender={displayRender}
            style={{ width: "50%" }}
            loading={treeLoading}
            dropdownRender={dropdownRender}
          />
          <Input
            placeholder="Search"
            onChange={(e) => setFilterValue(e.target.value)}
            value={filterValue}
            style={{ width: "100%" }}
          />
          <Button onClick={() => setForceRefresh((prev) => (prev += 1))}>Reload</Button>
        </div>
        {assetsLoading && (
          <Spin
            tip="Fetching assets..."
            size="large"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        )}
        {!project && (
          <div>
            <DataPlaceholder text="Select a project" />
          </div>
        )}
        {!assetsLoading &&
          project &&
          (!assets ||
            (assets.length === 0 && (
              <div>
                <DataPlaceholder text="No assets found" />
              </div>
            )))}
        {!assetsLoading && (
          <>
            <div className={styles.gridContainer}>
              <div className={styles.grid}>
                {assetsPaginated.map((asset) => (
                  <video
                    key={asset.uri}
                    className={styles.showcaseListVideo}
                    muted
                    loop
                    preload="auto"
                    style={style}
                    // poster={formatURL(`files${asset.path}/thumbnail.jpg`)}
                    src={formatURL(`files${asset.path}/webview.mp4`)}
                    onClick={() => setFullscreenAsset(asset)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
              </div>
              {/* <div className={styles.gridLayoutHelper} /> */}
            </div>
            <div className={styles.row} style={{ justifyContent: "center" }}>
              <Pagination current={page} onChange={setPage} total={pages} pageSize={1} />
            </div>
          </>
        )}
      </div>
    </Widget>
  );
};

export default VoltBrowser;
