import { InputArea } from "@/components/InputArea";
import { cn } from "@/utils/cn";
import React, { ChangeEventHandler, Dispatch, SetStateAction, useRef } from "react";

export type RequirementEnumeratorProps = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
};

export const RequirementEnumerator: React.FC<RequirementEnumeratorProps> = ({ value, setValue }) => {
  const inputRef = useRef<HTMLDivElement>(null);

  const entries = value.length === 0 ? [] : value.split("\n");

  const handleChangeVirtualInput: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValue(e.currentTarget.value);
  };

  const handleRemoveEntry = (index: number) => {
    setValue(
      value
        .split("\n")
        .filter((_value, _index) => index !== _index)
        .join("\n")
    );
  };

  return (
    <div className={cn("flex flex-col gap-4 h-full")}>
      {entries.length !== 0 && (
        <div
          ref={inputRef}
          className={cn(
            "flex flex-col max-h-[400px] overflow-y-scroll",
            "border border-zinc-500 rounded-md bg-zinc-100 hover:bg-zinc-50 transition-colors shadow-md"
          )}
        >
          {entries.map((entry, entryIndex) => (
            <div
              key={entry}
              onClick={() => handleRemoveEntry(entryIndex)}
              className={cn(
                "cursor-pointer hover:bg-red-800/15",
                "p-2 flex gap-2.5",
                entryIndex !== entries.length - 1 && "border-b border-b-zinc-500",
                entryIndex % 2 === 0 ? "bg-zinc-300/50" : "bg-zinc-300/20"
              )}
            >
              <span className={cn("px-2 py-1 self-center", "bg-black text-white rounded-md text-sm font-semibold")}>
                SR{entryIndex + 1}
              </span>
              {entry}
            </div>
          ))}
        </div>
      )}
      <InputArea
        value={value}
        onChange={handleChangeVirtualInput}
        className={cn("flex-grow")}
        rows={5}
        placeholder="Enter Software Requirements; each entry should be in its own line"
      />
    </div>
  );
};
