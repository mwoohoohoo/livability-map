// src/data/transformGrid.js

const SCORE_FIELDS = [
  "nature_score",
  "climate_score",
  "air_quality_score",
  "pop_score",
  "international_score",
  "combined_climbing_score",
  "final_score",
];

export function transformGrid(geojson) {
  return geojson.features.map((feature, index) => {
    const properties = feature.properties;

    const scores = Object.fromEntries(
      SCORE_FIELDS.map((field) => [field, Number(properties[field])]),
    );

    return {
      id: index,
      geometry: feature.geometry,
      properties: {
        ...properties,
        ...scores,
      },
    };
  });
}
