import { Box } from "@/components/Box";
import { Button } from "@/components/Button";
import { InputArea } from "@/components/InputArea";
import { cn } from "@/utils/cn";
import React, { ChangeEventHandler, MouseEventHandler, useState } from "react";
import toast from "react-hot-toast";
import { RootContext } from "./RootContext";
import { RequirementEnumerator } from "./RequirementEnumerator";

type AppContext = {
  diagramUrl?: string;
  model: string;
};

export const RootControl: React.FC = () => {
  const [context, setContext] = useState<AppContext | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleClickClearInput: MouseEventHandler<HTMLButtonElement> = () => {
    setContext(null);
    setUserInput("");
  };

  const handleClickClearPrompt: MouseEventHandler<HTMLButtonElement> = () => {
    setPrompt("");
  };

  const handleClickModel: MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      setIsLoading(true);
      const loadingToastId = RootContext.procedures.triggerToast(toast.loading, "Modeling requirements...", {
        duration: Math.pow(10, 5),
      });

      RootContext.modules.apiClient.requestModel(
        { data: userInput, systemMessage: prompt },
        ({ diagramUrl, model }) => {
          toast.dismiss(loadingToastId);
          console.log({ diagramUrl, model });
          if (diagramUrl) {
            RootContext.procedures.triggerToast(toast.success, "Requirements successfully modeled");
          } else {
            RootContext.procedures.triggerToast(toast.error, "A model was generated, but it could not be rendered");
          }
          setContext({ diagramUrl, model });
          setIsLoading(false);
        },
        () => {
          toast.dismiss(loadingToastId);
          RootContext.procedures.triggerToast(toast.error, "Unable to resolve requirements");
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const handleClickPrefillInput: MouseEventHandler<HTMLButtonElement> = async () => {
    RootContext.procedures.triggerToast(toast.success, "Imported 12 Software Requirements for Spotify's music player");
    setUserInput(RootContext.constants.prefilledInput);
  };

  const handleClickPrefillPrompt: MouseEventHandler<HTMLButtonElement> = async () => {
    setPrompt(RootContext.constants.prefilledPrompt);
  };

  const handleChangePrompt: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setPrompt(e.currentTarget.value);
  };

  return (
    <div className={cn("mx-auto container flex justify-center items-center h-full")}>
      <div className={cn("flex gap-4 w-[1200px] max-h-full")}>
        <div className={cn("flex flex-col gap-4 flex-grow")}>
          <Box className={cn("p-4 h-full", "flex flex-col gap-4")}>
            <RequirementEnumerator value={userInput} setValue={setUserInput} />
            <div className={cn("flex [&>button]:flex-1 gap-4")}>
              <Button onClick={handleClickClearInput} disabled={isLoading || (!context && !userInput)}>
                Clear
              </Button>
              <Button onClick={handleClickPrefillInput} disabled={userInput.length !== 0}>
                Prefill
              </Button>
              <Button onClick={handleClickModel} disabled={isLoading || !userInput}>
                Model
              </Button>
            </div>
          </Box>
          {context && (
            <Box className={cn("p-4 transition-all flex-grow")}>
              {context.diagramUrl && (
                <a
                  className={cn(
                    "border border-zinc-500 bg-zinc-100 rounded-md px-4 py-2 inline-block hover:bg-black hover:text-white transition-colors"
                  )}
                  target="_blank"
                  href={context.diagramUrl}
                >
                  Open diagram
                </a>
              )}
              <Button>
                Inspect <span className="font-mono mx-1.5">mermaid</span> model
              </Button>
              <div className="max-h-[100px] overflow-y-scroll">{JSON.stringify(context.model)}</div>
            </Box>
          )}
        </div>
        <div className={cn("relative flex basis-[500px] shrink-0")}>
          <InputArea
            rows={12}
            className={cn("w-full p-4 pb-20 font-mono leading-5 ")}
            value={prompt}
            onChange={handleChangePrompt}
            placeholder="If this field is set, its value will be used as the `system_message` parameter for the Chat Completion API request"
          />
          <div
            className={cn(
              "absolute left-0 bottom-0 right-0 border-t border-t-black",
              "p-4 gap-4 flex [&>button]:flex-1",
              "bg-zinc-50 border border-t-0 border-zinc-500 rounded-b-md shadow-md"
            )}
          >
            <Button disabled={isLoading || prompt.length === 0} onClick={handleClickClearPrompt}>
              Reset
            </Button>
            <Button disabled={isLoading || prompt.length !== 0} onClick={handleClickPrefillPrompt}>
              Prefill default
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
