"use client";

interface IProps {
  children: React.ReactNode;
  className?: string;
}

export function RscWrapper({ children, className }: IProps) {
  return <div className={className}>{children}</div>;
}
