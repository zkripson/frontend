interface IKPIconButton {
  icon: "close" | "pause" | "ham";
  onClick: () => void;
  className?: string;
  variant?: "default" | "medium" | "small";
}
