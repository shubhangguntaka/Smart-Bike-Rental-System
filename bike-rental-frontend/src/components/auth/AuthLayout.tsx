import React from "react";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<Props> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-blue-600">
            Bike Rental
          </h1>

          <h2 className="mt-4 text-2xl font-semibold">
            {title}
          </h2>

          <p className="mt-2 text-gray-500">
            {subtitle}
          </p>

        </div>

        {children}

      </div>

    </div>
  );
};

export default AuthLayout;