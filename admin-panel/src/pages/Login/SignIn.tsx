import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

interface SignInProps {
  onLoginSuccess: (token: string) => void;
}

export default function SignIn({ onLoginSuccess }: SignInProps) {
  return (
    <>
      <PageMeta
        title="Admin Panel - Login"
        description="Sign in to the admin panel"
      />
      <AuthLayout>
        <SignInForm onLoginSuccess={onLoginSuccess} />
      </AuthLayout>
    </>
  );
}
