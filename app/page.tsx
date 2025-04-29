import AuthLayout from "./(auth)/layout";
import SignUp from "./(auth)/sign-up/page";

export default function HomePage() {
  return (
    <AuthLayout>
      <SignUp />
    </AuthLayout>
  );
}
