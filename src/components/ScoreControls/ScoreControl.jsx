import Slider from "@mui/material/Slider";
import { IMPORTANCE_OPTIONS } from "../../data/scoreModel";

export default function ScoreControl({
  variable,
  importance,
  removed,
  dealbreaker,
  onImportanceChange,
  onRemove,
  onDealbreakerChange,
}) {
  const isDealbreaker = dealbreaker === variable.id;

  const dealbreakerDisabled = dealbreaker !== null && !isDealbreaker;

  const importanceLabel =
    IMPORTANCE_OPTIONS.find((option) => option.value === importance)?.label ??
    "Average";

  const hintId = `${variable.id}-importance-hint`;

  return (
    <div className="border-b border-[var(--border)] py-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-h)]">
          {variable.label}
        </h3>

        {removed && <span className="text-xs text-[var(--text)]">Removed</span>}
      </div>

      <div className={removed ? "opacity-40" : ""}>
        <div className="mb-4 flex items-center justify-between text-xs">
          <label
            htmlFor={`${variable.id}-slider`}
            className="text-[var(--text)]"
          >
            Importance
          </label>

          <span className="font-medium text-[var(--text-h)]">
            {importanceLabel}
          </span>
        </div>

        <Slider
          id={`${variable.id}-slider`}
          aria-label={`${variable.label} importance`}
          aria-describedby={hintId}
          aria-valuetext={importanceLabel}
          value={importance}
          min={1}
          max={5}
          step={1}
          marks={IMPORTANCE_OPTIONS.map(({ value }) => ({
            value,
          }))}
          disabled={removed}
          valueLabelDisplay="off"
          onChange={(_, value) => {
            onImportanceChange(variable.id, value);
          }}
          sx={{
            color: "var(--text-h)",
            padding: "10px 0",
            "& .MuiSlider-thumb": {
              width: 16,
              height: 16,
              backgroundColor: "#fff",
              border: "2px solid currentColor",
              "&:hover, &.Mui-focusVisible": {
                boxShadow: "0 0 0 6px rgba(0,0,0,0.10)",
              },
            },
            "& .MuiSlider-track": {
              border: "none",
            },
            "& .MuiSlider-rail": {
              opacity: 0.3,
            },
            "& .MuiSlider-mark": {
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: "currentColor",
            },
            "& .MuiSlider-markActive": {
              backgroundColor: "#fff",
            },
          }}
        />

        <span id={hintId} className="sr-only">
          Use the arrow keys to change importance from very low to very high.
        </span>

        <div className="mt-1 grid grid-cols-5 text-center text-[10px] text-[var(--text)]">
          {IMPORTANCE_OPTIONS.map((option) => (
            <span key={option.value}>{option.label}</span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-xs">
        <label
          className={`
            flex cursor-pointer items-center gap-2
            ${dealbreakerDisabled || removed ? "opacity-40" : ""}
          `}
        >
          <input
            type="checkbox"
            checked={isDealbreaker}
            disabled={dealbreakerDisabled || removed}
            onChange={(event) =>
              onDealbreakerChange(variable.id, event.target.checked)
            }
            className="accent-[var(--text-h)]"
          />
          Dealbreaker
        </label>

        <button
          type="button"
          onClick={() => onRemove(variable.id)}
          aria-label={`${removed ? "Restore" : "Remove"} ${variable.label}`}
          className="
            rounded-sm underline underline-offset-2
            focus-visible:outline-2 focus-visible:outline-offset-4
            focus-visible:outline-[var(--text-h)]
          "
        >
          {removed ? "Restore" : "Remove"}
        </button>
      </div>
    </div>
  );
}
