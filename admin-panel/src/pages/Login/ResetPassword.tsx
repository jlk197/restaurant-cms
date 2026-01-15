import { useNavigate, useSearchParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleSuccess = () => {
    navigate("/login");
  };

  if (!token) {
    return (
      <>
        <PageMeta
          title="Admin Panel - Reset Password"
          description="Reset your password"
        />
        <AuthLayout>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Invalid Reset Link
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Admin Panel - Reset Password"
        description="Reset your password"
      />
      <AuthLayout>
        <ResetPasswordForm token={token} onSuccess={handleSuccess} />
      </AuthLayout>
    </>
  );
}

