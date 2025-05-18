interface IKPGameCodeInput {
  onBack?: () => void;
  setCanAccept?: (state: boolean) => void;
  setCode?: (code: string) => void;
}
