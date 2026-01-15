import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import administratorService from "../../services/administratorService";

interface SignInFormProps {
  onLoginSuccess: (token: string) => void;
  onForgotPassword?: () => void;
}

export default function SignInForm({ onLoginSuccess, onForgotPassword }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await administratorService.login(email, password);

      if (response.success && response.token) {
        onLoginSuccess(response.token);
      } else {
        setError("Wrong credentials");
      }
    } catch (err) {
      console.log(err);
      setError("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-5">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            {error}
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
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Password</Label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
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
        <div className="pt-3">
          <Button className="w-full" size="sm" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </div>
    </form>
  );
}
