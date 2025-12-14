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
        title="Panel Administracyjny - Logowanie"
        description="Zaloguj się do panelu administracyjnego"
      />
      <AuthLayout>
        <SignInForm onLoginSuccess={onLoginSuccess} />
      </AuthLayout>
    </>
  );
}
