import { Bot } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useSubscriptionQuery } from "@/features/billing/useSubscriptionQuery";
import { MODEL_IDS, type ModelId } from "@/lib/constants";

type ModelSelectProps = {
  value: string;
  onValueChange: (model: string) => void;
  disabled?: boolean;
};

const MODEL_LABELS: Record<ModelId, string> = {
  auto: "Auto",
  "groq-llama-3.3-70b": "Llama 3.3 70B",
  "gemini-flash-latest": "Gemini Flash",
};

const MODEL_DESCRIPTIONS: Record<ModelId, string> = {
  auto: "Automatically uses the default model.",
  "groq-llama-3.3-70b":
    "A capable general-purpose model for reasoning and writing.",
  "gemini-flash-latest":
    "A fast model for everyday questions and quick responses.",
};

export function ModelSelect({
  value,
  onValueChange,
  disabled = false,
}: ModelSelectProps) {
  const { data: subscription, isLoading } = useSubscriptionQuery();

  const canChooseModel =
    subscription?.plan === "PRO" || subscription?.plan === "ENTERPRISE";

  /*
   * Backend behavior:
   * For FREE users, explicit model overrides are silently ignored and
   * replaced by the backend default. Therefore, the selector is hidden
   * entirely unless the subscription plan is PRO or ENTERPRISE.
   */
  if (isLoading || !canChooseModel) {
    return null;
  }

  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue);
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <SelectTrigger
              className="h-8 min-w-32 border-0 bg-muted/40 text-xs hover:bg-muted"
              aria-label="Choose AI model"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <Bot className="size-3.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Select model" />
              </span>
            </SelectTrigger>
          }
        />

        <TooltipContent side="top">Choose an AI model</TooltipContent>
      </Tooltip>

      <SelectContent align="start" className="min-w-64">
        <SelectGroup>
          <SelectLabel>Available models</SelectLabel>

          {MODEL_IDS.map((modelId) => (
            <SelectItem key={modelId} value={modelId}>
              <div className="flex flex-col gap-0.5 py-0.5">
                <span className="text-sm">{MODEL_LABELS[modelId]}</span>

                <span className="text-xs text-muted-foreground">
                  {MODEL_DESCRIPTIONS[modelId]}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
