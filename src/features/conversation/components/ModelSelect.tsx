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
import { useModelsQuery } from "@/features/conversation/useModelsQuery";
import { KNOWN_MODEL_DESCRIPTIONS, KNOWN_MODEL_LABELS } from "@/lib/constants";

type ModelSelectProps = {
  value: string;
  onValueChange: (model: string) => void;
  disabled?: boolean;
};

export function ModelSelect({
  value,
  onValueChange,
  disabled = false,
}: ModelSelectProps) {
  const { data: subscription, isLoading: isLoadingSubscription } =
    useSubscriptionQuery();
  const { data: models, isLoading: isLoadingModels } = useModelsQuery();

  const canChooseModel =
    subscription?.plan === "PRO" || subscription?.plan === "ENTERPRISE";

  /*
   * Backend behavior:
   * For FREE users, explicit model overrides are silently ignored and
   * replaced by the backend default. Therefore, the selector is hidden
   * entirely unless the subscription plan is PRO or ENTERPRISE.
   */
  if (isLoadingSubscription || isLoadingModels || !canChooseModel) {
    return null;
  }

  // GET /models failed or returned nothing usable - fail closed rather than
  // showing an empty/broken picker; "auto" (the backend's own default) still
  // applies with no selector shown at all.
  if (!models || models.length === 0) {
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

          {models.map(({ id: modelId }) => (
            <SelectItem key={modelId} value={modelId}>
              <div className="flex flex-col gap-0.5 py-0.5">
                <span className="text-sm">
                  {KNOWN_MODEL_LABELS[modelId] ?? modelId}
                </span>

                {KNOWN_MODEL_DESCRIPTIONS[modelId] && (
                  <span className="text-xs text-muted-foreground">
                    {KNOWN_MODEL_DESCRIPTIONS[modelId]}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
