export const VARIABLES = [
  {
    id: "nature",
    label: "Nature",
    field: "nature_score",
  },
  {
    id: "climate",
    label: "Climate",
    field: "climate_score",
  },
  {
    id: "air_quality",
    label: "Air quality",
    field: "air_quality_score",
  },
  {
    id: "population",
    label: "Population",
    field: "pop_score",
  },
  {
    id: "international",
    label: "International",
    field: "international_score",
  },
  {
    id: "climbing",
    label: "Climbing",
    field: "combined_climbing_score",
  },
];

export const IMPORTANCE_OPTIONS = [
  { value: 1, label: "Very low" },
  { value: 2, label: "Low" },
  { value: 3, label: "Average" },
  { value: 4, label: "High" },
  { value: 5, label: "Very high" },
];

export function createDefaultSettings() {
  return {
    nature: 3,
    climate: 3,
    air_quality: 3,
    population: 3,
    international: 3,
    climbing: 3,

    removed: [],

    dealbreaker: null,
  };
}

/**
 * Convert importance values into normalised weights.
 *
 * Example:
 * all Average = 3 / 18 = 16.7% each
 */
export function calculateWeights(settings) {
  const activeVariables = VARIABLES.filter(
    (variable) => !settings.removed.includes(variable.id),
  );

  const totalImportance = activeVariables.reduce(
    (sum, variable) => sum + settings[variable.id],
    0,
  );

  if (totalImportance === 0) {
    return Object.fromEntries(VARIABLES.map((variable) => [variable.id, 0]));
  }

  return Object.fromEntries(
    VARIABLES.map((variable) => {
      if (settings.removed.includes(variable.id)) {
        return [variable.id, 0];
      }

      return [variable.id, settings[variable.id] / totalImportance];
    }),
  );
}

/**
 * Calculate the final score for one grid cell.
 *
 * Scores are assumed to already be normalised between 0 and 1.
 */
export function calculateFinalScore(cell, weights, dealbreaker = null) {
  if (!cell) return 0;

  const properties = cell.properties;

  // Dealbreaker takes priority.
  if (dealbreaker) {
    const dealbreakerVariable = VARIABLES.find(
      (variable) => variable.id === dealbreaker,
    );

    if (dealbreakerVariable) {
      const value = Number(properties[dealbreakerVariable.field]);

      if (!Number.isFinite(value) || value <= 0) {
        return 0;
      }
    }
  }

  let score = 0;

  VARIABLES.forEach((variable) => {
    const weight = weights[variable.id];

    if (weight === 0) return;

    const value = Number(properties[variable.field]);

    if (!Number.isFinite(value)) return;

    score += value * weight;
  });

  return score;
}
