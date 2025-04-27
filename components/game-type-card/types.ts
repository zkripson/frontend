interface IKPGameTypeCard {
  name: string;
  description: string;
  action?: () => void;
  status?: string;
  className?: string;
}
