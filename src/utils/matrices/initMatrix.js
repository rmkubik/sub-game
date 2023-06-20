function initMatrix({ width, height }) {
  return new Array(height).fill(0).map((row) => new Array(width).fill(0));
}

export default initMatrix;
