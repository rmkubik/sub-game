function mapMatrix(matrix, callback) {
  return matrix.map((row, rowIndex) =>
    row.map((cell, colIndex) =>
      callback(cell, { row: rowIndex, col: colIndex })
    )
  );
}

export default mapMatrix;
