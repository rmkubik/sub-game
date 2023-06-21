import React from "react";
import randIntBetween from "../utils/random/randIntBetween";
import { useDrag } from "react-dnd";
import ItemTypes from "../utils/dragAndDrop/itemTypes";

const Die = ({ dieIndex, value, delay, onClick }) => {
  const [face, setFace] = React.useState(1);
  const [state, setState] = React.useState("rolling");

  React.useEffect(() => {
    let interval;

    if (state === "rolling") {
      interval = setInterval(() => setFace(randIntBetween(1, 6)), 80);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [state]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.DIE,
    item: { dieIndex },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();

      if (item && dropResult) {
        // alert(`You dropped ${item.name} into ${dropResult.name}!`);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  }));

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`die ${state}`}
      style={{
        animationDelay: `${delay}ms`,
        color: "#100440",
        backgroundColor: "white",
        opacity: isDragging ? 0.4 : 1,
      }}
      onAnimationEnd={(e) => {
        if (e.animationName === "rolling") {
          setState("rolled");
        }
      }}
    >
      {state === "rolling" ? face : value}
    </div>
  );
};

export default Die;
