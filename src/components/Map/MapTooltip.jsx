import { useLayoutEffect, useRef, useState } from "react";

export default function MapTooltip({
  cell,
  position,
  mapWidth,
  mapHeight,
  finalScore,
}) {
  const tooltipRef = useRef(null);

  const [tooltipSize, setTooltipSize] = useState({
    width: 0,
    height: 0,
  });

  // Measure the tooltip after it renders
  useLayoutEffect(() => {
    if (!tooltipRef.current) {
      return;
    }

    const element = tooltipRef.current;

    function updateSize() {
      const rect = element.getBoundingClientRect();

      setTooltipSize({
        width: rect.width,
        height: rect.height,
      });
    }

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [cell]);

  // All hooks must run before this conditional return
  if (!cell || !position) {
    return null;
  }

  const {
    nature_score,
    climate_score,
    air_quality_score,
    pop_score,
    international_score,
    combined_climbing_score,
    primary_country,
    primary_pct,
    secondary_country,
    secondary_pct,
    tertiary_country,
    tertiary_pct,
  } = cell.properties;

  function formatScore(value) {
    if (value == null || Number.isNaN(value)) {
      return "—";
    }

    return Number(value).toFixed(2);
  }

  function formatPercentage(value) {
    if (value == null || Number.isNaN(value)) {
      return "—";
    }

    return (Number(value) * 100).toFixed(0);
  }

  // --------------------------------------------------
  // Tooltip positioning
  // --------------------------------------------------

  const gap = 16;

  // Start by placing the tooltip
  // to the right and below the cursor.
  let left = position.x + gap;
  let top = position.y + gap;

  // If the tooltip would extend beyond
  // the right edge of the map, move it left.
  if (left + tooltipSize.width > mapWidth) {
    left = position.x - tooltipSize.width - gap;
  }

  // If the tooltip would extend beyond
  // the bottom edge of the map, move it above.
  if (top + tooltipSize.height > mapHeight) {
    top = position.y - tooltipSize.height - gap;
  }

  // Final safety checks so the tooltip
  // never extends beyond the left or top edge.
  left = Math.max(0, left);
  top = Math.max(0, top);

  return (
    <div
      ref={tooltipRef}
      className="
        pointer-events-none
        absolute
        z-20
        w-64
        rounded-lg
        bg-white
        p-4
        shadow-lg
      "
      style={{
        left,
        top,
      }}
    >
      {/* Scores */}

      <div className="mb-4">
        <h3 className="mb-2 text-sm font-semibold">Scores</h3>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Nature</span>
            <span>{formatScore(nature_score)}</span>
          </div>

          <div className="flex justify-between">
            <span>Climate</span>
            <span>{formatScore(climate_score)}</span>
          </div>

          <div className="flex justify-between">
            <span>Air quality</span>
            <span>{formatScore(air_quality_score)}</span>
          </div>

          <div className="flex justify-between">
            <span>Population</span>
            <span>{formatScore(pop_score)}</span>
          </div>

          <div className="flex justify-between">
            <span>International</span>
            <span>{formatScore(international_score)}</span>
          </div>

          <div className="flex justify-between">
            <span>Climbing</span>
            <span>{formatScore(combined_climbing_score)}</span>
          </div>
        </div>
      </div>

      {/* Countries */}

      <div className="mb-4">
        <h3 className="mb-2 text-sm font-semibold">Countries</h3>

        <div className="space-y-1 text-sm">
          {primary_country && (
            <div className="flex justify-between">
              <span>{primary_country}</span>
              <span>{formatPercentage(primary_pct)}%</span>
            </div>
          )}

          {secondary_country && (
            <div className="flex justify-between">
              <span>{secondary_country}</span>
              <span>{formatPercentage(secondary_pct)}%</span>
            </div>
          )}

          {tertiary_country && (
            <div className="flex justify-between">
              <span>{tertiary_country}</span>
              <span>{formatPercentage(tertiary_pct)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Final score */}

      <div className="border-t pt-3">
        <div className="flex justify-between">
          <span className="text-sm font-semibold">Final score</span>

          <span className="text-sm font-semibold">
            {formatPercentage(finalScore)}
          </span>
        </div>
      </div>
    </div>
  );
}
