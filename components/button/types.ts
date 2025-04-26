type ButtonVariants = "primary" | "secondary" | "tertiary";

interface IKPButton {
  variant?: ButtonVariants;
  onClick?: () => void;
  title: string;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  className?: string;
  isMachine?: boolean;
}
