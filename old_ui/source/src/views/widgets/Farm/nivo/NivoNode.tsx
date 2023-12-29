import React, { memo } from "react";
import { animated, to } from "@react-spring/web";
import { useTheme } from "@nivo/core";
import { NodeProps } from "./types";
import { svgNodeTransform, svgLabelTransform } from "./transitions.ts";
import {fit} from "../../../../utils/math";

const NonMemoizedTreeMapNode = <Datum extends object>({
  node,
  animatedProps,
  borderWidth,
  enableLabel,
  enableParentLabel,
  labelSkipSize,
}: NodeProps<Datum>) => {
  const theme = useTheme();

  const minSize = 10;
  const maxWidth = 80;
  const maxHeight = 50;
  const maxParentHeight = 20;

  const validMin = node.width > minSize && node.height > minSize;

  const isRotated = node.labelRotation !== 0;
  let valid = node.width > maxWidth && node.height > maxHeight;
  const validRotated = node.width > maxHeight && node.height > maxWidth;

  const validParent = node.width > maxWidth && node.height > maxParentHeight;
  const showParentLabel = enableParentLabel && node.isParent && validParent;

  if (!valid && isRotated && validRotated) valid = validRotated;
  const showLabel = enableLabel && node.isLeaf && node.label &&
    (valid || validMin);

  const labels = node.label ? node.label.split("\n") : [];
  let labelsAmount = labels.length;
  if (labelsAmount && (!valid && validMin)) {
    labels.splice(0, labelsAmount - 1);
    labelsAmount = 1;
  }
  const la_ = labelsAmount - 1;

  return (
    <animated.g transform={svgNodeTransform(animatedProps.x, animatedProps.y)}>
      <animated.rect
        data-testid={`node.${node.id}`}
        width={to(animatedProps.width, v => Math.max(v, 0))}
        height={to(animatedProps.height, v => Math.max(v, 0))}
        fill={node.fill ? node.fill : animatedProps.color}
        strokeWidth={borderWidth}
        stroke={node.borderColor}
        fillOpacity={node.opacity}
        onMouseEnter={node.onMouseEnter}
        onMouseMove={node.onMouseMove}
        onMouseLeave={node.onMouseLeave}
        onClick={node.onClick}
      />
      {showLabel ? labels.map((label, index) => 
        <animated.text
          key={`${node.id}_${index}`}
          data-testid={`label.${node.id}`}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            ...theme.labels.text,
            fill: node.labelTextColor,
            pointerEvents: "none",
          }}
          fillOpacity={index === la_ ?
            animatedProps.labelOpacity :
            to(animatedProps.labelOpacity, v => v - 0.5)
          }
          transform={svgLabelTransform(
            !isRotated ? animatedProps.labelX : to(
              animatedProps.labelX,
              v => v + (la_ ? fit(index, 0, la_, -la_ / 2, la_ / 2) : 0) * 16
            ),
            isRotated ? animatedProps.labelY : to(
              animatedProps.labelY,
              v => v + (la_ ? fit(index, 0, la_, -la_ / 2, la_ / 2) : 0) * 16
            ),
            animatedProps.labelRotation
          )}
        >
          {label}
        </animated.text>
      ) : null}
      {showParentLabel && (
        <animated.text
          data-testid={`parentLabel.${node.id}`}
          dominantBaseline="central"
          style={{
            ...theme.labels.text,
            fill: node.parentLabelTextColor,
            pointerEvents: "none",
          }}
          fillOpacity={animatedProps.parentLabelOpacity}
          transform={svgLabelTransform(
            animatedProps.parentLabelX,
            animatedProps.parentLabelY,
            animatedProps.parentLabelRotation
          )}
        >
          {node.parentLabel}
        </animated.text>
      )}
    </animated.g>
  );
};

export const TreeMapNode = memo(NonMemoizedTreeMapNode) as typeof NonMemoizedTreeMapNode;
