import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import administratorService from "../../services/administratorService";

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export default function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await administratorService.resetPassword(token, newPassword);

      if (response.success) {
        setSuccess(response.message || "Password has been reset successfully.");
        setNewPassword("");
        setConfirmPassword("");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(response.error || "Failed to reset password. Please try again.");
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
            Reset Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your new password below.
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
          <Label>New Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeIcon className="size-5" />
              ) : (
                <EyeCloseIcon className="size-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label>Confirm Password</Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeIcon className="size-5" />
              ) : (
                <EyeCloseIcon className="size-5" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-3">
          <Button className="w-full" size="sm" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
      </div>
    </form>
  );
}

