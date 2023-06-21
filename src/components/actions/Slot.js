import React from "react";
import { useDrop } from "react-dnd";
import ItemTypes from "../../utils/dragAndDrop/itemTypes";

const Slot = ({ onDrop, deps = [], children }) => {
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.DIE,
      drop: (item) => {
        onDrop(item);

        return { name: "Dustbin" };
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    deps
  );

  return <div ref={drop}>{children}</div>;
};

export default Slot;
