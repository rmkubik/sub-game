import ReactDOM from "react-dom";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./main.css";
import getLocation from "./utils/locations/getLocation";
import getLocationsInDirection from "./utils/locations/getLocationsInDirection";
import clamp from "./utils/math/clamp";
import mapMatrix from "./utils/matrices/mapMatrix";
import constructMatrix from "./utils/matrices/constructMatrix";
import areLocationsEqual from "./utils/locations/areLocationsEqual";
import updateLocation from "./utils/locations/updateLocation";
import randIntBetween from "./utils/random/randIntBetween";
import removeIndex from "./utils/arrays/removeIndex";
import update from "./utils/arrays/update";
import Grid from "./components/Grid";
import Die from "./components/Die";
import generationState from "./generation/state";
import generateLevel from "./generation/generateLevel";

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
  const [selectedDieIndex, setSelectedDieIndex] = React.useState(0);
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
                    onClick={() => setSelectedDieIndex(index)}
                    key={index}
                    value={value}
                    delay={index * 50}
                    isSelected={selectedDieIndex === index}
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
            <div style={{ marginRight: "2rem" }}>
              <h3>Crew Actions</h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  opacity: usedActions[0] ? "0.5" : "1",
                }}
              >
                <div
                  className="die"
                  style={{ display: "inline-block" }}
                  onClick={() => {
                    if (usedActions[0]) {
                      return;
                    }

                    setDie(removeIndex(die, selectedDieIndex));
                    setSelectedDieIndex(0);

                    const locationsInDirection = getLocationsInDirection(
                      location,
                      { row: 0, col: 1 },
                      tiles
                    );
                    const firstIndexOfTerrain = locationsInDirection
                      .map((inDirLoc) => getLocation(tiles, inDirLoc))
                      .findIndex((tile) => tile === "⬜️");

                    const distanceBeforeWall =
                      firstIndexOfTerrain === -1
                        ? Number.MAX_VALUE
                        : firstIndexOfTerrain - 1;

                    if (die[selectedDieIndex] > distanceBeforeWall) {
                      setDamage(damage + 1);
                    }

                    const distance = Math.min(
                      die[selectedDieIndex],
                      distanceBeforeWall
                    );

                    const locationsVisited = locationsInDirection.slice(
                      0,
                      distance + 1
                    );
                    const visitedTreasureLocations = locationsVisited.filter(
                      (location) => {
                        const tile = getLocation(tiles, location);
                        return tile === "💰";
                      }
                    );

                    let newTiles = tiles;
                    visitedTreasureLocations.forEach((location) => {
                      newTiles = updateLocation(location, ".", newTiles);
                    });

                    let newLocation = {
                      row: location.row,
                      col: location.col + distance,
                    };

                    if (newLocation.col >= generationState.width) {
                      // Generate new screen
                      generateLevel();
                      newLocation = generationState.startLocation;
                      newTiles = constructMatrix(
                        (location) => {
                          if (
                            generationState.height - location.row <=
                            generationState.depths[location.col]
                          ) {
                            return "⬜️";
                          }

                          if (
                            generationState.pickUps[location.col] ===
                            location.row
                          ) {
                            return "💰";
                          }

                          return ".";
                        },
                        {
                          width: generationState.width,
                          height: generationState.height,
                        }
                      );
                    }

                    setTiles(newTiles);
                    setPoints(points + visitedTreasureLocations.length);
                    setUsedActions(update(usedActions, 0, true));
                    setLocation(newLocation);
                  }}
                >
                  {usedActions[0] ? "X" : ""}
                </div>
                <span>Sail - move # forward</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  opacity: usedActions[1] ? "0.5" : "1",
                }}
              >
                <div
                  className="die"
                  style={{ display: "inline-block" }}
                  onClick={() => {
                    if (usedActions[1]) {
                      return;
                    }

                    const selectedDie = die[selectedDieIndex];

                    if (selectedDie > 3) {
                      return;
                    }

                    const aboveLocation = {
                      row: location.row - 1,
                      col: location.col,
                    };
                    const aboveTile = getLocation(tiles, aboveLocation);

                    if (aboveTile === "💰") {
                      setTiles(updateLocation(aboveLocation, ".", tiles));
                      setPoints(points + 1);
                    }

                    setDie(removeIndex(die, selectedDieIndex));
                    setSelectedDieIndex(0);

                    setUsedActions(update(usedActions, 1, true));
                    setOxygen(clamp(oxygen + selectedDie, 0, 10));
                    setLocation(aboveLocation);
                  }}
                >
                  {usedActions[1] ? "X" : "≤3"}
                </div>
                <span>Refill - move 1 up, add # O2</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  opacity: usedActions[2] ? "0.5" : "1",
                }}
              >
                <div
                  className="die"
                  style={{ display: "inline-block" }}
                  onClick={() => {
                    if (usedActions[2]) {
                      return;
                    }

                    const selectedDie = die[selectedDieIndex];

                    if (selectedDie !== 3) {
                      return;
                    }

                    const newRow =
                      generationState.height -
                      generationState.depths[location.col] -
                      1;
                    const distance = newRow - location.row;
                    const locationsInDirection = getLocationsInDirection(
                      location,
                      { row: 1, col: 0 },
                      tiles
                    );
                    const locationsVisited = locationsInDirection.slice(
                      0,
                      distance + 1
                    );
                    const visitedTreasureLocations = locationsVisited.filter(
                      (location) => {
                        const tile = getLocation(tiles, location);
                        return tile === "💰";
                      }
                    );

                    let newTiles = tiles;
                    visitedTreasureLocations.forEach((location) => {
                      newTiles = updateLocation(location, ".", newTiles);
                    });

                    setTiles(newTiles);
                    setPoints(points + visitedTreasureLocations.length);

                    setDie(removeIndex(die, selectedDieIndex));
                    setSelectedDieIndex(0);

                    setUsedActions(update(usedActions, 2, true));
                    setLocation({
                      row: newRow,
                      col: location.col,
                    });
                  }}
                >
                  {usedActions[2] ? "X" : "3"}
                </div>
                <span>Anchor - move to ocean floor</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  opacity: usedActions[3] ? "0.5" : "1",
                }}
              >
                <div
                  className="die"
                  style={{ display: "inline-block" }}
                  onClick={() => {
                    if (usedActions[3]) {
                      return;
                    }

                    const selectedDie = die[selectedDieIndex];

                    if (selectedDie !== 6) {
                      return;
                    }

                    setDie(removeIndex(die, selectedDieIndex));
                    setSelectedDieIndex(0);

                    setUsedActions(update(usedActions, 3, true));
                    setDamage(clamp(damage - 1, 0, 3));
                  }}
                >
                  {usedActions[3] ? "X" : "6"}
                </div>
                <span>Repair - add 1 health</span>
              </div>
            </div>
            <div>
              <h3>Ship Stats</h3>
              <p>Oxygen - {oxygen}/10</p>
              <p>Crew Dice - {crew}</p>
              <p>
                Health - {maxHealth - damage}/{maxHealth}
              </p>
              <p>Points - {points}</p>
            </div>
            <audio ref={audioRef} src={onTheIslandSrc} autoPlay loop></audio>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
