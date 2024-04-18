import { cn } from "@/utils/cn";
import React, { ComponentProps } from "react";

export type InputAreaProps = ComponentProps<"textarea">;

export const InputArea: React.FC<InputAreaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        "p-3",
        "border border-zinc-500 rounded-md shadow-md bg-zinc-100 hover:bg-zinc-50 active:shadow-none transition-colors",
        className
      )}
      {...props}
    />
  );
};
