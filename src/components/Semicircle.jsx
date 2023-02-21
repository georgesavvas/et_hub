import React from "react";
// import {Svg, Circle} from "react";


export const Semicircle = props => {
  const size = props.size || 64;
  const thickness = props.size || 12;
  const radius = (size - thickness) / 2;
  const circum = radius * 2 * Math.PI;
  const svgProgress = 100 - props.progressPercent;

  return (
    <div style={{margin: 10}}>
      <svg width={size} height={size}>
        <circle 
          stroke={props.bgColor ? props.bgColor : "#f2f2f2"}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={90}
          strokeWidth={thickness}
        />
        <circle 
          stroke={props.pgColor ? props.pgColor : "#3b5998"}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={90}
          strokeDasharray={`${circum} ${circum}`}
          strokeDashoffset={radius * Math.PI * 2 * (svgProgress/100)}
          strokeLinecap="round"
          transform={`rotate(-90, ${size/2}, ${size/2})`}
          strokeWidth={thickness}
        />
      </svg>
    </div>
  );
};
