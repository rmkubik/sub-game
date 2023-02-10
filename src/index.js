import ReactDOM from "react-dom";
import React from "react";
import "./main.css";

function getLocation(matrix, location) {
  return matrix[location.row][location.col];
}

function addLocations(a, b) {
  return {
    row: a.row + b.row,
    col: a.col + b.col,
  };
}

function isLocationInBounds(matrix, location) {
  const dimensions = getDimensions(matrix);

  if (location.row < 0) {
    return false;
  }

  if (location.row >= dimensions.height) {
    return false;
  }

  if (location.col < 0) {
    return false;
  }

  if (location.col >= dimensions.width) {
    return false;
  }

  return true;
}

function getLocationsInDirection(origin, direction, matrix) {
  let foundLocations = [];
  let target = origin;

  while (isLocationInBounds(matrix, target)) {
    foundLocations.push(target);
    // Pick next target in direction
    target = addLocations(target, direction);
  }

  return foundLocations;
}

function clamp(value, min, max) {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

function initMatrix({ width, height }) {
  return new Array(height).fill(0).map((row) => new Array(width).fill(0));
}

function constructMatrix(constructFn, dimensions) {
  return mapMatrix(initMatrix(dimensions), (value, location) =>
    constructFn(location)
  );
}

function mapMatrix(matrix, callback) {
  return matrix.map((row, rowIndex) =>
    row.map((cell, colIndex) =>
      callback(cell, { row: rowIndex, col: colIndex })
    )
  );
}

function updateLocation(location, value, matrix) {
  return mapMatrix(matrix, (currentValue, currentLocation) => {
    if (areLocationsEqual(location, currentLocation)) {
      return value;
    }

    return currentValue;
  });
}

function areLocationsEqual(locationA, locationB) {
  return locationA.row === locationB.row && locationA.col === locationB.col;
}

function getDimensions(matrix) {
  return {
    width: matrix[0].length,
    height: matrix.length,
  };
}

function randIntBetween(low, high) {
  // range: [low, high]
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function pickRandomlyFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function removeIndex(array, index) {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

function update(array, index, value) {
  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}

const Grid = ({ tiles, className, children }) => {
  const { width, height } = getDimensions(tiles);
  const defaultRenderTile = (tile) => (
    <div
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

const height = 10;
const width = 30;
const startLocation = { row: 5, col: 0 };
let pickUps;
let depths;

function generateLevel() {
  pickUps = [];
  depths = [3];

  for (let i = 1; i < width; i += 1) {
    depths.push(clamp(depths[i - 1] + randIntBetween(-1, 1), 1, 7));

    if (randIntBetween(1, 100) <= 20) {
      pickUps.push(randIntBetween(depths[i] + 1, height - 1));
    } else {
      pickUps.push(-1);
    }
  }
}

generateLevel();

const maxHealth = 3;
const App = () => {
  const [tiles, setTiles] = React.useState(
    constructMatrix(
      (location) => {
        if (height - location.row <= depths[location.col]) {
          return "⬜️";
        }

        if (pickUps[location.col] === location.row) {
          return "💰";
        }

        return ".";
      },
      { width, height }
    )
  );
  const [die, setDie] = React.useState([
    randIntBetween(1, 6),
    randIntBetween(1, 6),
    randIntBetween(1, 6),
  ]);
  const [nextDiceTrayKey, setNextDiceTrayKey] = React.useState(0);
  const [selectedDieIndex, setSelectedDieIndex] = React.useState(0);
  const [location, setLocation] = React.useState(startLocation);
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

                  if (newLocation.col >= width) {
                    // Generate new screen
                    generateLevel();
                    newLocation = startLocation;
                    newTiles = constructMatrix(
                      (location) => {
                        if (height - location.row <= depths[location.col]) {
                          return "⬜️";
                        }

                        if (pickUps[location.col] === location.row) {
                          return "💰";
                        }

                        return ".";
                      },
                      { width, height }
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

                  const newRow = height - depths[location.col] - 1;
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
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
