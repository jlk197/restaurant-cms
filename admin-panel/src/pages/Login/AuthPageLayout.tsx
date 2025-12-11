import React from "react";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center items-center px-4 py-12">
      {/* Header with branding */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-10">
        Restaurant Admin Panel
      </h1>

      {/* Login form */}
      <div className="w-3/4 max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        {children}
      </div>

      {/* Theme toggler */}
      <div className="fixed z-50 bottom-6 right-6">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
