/**
 * features/conversation/components/ModelSelect.tsx
 *
 * Per 02-api-reference.md "POST /threads": a non-"auto" model override is
 * silently ignored (falls back to default) for FREE-tier callers - NO error
 * is returned. Per 03-pages-and-features.md: do not rely on that
 * silent-ignore behavior to hide the control - check the user's
 * subscription plan client-side and only render non-"auto" options if the
 * plan is PRO/ENTERPRISE.
 *
 * Also per 02-api-reference.md "Models": no GET /models endpoint exists yet -
 * MODEL_IDS is hardcoded, temporary, backend-configuration knowledge. Flag
 * to backend if this drifts.
 */
import { MODEL_IDS, type ModelId } from "../../../../lib/constants";
import { useSubscriptionQuery } from "../../billing/useSubscriptionQuery";

interface ModelSelectProps {
  value: ModelId | string;
  onChange: (model: string) => void;
  disabled?: boolean;
}

export function ModelSelect({ value, onChange, disabled }: ModelSelectProps) {
  const { data: subscription } = useSubscriptionQuery();
  const canOverrideModel =
    subscription?.plan === "PRO" || subscription?.plan === "ENTERPRISE";

  if (!canOverrideModel) {
    // Non-Pro users never see the control at all - "auto" is implicit.
    return null;
  }

  return (
    <select
      className="rounded-md border bg-background px-2 py-1 text-xs"
      value={value}
      disabled={disabled}
      aria-label="Model"
      onChange={(e) => onChange(e.target.value)}
    >
      {MODEL_IDS.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>
  );
}
