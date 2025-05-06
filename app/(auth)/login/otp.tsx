import { useState, useEffect } from "react";
import {
  LoginWithCode,
  OtpFlowState,
  SendCodeToEmail,
} from "@privy-io/react-auth";
import { KPDialougue } from "@/components";
import KPPinInput from "@/components/pin-input";

interface OTPProps {
  state: OtpFlowState;
  loginWithCode: (props: LoginWithCode) => void;
  sendCode: (props: SendCodeToEmail) => void;
  email: string;
}

const OTP = ({ state, loginWithCode, sendCode, email }: OTPProps) => {
  const [pin, setPin] = useState("");

  const resend = () => {
    sendCode({ email });
  };

  const loading = state.status === "submitting-code";

  useEffect(() => {
    if (pin.length === 6) {
      loginWithCode({ code: pin });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  return (
    <KPDialougue
      title="check your email"
      subtitle={
        <>
          Please check registered email{" "}
          <span className="font-bold text-primary-450">
            emailname@email.com
          </span>{" "}
          and enter the code to verify
        </>
      }
      showCloseButton
      onClose={() => {}}
      showKripsonImage
    >
      <div className="flex flex-col gap-8 self-stretch w-full items-center">
        <KPPinInput
          onComplete={(pin) => {
            setPin(pin);
          }}
          loading={loading}
        />

        <p className="text-[16px] max-sm:text-[10.69px] leading-[16px] text-primary-50">
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
  );
};

export default OTP;
