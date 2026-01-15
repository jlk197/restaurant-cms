import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import administratorService from "../../services/administratorService";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await administratorService.forgotPassword(email);

      if (response.success) {
        setSuccess(response.message || "If an account with that email exists, a password reset link has been sent.");
        setEmail("");
      } else {
        setError(response.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      console.log(err);
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-5">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-sm text-green-600 bg-green-50 rounded-xl border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            {success}
          </div>
        )}

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="admin@cms.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="pt-3 space-y-3">
          <Button className="w-full" size="sm" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
          
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            disabled={isLoading}
          >
            Back to Login
          </button>
        </div>
      </div>
    </form>
  );
}

