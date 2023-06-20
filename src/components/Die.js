import React from "react";
import randIntBetween from "../utils/random/randIntBetween";

const Die = ({ value, delay, isSelected, onClick }) => {
  const [face, setFace] = React.useState(1);
  const [state, setState] = React.useState("rolling");

  React.useEffect(() => {
    let interval;

    if (state === "rolling") {
      interval = setInterval(() => setFace(randIntBetween(1, 6)), 80);
    } else {
      clearInterval(interval);
    }
  }, [state]);

  return (
    <div
      onClick={onClick}
      className={`die ${state}`}
      style={{
        animationDelay: `${delay}ms`,
        color: isSelected ? "#100440" : "white",
        backgroundColor: isSelected ? "white" : "transparent",
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
