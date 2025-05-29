"use client";
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";
import { useLoginToFrame } from "@privy-io/react-auth/farcaster";
import { usePrivy } from "@privy-io/react-auth";

import { setFarcasterContext } from "@/store/app";
import useSystemFunctions from "./useSystemFunctions";

const useConnectToFarcaster = () => {
  const { ready, authenticated } = usePrivy();
  const { initLoginToFrame, loginToFrame } = useLoginToFrame();
  const { dispatch } = useSystemFunctions();

  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);

  const loginToFarcasterFrame = async () => {
    try {
      if (!ready || authenticated) return;

      const { nonce } = await initLoginToFrame();

      const result = await sdk.actions.signIn({ nonce: nonce });

      await loginToFrame({
        message: result.message,
        signature: result.signature,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Detect if app is loaded in a Farcaster frame
  useEffect(() => {
    const detectFrameEnvironment = async () => {
      const isMiniApp = await sdk.isInMiniApp();

      setIsFrameLoaded(isMiniApp);

      if (isMiniApp) {
        setTimeout(() => {
          sdk.actions.addMiniApp();
        }, 5000);
      }
    };

    detectFrameEnvironment();
  }, []);

  useEffect(
    function initFrameSDK() {
      const load = async () => {
        const user = await sdk.context;

        if (user?.user) {
          dispatch(setFarcasterContext(user.user));
        }
        sdk.actions.ready();
      };

      if (sdk && !isSDKLoaded) {
        setIsSDKLoaded(true);
        load();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSDKLoaded]
  );

  return { loginToFarcasterFrame, isSDKLoaded, isFrameLoaded };
};

export default useConnectToFarcaster;
