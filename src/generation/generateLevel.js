import constructArray from "../utils/arrays/constructArray";
import clamp from "../utils/math/clamp";
import Bag from "../utils/random/Bag";
import pickRandomlyFromArray from "../utils/random/pickRandomlyFromArray";
import randIntBetween from "../utils/random/randIntBetween";
import generationState from "./state";

function generateLevel() {
  generationState.pickUps = [-1];
  generationState.depths = [3];

  // Use array to weight pick up count likelihoods
  const pickUpCount = pickRandomlyFromArray([
    1, 2, 2, 3, 3, 3, 3, 4, 4, 5, 5, 6,
  ]);
  // Create a bag of 1 -> width - 1 (1-29 at time of writing)
  const indicesBag = new Bag(
    ...constructArray(generationState.width - 1, (x) => x + 1)
  );
  const pickUpIndices = constructArray(pickUpCount).map(() =>
    indicesBag.pick()
  );

  for (let i = 1; i < generationState.width; i += 1) {
    generationState.depths.push(
      clamp(generationState.depths[i - 1] + randIntBetween(-1, 1), 1, 7)
    );

    if (pickUpIndices.some((pickUpIndex) => pickUpIndex === i)) {
      console.log("placing pick up");
      generationState.pickUps.push(
        randIntBetween(
          generationState.height - generationState.depths[i] - 1,
          0
        )
      );
    } else {
      generationState.pickUps.push(-1);
    }
  }
}

generateLevel();

export default generateLevel;
