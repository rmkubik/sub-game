import initMatrix from "./initMatrix";
import mapMatrix from "./mapMatrix";

function constructMatrix(constructFn, dimensions) {
  return mapMatrix(initMatrix(dimensions), (value, location) =>
    constructFn(location)
  );
}

export default constructMatrix;
