import useAppActions from "@/store/app/actions";
import { useState } from "react";

const useCopy = (toastText = "Copied url") => {
  const [hasCopied, setHasCopied] = useState(false);
  const { showToast } = useAppActions();

  const handleCopy = (text: string, isInvite?: boolean) => {
    const domain = window?.location?.origin;
    const inviteLink = `${domain}/join-game?code=${text}`;

    navigator.clipboard.writeText(isInvite ? inviteLink : text);
    setHasCopied(true);

    showToast(toastText, "info");

    setTimeout(() => {
      setHasCopied(false);
    }, 3000);
  };

  return { handleCopy, hasCopied };
};

export default useCopy;
