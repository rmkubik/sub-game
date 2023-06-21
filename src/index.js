import ReactDOM from "react-dom";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./main.css";
import mapMatrix from "./utils/matrices/mapMatrix";
import constructMatrix from "./utils/matrices/constructMatrix";
import areLocationsEqual from "./utils/locations/areLocationsEqual";
import randIntBetween from "./utils/random/randIntBetween";
import Grid from "./components/Grid";
import Die from "./components/Die";
import generationState from "./generation/state";
import Stats from "./components/Stats";
import Actions from "./components/actions/Actions";

const onTheIslandSrc = new URL(
  "./On the Island - Godmode.mp3",
  import.meta.url
);

const maxHealth = 3;
const App = () => {
  const audioRef = React.useRef();
  React.useEffect(() => {
    const onClick = () => {
      audioRef.current?.play();
    };
    document.addEventListener("click", onClick);
    return document.removeEventListener("click", onClick);
  }, []);
  const [tiles, setTiles] = React.useState(
    constructMatrix(
      (location) => {
        if (
          generationState.height - location.row <=
          generationState.depths[location.col]
        ) {
          return "⬜️";
        }

        if (generationState.pickUps[location.col] === location.row) {
          return "💰";
        }

        return ".";
      },
      { width: generationState.width, height: generationState.height }
    )
  );
  const [die, setDie] = React.useState([
    randIntBetween(1, 6),
    randIntBetween(1, 6),
    randIntBetween(1, 6),
  ]);
  const [nextDiceTrayKey, setNextDiceTrayKey] = React.useState(0);
  const [location, setLocation] = React.useState(generationState.startLocation);
  const [oxygen, setOxygen] = React.useState(10);
  const [crew, setCrew] = React.useState(3);
  const [damage, setDamage] = React.useState(0);
  const [usedActions, setUsedActions] = React.useState([
    false,
    false,
    false,
    false,
  ]);
  const [points, setPoints] = React.useState(0);

  const isGameOver = damage >= maxHealth || oxygen <= 0 || location.row < 0;

  const calcNextDiceTrayKey = () => {
    const newDiceTrayKey = nextDiceTrayKey + 1;

    setNextDiceTrayKey(newDiceTrayKey);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <div>
          <div style={{ position: "relative" }}>
            {isGameOver ? (
              <div
                style={{
                  position: "absolute",
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  color: "red",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "3rem",
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                    }}
                  >
                    GAME OVER
                  </p>
                  <p
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      marginTop: "0",
                    }}
                  >
                    {oxygen <= 0 && "Ran out of oxygen!"}
                    {damage >= 3 && "Took too much damage!"}
                    {location.row < 0 && "Breached the surface!"}
                  </p>
                  <p>Score: {points} points</p>
                </div>
              </div>
            ) : null}
            <Grid
              tiles={mapMatrix(tiles, (tile, currentLocation) => {
                if (areLocationsEqual(location, currentLocation)) {
                  return "🟢";
                }

                return tile;
              })}
            />
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ marginRight: "2rem" }}>
              <h3>Crew Dice</h3>
              <div className="dice-tray" key={nextDiceTrayKey}>
                {die.map((value, index) => (
                  <Die
                    dieIndex={index}
                    key={index}
                    value={value}
                    delay={index * 50}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  setDie([
                    randIntBetween(1, 6),
                    randIntBetween(1, 6),
                    randIntBetween(1, 6),
                  ]);
                  calcNextDiceTrayKey();
                  setOxygen(oxygen - die.length);
                  setUsedActions([false, false, false, false]);
                }}
              >
                Reroll - {die.length} O2
              </button>
            </div>
            <Actions
              usedActions={usedActions}
              setUsedActions={setUsedActions}
              die={die}
              setDie={setDie}
              location={location}
              setLocation={setLocation}
              tiles={tiles}
              setTiles={setTiles}
              damage={damage}
              setDamage={setDamage}
              points={points}
              setPoints={setPoints}
              oxygen={oxygen}
              setOxygen={setOxygen}
            />
            <Stats
              oxygen={oxygen}
              crew={crew}
              maxHealth={maxHealth}
              damage={damage}
              points={points}
            />
            <audio ref={audioRef} src={onTheIslandSrc} autoPlay loop></audio>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
