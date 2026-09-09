/**
 * features/conversation/components/FollowUpChips.tsx
 * 0-4 AI-suggested next questions; clicking submits as the next turn.
 */
interface FollowUpChipsProps {
  followUps: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function FollowUpChips({ followUps, onSelect, disabled }: FollowUpChipsProps) {
  if (followUps.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {followUps.map((question) => (
        <button
          key={question}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(question)}
          className="rounded-full border px-3 py-1 text-xs hover:bg-accent disabled:opacity-50"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
