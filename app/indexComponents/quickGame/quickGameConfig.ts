const stakeOptions: {
  value: StakeValue;
  label: string;
  description?: string;
}[] = [
  { value: "free", label: "Free", description: "For first timers" },
  { value: "2", label: "$2" },
  { value: "5", label: "$5" },
];

const gameTips = [
  "Mark cells adjacent to each miss—ships can’t touch, so you can safely eliminate them.",
  "Fire in a checkerboard pattern to cover the grid efficiently without wasted shots.",
  "Target edge and corner cells early; large ships often occupy perimeter spaces.",
  "After a hit, check only inline adjacent cells—ships run straight lines only.",
  "Focus on sinking a hit ship completely before resuming your grid search.",
  "Space your ships evenly; avoid clusters that opponents can easily target.",
  "Remember ship lengths—plan your shots to match sizes of 5, 4, 3, and 2 cells.",
  "Switch firing patterns mid-game to prevent opponents from predicting your strategy.",
  "Use corner shots for small ships—two-cell submarines can hide near edges.",
  "Keep track of misses and hits on a separate grid to refine your target zones.",
];

export { gameTips, stakeOptions };
