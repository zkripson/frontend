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
  "After you sink a ship, mark nearby squares empty. Ships can’t touch, so they can’t be there.",
  "Shoot every other square like a checkerboard to find ships faster.",
  "Shoot edges and corners first. Big ships often sit at the border.",
  "After you hit, shoot up, down, left, or right next to it to sink the ship.",
  "Finish sinking a ship before hunting others or you’ll lose track.",
  "Keep your ships apart. Clumped ships are easy to find.",
  "Remember your fleet: one size-5, one size-4, two size-3, and one size-2 ship.",
  "Halfway through, change your shot pattern so you’re not predictable.",
  "2-square ships can hide in corners. Don’t skip shooting there.",
  "Use hit/miss marks to keep track and plan your next shot.",
];

export { gameTips, stakeOptions };
