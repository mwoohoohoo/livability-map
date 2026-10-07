// src/components/Map/mapUtils.js

import * as d3 from "d3";
import { calculateFinalScore } from "../../data/scoreModel";

/**
 * Create a planar transform for the EPSG:3035 coordinates.
 *
 * The GeoJSON is already in EPSG:3035, so we don't need
 * a geographic projection such as Mercator.
 */
export function createProjection(
  grid,
  width,
  height,
  { availableLeft = 0, availableRight = width, fitToHeight = false } = {},
) {
  const featureCollection = {
    type: "FeatureCollection",
    features: grid.map((cell) => ({
      type: "Feature",
      geometry: cell.geometry,
      properties: cell.properties,
    })),
  };

  const projection = d3.geoIdentity().reflectY(true);

  if (!fitToHeight) {
    return projection.fitExtent(
      [
        [availableLeft + 40, 40],
        [availableRight - 40, height - 40],
      ],
      featureCollection,
    );
  }

  // First fit to the full available height.
  const heightProjection = projection.fitExtent(
    [
      [0, 40],
      [width, height - 40],
    ],
    featureCollection,
  );

  // Then shift the projection horizontally so that the scored
  // area is centred in the space available beside the sidebar.
  const bounds = d3.geoPath(heightProjection).bounds(featureCollection);

  const mapCenterX = (bounds[0][0] + bounds[1][0]) / 2;
  const availableCenterX = (availableLeft + availableRight) / 2;

  heightProjection.translate([
    heightProjection.translate()[0] + availableCenterX - mapCenterX,
    heightProjection.translate()[1],
  ]);

  return heightProjection;
}

/**
 * Draw the underlying base map.
 *
 * The base-map GeoJSON has already been filtered and
 * dissolved in Python, so we can draw it directly.
 */
export function drawUnderlyingGrid(context, projection, geojson) {
  const path = d3.geoPath(projection, context);

  context.save();

  context.beginPath();

  path(geojson);

  context.fillStyle = "#f2f2f2";

  context.fill();

  context.restore();
}

/**
 * Draw the scored grid.
 */
export function drawGrid(context, projection, grid, weights, dealbreaker) {
  const path = d3.geoPath(projection, context);

  const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 1]);

  context.save();

  grid.forEach((cell) => {
    const feature = {
      type: "Feature",
      geometry: cell.geometry,
      properties: cell.properties,
    };

    context.beginPath();

    path(feature);

    const score = calculateFinalScore(cell, weights, dealbreaker);

    context.fillStyle = colorScale(score);

    context.fill();

    context.strokeStyle = "rgba(255, 255, 255, 0.35)";

    context.lineWidth = 0.25;

    context.stroke();
  });

  context.restore();
}

/**
 * Convert a Polygon geometry into screen coordinates.
 */
function projectPolygon(coordinates, projection) {
  return coordinates.map(([x, y]) => projection([x, y]));
}

/**
 * Get all polygon rings from a cell geometry
 * in screen coordinates.
 *
 * This handles both Polygon and MultiPolygon.
 */
function getProjectedPolygons(geometry, projection) {
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => projectPolygon(ring, projection));
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flatMap((polygon) =>
      polygon.map((ring) => projectPolygon(ring, projection)),
    );
  }

  return [];
}

/**
 * Calculate a representative screen position
 * for a cell.
 *
 * We use this as the point stored in the quadtree.
 */
function getCellCenter(geometry, projection) {
  const coordinates =
    geometry.type === "Polygon"
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0];

  const projected = projectPolygon(coordinates, projection);

  const centroid = d3.polygonCentroid(projected);

  return centroid;
}

/**
 * Build a spatial index of the scored cells.
 *
 * The quadtree lets us quickly find cells near
 * the mouse instead of checking all 11,466 cells
 * on every mouse movement.
 */
export function createCellIndex(grid, projection) {
  const points = grid.map((cell) => {
    const [x, y] = getCellCenter(cell.geometry, projection);

    return {
      x,
      y,
      cell,
    };
  });

  const quadtree = d3
    .quadtree()
    .x((d) => d.x)
    .y((d) => d.y)
    .addAll(points);

  return {
    points,
    quadtree,
  };
}

/**
 * Find the grid cell underneath a screen coordinate.
 *
 * First find nearby cells using the quadtree.
 * Then use an exact polygon containment test.
 */
export function findCellAtPoint(x, y, cellIndex, projection) {
  if (!cellIndex) return null;

  const searchRadius = 100;

  let nearest = null;
  let nearestDistance = Infinity;

  cellIndex.quadtree.visit((node, x0, y0, x1, y1) => {
    // Skip this branch if its bounding box is too far away
    if (
      x0 > x + searchRadius ||
      x1 < x - searchRadius ||
      y0 > y + searchRadius ||
      y1 < y - searchRadius
    ) {
      return true;
    }

    if (!node.length) {
      let current = node;

      while (current) {
        const dx = current.data.x - x;
        const dy = current.data.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = current.data;
        }

        current = current.next;
      }
    }

    return false;
  });

  if (!nearest) {
    return null;
  }

  const polygons = getProjectedPolygons(nearest.cell.geometry, projection);

  for (const polygon of polygons) {
    if (d3.polygonContains(polygon, [x, y])) {
      return nearest.cell;
    }
  }

  return null;
}
