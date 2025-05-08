import useSystemFunctions from "@/hooks/useSystemFunctions";
import { setAppIsReady, setIsInGame, setToast } from ".";

const useAppActions = () => {
  const { dispatch } = useSystemFunctions();

  const setAppReady = (isReady: boolean) => {
    dispatch(setAppIsReady(isReady));
  };

  const setInGame = (isInGame: boolean) => {
    dispatch(setIsInGame(isInGame));
  };

  const showToast = (message: string, type: Toast) => {
    dispatch(setToast({ message, type, show: true }));

    setTimeout(
      () => dispatch(setToast({ message: "", type: "success", show: false })),
      5000
    );
  };

  const hideToast = () => {
    dispatch(setToast({ message: "", type: "success", show: false }));
  };

  return {
    setAppReady,
    setInGame,
    hideToast,
    showToast,
  };
};

export default useAppActions;
