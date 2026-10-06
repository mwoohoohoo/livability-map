const IMPORTANCE_OPTIONS = [
  { value: 1, label: "Very low" },
  { value: 2, label: "Low" },
  { value: 3, label: "Average" },
  { value: 4, label: "High" },
  { value: 5, label: "Very high" },
];

export default function ScoreControl({
  variable,
  importance,
  removed,
  dealbreaker,
  dealbreakerVariable,
  onImportanceChange,
  onRemove,
  onDealbreakerChange,
}) {
  const isRemoved = removed;
  const isDealbreaker = dealbreaker === variable.id;

  const dealbreakerDisabled =
    dealbreakerVariable !== null && dealbreakerVariable !== variable.id;

  return (
    <div className="border-b border-[var(--border)] py-5">
      {/* Variable name */}

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{variable.label}</h3>

        {isRemoved && (
          <span className="text-xs text-[var(--text)]">Removed</span>
        )}
      </div>

      {/* Importance */}

      <div className={isRemoved ? "opacity-40" : ""}>
        <div className="mb-2 flex justify-between text-xs">
          <span>Importance</span>

          <span className="font-medium">
            {
              IMPORTANCE_OPTIONS.find((option) => option.value === importance)
                ?.label
            }
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {IMPORTANCE_OPTIONS.map((option) => {
            const isSelected = importance === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={isRemoved}
                onClick={() => onImportanceChange(variable.id, option.value)}
                className={`
                  h-2 rounded-full transition
                  ${isSelected ? "bg-[var(--text-h)]" : "bg-[var(--border)]"}
                  ${!isRemoved ? "hover:bg-[var(--text)]" : ""}
                `}
                aria-label={`${variable.label}: ${option.label}`}
                aria-pressed={isSelected}
              />
            );
          })}
        </div>

        <div className="mt-2 grid grid-cols-5 text-[10px] text-[var(--text)]">
          {IMPORTANCE_OPTIONS.map((option) => (
            <span key={option.value} className="text-center">
              {option.label}
            </span>
          ))}
        </div>
      </div>

      {/* Dealbreaker / Remove */}

      <div className="mt-4 flex items-center justify-between text-xs">
        <label
          className={`
            flex items-center gap-2
            ${dealbreakerDisabled || isRemoved ? "opacity-40" : ""}
          `}
        >
          <input
            type="checkbox"
            checked={isDealbreaker}
            disabled={dealbreakerDisabled || isRemoved}
            onChange={(event) =>
              onDealbreakerChange(variable.id, event.target.checked)
            }
          />
          Dealbreaker
        </label>

        <button
          type="button"
          onClick={() => onRemove(variable.id)}
          className="underline underline-offset-2"
        >
          {isRemoved ? "Restore" : "Remove"}
        </button>
      </div>
    </div>
  );
}
