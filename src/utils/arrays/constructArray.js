function constructArray(length, constructorFn = (x) => x) {
  const array = [];

  for (let i = 0; i < length; i += 1) {
    array[i] = constructorFn(i);
  }

  return array;
}

export default constructArray;
