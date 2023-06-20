import React from "react";
import getDimensions from "../utils/matrices/getDimensions";
import mapMatrix from "../utils/matrices/mapMatrix";

const Grid = ({ tiles, className, children }) => {
  const { width, height } = getDimensions(tiles);
  const defaultRenderTile = (tile, location) => (
    <div
      key={`${location.row}:${location.col}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {tile}
    </div>
  );
  const renderTile = children ?? defaultRenderTile;

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `32px `.repeat(width),
        gridTemplateRows: `32px `.repeat(height),
      }}
    >
      {mapMatrix(tiles, renderTile).flat()}
    </div>
  );
};

export default Grid;
