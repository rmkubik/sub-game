import getDimensions from "../matrices/getDimensions";

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

export default isLocationInBounds;
