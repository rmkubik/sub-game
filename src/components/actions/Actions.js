import React from "react";
import removeIndex from "../../utils/arrays/removeIndex";
import getLocationsInDirection from "../../utils/locations/getLocationsInDirection";
import getLocation from "../../utils/locations/getLocation";
import clamp from "../../utils/math/clamp";
import update from "../../utils/arrays/update";
import updateLocation from "../../utils/locations/updateLocation";
import generateLevel from "../../generation/generateLevel";
import constructMatrix from "../../utils/matrices/constructMatrix";
import generationState from "../../generation/state";
import Slot from "./Slot";

const Actions = ({
  usedActions,
  setUsedActions,
  die,
  setDie,
  location,
  setLocation,
  tiles,
  setTiles,
  damage,
  setDamage,
  points,
  setPoints,
  oxygen,
  setOxygen,
}) => {
  return (
    <div style={{ marginRight: "2rem" }}>
      <h3>Crew Actions</h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          opacity: usedActions[0] ? "0.5" : "1",
        }}
      >
        <Slot
          deps={[usedActions, die, location, tiles, damage, points, oxygen]}
          onDrop={(item) => {
            if (usedActions[0]) {
              return;
            }

            const { dieIndex } = item;

            setDie(removeIndex(die, dieIndex));

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

            if (die[dieIndex] > distanceBeforeWall) {
              setDamage(damage + 1);
            }

            const distance = Math.min(die[dieIndex], distanceBeforeWall);

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

                  if (generationState.pickUps[location.col] === location.row) {
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
          <div className="die" style={{ display: "inline-block" }}>
            {usedActions[0] ? "X" : ""}
          </div>
        </Slot>
        <span>Sail - move # forward</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          opacity: usedActions[1] ? "0.5" : "1",
        }}
      >
        <Slot
          deps={[usedActions, die, location, tiles, damage, points, oxygen]}
          onDrop={(item) => {
            if (usedActions[1]) {
              return;
            }

            const { dieIndex } = item;

            const selectedDie = die[dieIndex];

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

            setDie(removeIndex(die, dieIndex));

            setUsedActions(update(usedActions, 1, true));
            setOxygen(clamp(oxygen + selectedDie, 0, 10));
            setLocation(aboveLocation);
          }}
        >
          <div className="die" style={{ display: "inline-block" }}>
            {usedActions[1] ? "X" : "≤3"}
          </div>
        </Slot>
        <span>Refill - move 1 up, add # O2</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          opacity: usedActions[2] ? "0.5" : "1",
        }}
      >
        <Slot
          deps={[usedActions, die, location, tiles, damage, points, oxygen]}
          onDrop={(item) => {
            if (usedActions[2]) {
              return;
            }

            const { dieIndex } = item;

            const selectedDie = die[dieIndex];

            if (selectedDie !== 3) {
              return;
            }

            const newRow =
              generationState.height - generationState.depths[location.col] - 1;
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

            setDie(removeIndex(die, dieIndex));

            setUsedActions(update(usedActions, 2, true));
            setLocation({
              row: newRow,
              col: location.col,
            });
          }}
        >
          <div className="die" style={{ display: "inline-block" }}>
            {usedActions[2] ? "X" : "3"}
          </div>
        </Slot>
        <span>Anchor - move to ocean floor</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          opacity: usedActions[3] ? "0.5" : "1",
        }}
      >
        <Slot
          deps={[usedActions, die, location, tiles, damage, points, oxygen]}
          onDrop={(item) => {
            if (usedActions[3]) {
              return;
            }

            const { dieIndex } = item;

            const selectedDie = die[dieIndex];

            if (selectedDie !== 6) {
              return;
            }

            setDie(removeIndex(die, dieIndex));

            setUsedActions(update(usedActions, 3, true));
            setDamage(clamp(damage - 1, 0, 3));
          }}
        >
          <div className="die" style={{ display: "inline-block" }}>
            {usedActions[3] ? "X" : "6"}
          </div>
        </Slot>
        <span>Repair - add 1 health</span>
      </div>
    </div>
  );
};

export default Actions;
