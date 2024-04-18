import { cn } from "@/utils/cn";
import React, { ComponentProps } from "react";

export type BoxProps = ComponentProps<"div">;

export const Box: React.FC<BoxProps> = ({ className, ...props }) => {
  return <div className={cn("p-2", "border border-zinc-500 rounded-md shadow-md bg-zinc-50", className)} {...props} />;
};
