import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

interface SignInProps {
  onLoginSuccess: (token: string) => void;
}

export default function SignIn({ onLoginSuccess }: SignInProps) {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <>
      <PageMeta
        title="Admin Panel - Sign In"
        description="Sign in to the admin panel"
      />
      <AuthLayout>
        {showForgotPassword ? (
          <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
        ) : (
          <SignInForm
            onLoginSuccess={onLoginSuccess}
            onForgotPassword={() => setShowForgotPassword(true)}
          />
        )}
      </AuthLayout>
    </>
  );
}
