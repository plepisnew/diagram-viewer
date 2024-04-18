import React from "react";
import { RootControl } from "./index/RootControl";
import { Toaster } from "react-hot-toast";
import { cn } from "./utils/cn";

export const App: React.FC = () => {
  return (
    <React.Fragment>
      <RootControl />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            cursor: "pointer",
          },
          duration: 8000,
          className: cn("border border-zinc-400 bg-zinc-100 shadow-md rounded-md"),
        }}
      />
    </React.Fragment>
  );
};
