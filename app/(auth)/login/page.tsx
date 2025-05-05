"use client";
import { useState } from "react";
import { useCreateWallet, useLoginWithEmail, User } from "@privy-io/react-auth";

import useSystemFunctions from "@/hooks/useSystemFunctions";
import OTP from "./otp";
import EmailLogin from "./email";
import AuthLayout from "../layout";

const Login = () => {
  const { createWallet } = useCreateWallet();
  const { sendCode, loginWithCode, state } = useLoginWithEmail({
    onError: (error) => {
      console.error(error);
    },
    onComplete: async ({ isNewUser, user }) => completeAuth(user, isNewUser),
  });

  const [email, setEmail] = useState("");
  const { navigate } = useSystemFunctions();

  const [page, setPage] = useState<"email" | "otp">("email");

  const completeAuth = async (user: User, isNewUser: boolean) => {
    const linkedTwitter = user?.linkedAccounts?.find(
      (account) => account.type === "twitter_oauth"
    );
    const linkedFarcaster = user?.linkedAccounts?.find(
      (account) => account.type === "farcaster"
    );

    if (!user.wallet) {
      await createWallet();
    }

    if (isNewUser || (!linkedFarcaster && !linkedTwitter)) {
      return navigate.push("/social");
    }

    return navigate.push("/new-game");
  };

  const showOtp = () => {
    setPage("otp");
  };

  return (
    <AuthLayout>
      <div className="w-full h-full flex items-center justify-center">
        {page === "email" ? (
          <EmailLogin
            showOtp={showOtp}
            state={state}
            sendCode={sendCode}
            setEmail={setEmail}
          />
        ) : (
          <OTP
            state={state}
            loginWithCode={loginWithCode}
            sendCode={sendCode}
            email={email}
          />
        )}
      </div>
    </AuthLayout>
  );
};

export default Login;
