import addLocations from "./addLocations";
import isLocationInBounds from "./isLocationInBounds";

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

export default getLocationsInDirection;
