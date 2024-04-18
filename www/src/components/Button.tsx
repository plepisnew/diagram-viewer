import { cn } from "@/utils/cn";
import React, { ComponentProps } from "react";

export type ButtonProps = ComponentProps<"button">;

export const Button: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <button
      className={cn(
        "px-5 py-2",
        "border border-zinc-500 rounded-md shadow-md bg-zinc-100 hover:bg-zinc-50 active:shadow-none transition-colors",
        "disabled:cursor-not-allowed disabled:hover:bg-zinc-100 disabled:shadow-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};
