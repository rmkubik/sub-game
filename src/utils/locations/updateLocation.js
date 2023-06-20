import mapMatrix from "../matrices/mapMatrix";
import areLocationsEqual from "./areLocationsEqual";

function updateLocation(location, value, matrix) {
  return mapMatrix(matrix, (currentValue, currentLocation) => {
    if (areLocationsEqual(location, currentLocation)) {
      return value;
    }

    return currentValue;
  });
}

export default updateLocation;
