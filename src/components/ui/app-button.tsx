import { ReactNode } from "react";

export default function AppButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href?: string;
  children: ReactNode;
  variant?: string;
  className?: string;
}) {
  const baseClasses = "rounded-md font-medium transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    outline: "border border-gray-600 text-gray-600 hover:bg-gray-600",
  };

  return (
    <a
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </a>
  );
}