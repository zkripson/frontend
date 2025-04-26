interface IKPClickAnimation {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  stopPropagation?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  title?: string;
}
