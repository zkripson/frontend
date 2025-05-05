import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OtpFlowState,
  SendCodeToEmail,
  useLoginWithEmail,
} from "@privy-io/react-auth";
import { z } from "zod";

import { KPCheckbox, KPDialougue, KPInput } from "@/components";

const schema = z.object({
  email: z.string().min(1, "Email is required").email(),
});

type Login = z.infer<typeof schema>;

interface EmailLoginProps {
  showOtp: () => void;
  sendCode: (props: SendCodeToEmail) => void;
  state: OtpFlowState;
  setEmail: (email: string) => void;
}

const EmailLogin = ({
  showOtp,
  sendCode,
  state,
  setEmail,
}: EmailLoginProps) => {
  const [agreed, setAgreed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Login>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Login) => {
    try {
      if (!agreed) return;
      setEmail(data.email);

      await sendCode({ email: data.email });
      showOtp();
    } catch (error) {
      console.error(error);
    }
  };

  const loading = state.status === "sending-code";
  const ctaActions = {
    title: "Continue",
    onClick: () => handleSubmit(onSubmit)(),
    loading: loading,
  };

  return (
    <KPDialougue
      title="Join the battle"
      subtitle="You need an account to play BATTLE.FUN."
      showCloseButton
      onClose={() => {}}
      showKripsonImage
      primaryCta={ctaActions}
    >
      <div className="flex flex-col gap-4 max-sm:gap-4 self-stretch w-full">
        <KPInput
          name="email"
          label="Email address"
          placeholder="johndoe@email.com"
          register={register("email")}
          error={!!errors.email}
          className="w-full"
          type="email"
        />

        <KPCheckbox
          checked={agreed}
          onChange={setAgreed}
          className="mt-2"
          label={
            <>
              I agree to the{" "}
              <a href="#" target="_blank" className="underline font-bold">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="#" target="_blank" className="underline font-bold">
                Terms of Service
              </a>
            </>
          }
        />
      </div>
    </KPDialougue>
  );
};

export default EmailLogin;
