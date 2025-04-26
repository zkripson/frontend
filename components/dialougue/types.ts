interface ButtonProps {
  label: string;
  onClick: () => void;
}

interface KPDialougueProps {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
  primaryCta?: ButtonProps;
  secondaryCta?: ButtonProps;
  showKripsonImage?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}
