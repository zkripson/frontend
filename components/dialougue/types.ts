interface KPDialougueProps {
  title?: string;
  children: React.ReactNode;
  subtitle?: string | React.ReactNode;
  primaryCta?: IKPButton;
  secondaryCta?: IKPButton;
  showKripsonImage?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  icon?: "farcaster" | "copy" | "arrow";
  iconPosition?: "left" | "right";
  ctaText?: string;
  className?: string;
  showPoints?: boolean;
}
