import React from "react";
import { useDrop } from "react-dnd";
import ItemTypes from "../../utils/dragAndDrop/itemTypes";

const Slot = ({ onDrop, canDrop = () => true, deps = [], children }) => {
  const [{ isValidDrop, isOver, isDragging }, drop] = useDrop(
    () => ({
      accept: ItemTypes.DIE,
      canDrop,
      drop: (item) => {
        onDrop(item);

        return {};
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        isValidDrop: monitor.canDrop(),
        isDragging: monitor.getItemType() !== null,
      }),
    }),
    deps
  );

  const isOverStyles = {
    transformOrigin: "center",
    transform: "scale(1.2)",
    transitionDuration: "200ms",
  };

  const isNotValidDropStyles = {
    opacity: 0.4,
  };

  const style = Object.assign(
    {},
    isOver && isValidDrop ? isOverStyles : {},
    isDragging && !isValidDrop ? isNotValidDropStyles : {}
  );

  return (
    <div ref={drop} style={style}>
      {children}
    </div>
  );
};

export default Slot;
