import React from "react";
import { Typography } from "antd";

const { Title } = Typography;


const containerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  height: "100%",
  flexGrow: "100",
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  boxSizing: "border-box",
  pointerEvents: "none"
};

const typeStyle = {
  color: "rgb(70, 70, 70)"
};

const DataPlaceholder = props => {
  return (
    <div style={{...containerStyle, ...props.style}}>
      <Title level={4} style={typeStyle}>{props.text || "Placeholder"}</Title>
    </div>
  );
};

export default DataPlaceholder;
