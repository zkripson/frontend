import useSystemFunctions from "@/hooks/useSystemFunctions";
import { setAppIsReady, setIsInGame } from ".";

const useAppActions = () => {
  const { dispatch } = useSystemFunctions();

  const setAppReady = (isReady: boolean) => {
    dispatch(setAppIsReady(isReady));
  };

  const setInGame = (isInGame: boolean) => {
    dispatch(setIsInGame(isInGame));
  };

  return {
    setAppReady,
    setInGame,
  };
};

export default useAppActions;
