"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_MODELS } from "@/data/models";
import { useAppStore } from "@/store/prompt-store";
import { Bot, Image, Code } from "lucide-react";

const CATEGORY_ICONS = {
  text: Bot,
  image: Image,
  code: Code,
};

const CATEGORY_LABELS = {
  text: "Text & LLM Models",
  image: "Image Generation",
  code: "Code Generation",
};

const categories = ["text", "code", "image"] as const;

export function ModelSelector() {
  const { selectedModelId, setSelectedModelId } = useAppStore();
  const selectedModel = AI_MODELS.find((m) => m.id === selectedModelId);

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedModelId} onValueChange={setSelectedModelId}>
        <SelectTrigger className="w-[220px] h-8 text-xs">
          <SelectValue>
            {selectedModel && (
              <span className="flex items-center gap-1.5">
                {(() => {
                  const Icon = CATEGORY_ICONS[selectedModel.category];
                  return <Icon className="h-3.5 w-3.5 text-muted-foreground" />;
                })()}
                <span>{selectedModel.name}</span>
                <span className="text-muted-foreground">
                  · {selectedModel.provider}
                </span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => {
            const models = AI_MODELS.filter((m) => m.category === category);
            if (models.length === 0) return null;
            const Icon = CATEGORY_ICONS[category];
            return (
              <SelectGroup key={category}>
                <SelectLabel className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3.5 w-3.5" />
                  {CATEGORY_LABELS[category]}
                </SelectLabel>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
