import { cn } from "@/utils/cn";
import { ComponentProps, forwardRef } from "react";

export type InputAreaProps = ComponentProps<"textarea">;

export const InputArea = forwardRef<HTMLTextAreaElement, InputAreaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn("resize-none border border-zinc-500 rounded-md shadow-md p-2 bg-zinc-50 outline-none", className)}
      {...props}
    />
  );
});
