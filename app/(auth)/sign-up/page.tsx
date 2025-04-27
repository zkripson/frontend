"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { KPCheckbox, KPDialougue, KPInput } from "@/components";

const schema = z.object({
  email: z.string().min(1, "Email is required").email(),
  username: z.string().optional(),
});

type SignUp = z.infer<typeof schema>;

const SignUp = () => {
  const [agreed, setAgreed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUp>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: SignUp) => {
    console.log(data);
  };

  return (
    <div className="flex items-center justify-center flex-1 pt-16">
      <KPDialougue
        title="Join the battle"
        subtitle="You need an account to play BATTLE.FUN."
        showCloseButton
        onClose={() => {}}
        showKripsonImage
        primaryCta={{
          label: "Continue",
          onClick: () => handleSubmit(onSubmit)(),
        }}
      >
        <div className="flex flex-col gap-4 self-stretch w-full max-w-[426px]">
          <KPInput
            name="email"
            label="Email address"
            placeholder="johndoe@email.com"
            register={register("email")}
            error={!!errors.email}
            className="w-full"
            type="email"
          />

          <KPInput
            name="username"
            label="Username"
            placeholder="(optional)"
            register={register("username")}
            error={!!errors.username}
            className="w-full"
            type="text"
          />

          <KPCheckbox
            checked={agreed}
            onChange={setAgreed}
            label="I agree to the Privacy Policy and Terms of Service"
            className="mt-2"
          />
        </div>
      </KPDialougue>
    </div>
  );
};

export default SignUp;
