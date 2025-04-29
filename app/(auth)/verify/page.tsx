"use client";
import { useState, useEffect } from "react";

import { KPDialougue } from "@/components";
import KPPinInput from "@/components/pin-input";
import useSystemFunctions from "@/hooks/useSystemFunctions";

const Verify = () => {
  const [pin, setPin] = useState("");
  const { navigate } = useSystemFunctions();

  const onSubmit = () => {
    console.log(pin);

    navigate.push("/farcaster");
  };

  const resend = () => {
    console.log("resend");
  };

  useEffect(() => {
    if (pin.length === 4) {
      onSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <KPDialougue
        title="check your email"
        subtitle="Please check registered email emailname@email.com and enter the code to verify"
        showCloseButton
        onClose={() => {}}
        showKripsonImage
      >
        <div className="flex flex-col gap-8 self-stretch w-full items-center">
          <KPPinInput
            onComplete={(pin) => {
              console.log("Entered PIN:", pin);
              setPin(pin);
            }}
          />

          <p className="text-[16px] leading-[16px] text-primary-50">
            Didn’t get an email?{" "}
            <span
              onClick={resend}
              className="font-bold underline underline-offset-2 cursor-pointer"
            >
              Resend Code
            </span>
          </p>
        </div>
      </KPDialougue>
    </div>
  );
};

export default Verify;
