import React from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-blue-600">
            Bike Rental
          </h1>

          <h2 className="mt-4 text-2xl font-semibold">
            {title}
          </h2>

          <p className="text-gray-500 mt-2">
            {subtitle}
          </p>

        </div>

        {children}

      </div>
    </div>
  );
};

export default AuthLayout;