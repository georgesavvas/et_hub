import { Button, Card, Checkbox, Col, Divider, Flex, Modal, Row, Typography } from "antd";
import { DeleteFilled, HomeFilled, StarFilled, StarOutlined } from "@ant-design/icons";
import GridLayout, { WidthProvider } from "react-grid-layout";
import { useContext, useMemo } from "react";

import { ConfigContext } from "../contexts/ConfigContext";

const { Title, Text } = Typography;

const RGL = WidthProvider(GridLayout);

const cardHeight = 150;
const margin = 5;
const iconStyle = { fontSize: 24 };

const Layout = (props) => {
  const { pinnedLayouts, setPinnedLayouts, setSelectedLayout } = useContext(ConfigContext);

  const { data } = props;

  const isPinned = pinnedLayouts.includes(props.id);

  const togglePinned = () =>
    setPinnedLayouts((prev) => {
      if (pinnedLayouts.includes(props.id)) return prev.filter((id) => id !== props.id);
      else return [...prev, props.id];
    });

  const actions = [
    <div onClick={() => setSelectedLayout(props.id)}>
      <HomeFilled style={{ ...iconStyle, color: "royalblue" }} />
    </div>,
    <div onClick={togglePinned}>
      {isPinned ? (
        <StarFilled style={{ ...iconStyle, color: "gold" }} />
      ) : (
        <StarOutlined style={{ ...iconStyle, color: "gold" }} />
      )}
    </div>,
  ];
  if (!props.other) actions.push(<DeleteFilled style={{ ...iconStyle, color: "firebrick" }} />);

  const rowHeight = (cardHeight - (data.rows - 1) * margin) / data.rows;
  const cardWidth = (cardHeight * 16) / 9 + 24 * 2;

  return (
    <Card
      title={data.name}
      extra={props.other && `by ${props.user}`}
      // style={{ width: "100%" }}
      actions={actions}
    >
      <RGL
        layout={data.widgets}
        cols={data.columns}
        margin={[margin, margin]}
        rowHeight={rowHeight}
        isDraggable={false}
        isResizable={false}
        useCSSTransforms={true}
        autoSize={false}
        style={{ height: cardHeight }}
      >
        {data.widgets.map((w) => (
          <div
            key={w.i}
            style={{
              backgroundColor: "rgb(31, 77, 41)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {w.i}
          </div>
        ))}
      </RGL>
    </Card>
  );
};

const ManageLayouts = (props) => {
  const { layouts, user } = useContext(ConfigContext);

  const [userLayouts, otherLayouts] = useMemo(() => {
    const userLayouts = [];
    const otherLayouts = [];
    Object.entries(layouts).forEach(([id, layout]) => {
      if (layout.user == user) userLayouts.push([id, layout]);
      else if (layout.data.public) otherLayouts.push([id, layout]);
    });
    return [userLayouts, otherLayouts];
  }, [layouts]);

  const cardWidth = (cardHeight * 16) / 9 + 24 * 2;
  const gridStyle = {
    display: "grid",
    gap: "10px",
    maxHeight: "40vh",
    overflowY: "auto",
    width: "100%",
    gridTemplateColumns: `repeat(auto-fill, minmax(${cardWidth}px, 1fr))`,
    gridAutoRows: "max-content",
    colorScheme: "dark",
  };

  return (
    <Modal
      centered
      width="75%"
      footer={
        <Button key="ok" onClick={props.onCancel} type="primary">
          Ok
        </Button>
      }
      {...props}
    >
      <Title level={5}>Your Layouts</Title>
      <div style={gridStyle}>
        {userLayouts.map(([id, l]) => (
          <div key={id} style={{ display: "block" }}>
            <Layout id={id} {...l} />
          </div>
        ))}
      </div>
      <Divider />
      <Title level={5}>Explore</Title>
      <div style={gridStyle}>
        {otherLayouts.map(([id, l]) => (
          <div key={id} style={{ display: "block" }}>
            <Layout id={id} {...l} other />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default ManageLayouts;
