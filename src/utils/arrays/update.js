function update(array, index, value) {
  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}

export default update;
