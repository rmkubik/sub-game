import removeIndex from "../arrays/removeIndex";
import randIntBetween from "./randIntBetween";

class Bag {
  items = [];

  constructor(...items) {
    this.items = items;
  }

  pick() {
    const randIndex = randIntBetween(0, this.items.length - 1);
    const picked = this.items[randIndex];
    this.items = removeIndex(this.items, randIndex);

    return picked;
  }

  add(item) {
    this.items.push(item);
  }
}

export default Bag;
