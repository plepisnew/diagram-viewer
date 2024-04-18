import React, { ChangeEventHandler, useRef, useState } from "react";
import { cn } from "./utils/cn";
import { Box } from "./components/Box";
import { Button } from "./components/Button";
import { InputArea } from "./components/InputArea";
import axios from "axios";

type AppContext = {
  diagramUrl: string;
};

export const App: React.FC = () => {
  const [context, setContext] = useState<AppContext | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");

  const requestModel = async () => {
    const payload = { diagramType: "graph", data: value };

    const response = await axios.post("http://localhost:5000/model/sync", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data as string;
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleChangeInput: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValue(e.currentTarget.value);
  };

  const handleClickClearContext = () => {
    setContext(null);
    setValue("");
  };

  const handleClickModel = async () => {
    try {
      setIsLoading(true);
      const url = await requestModel();
      setContext({ diagramUrl: url });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickModelMermaid = async () => {
    const response = await axios.post("http://localhost:5000/model/direct", value, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data) {
      setContext({ diagramUrl: response.data });
    }
  };

  // useEffect(() => {
  //   const _exec = async () => {
  //     const canvas = canvasRef.current;
  //     const ctx = canvas?.getContext("2d");

  //     if (!context || !canvas || !ctx) {
  //       return;
  //     }

  //     const { data: svg } = await axios.get(context.diagramUrl);

  //     const v = await Canvg.from(ctx, svg);
  //     v.start();
  //     const image = canvas.toDataURL("image/png");
  //     console.log(image);
  //   };

  //   _exec();
  // }, [context]);

  return (
    <div className={cn("mx-auto container flex flex-col gap-4 justify-center items-center h-full")}>
      <Box className={cn("p-4 w-[800px]", "flex flex-col gap-4")}>
        <InputArea value={value} onChange={handleChangeInput} rows={10} />
        <div className={cn("flex [&>button]:flex-1 gap-4")}>
          <Button onClick={handleClickClearContext} disabled={!context}>
            Clear
          </Button>
          <Button onClick={handleClickModelMermaid}>Model (mermaid)</Button>
          <Button onClick={handleClickModel} disabled={isLoading}>
            Model
          </Button>
        </div>
      </Box>
      <Box
        className={cn("p-4 w-[800px] transition-all overflow-hidden", context ? "max-h-[300px]" : "max-h-0 opacity-0")}
      >
        <a target="_blank" href={context?.diagramUrl}>
          View diagram here
        </a>
        <canvas className={cn("border border-zinc-500 rounded-md bg-white p-2")} ref={canvasRef} />
      </Box>
    </div>
  );
};
