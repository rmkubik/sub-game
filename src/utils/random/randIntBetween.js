function randIntBetween(low, high) {
  // range: [low, high]
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

export default randIntBetween;
