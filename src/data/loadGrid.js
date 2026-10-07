export async function loadGrid(signal) {
  const response = await fetch("/data/grid.geojson", { signal });

  if (!response.ok) {
    throw new Error(`Failed to load grid data: ${response.status}`);
  }

  const geojson = await response.json();

  return geojson;
}

export async function loadUnderlyingGrid(signal) {
  const response = await fetch("/data/underlying-grid.geojson", { signal });

  if (!response.ok) {
    throw new Error(`Failed to load underlying grid: ${response.status}`);
  }

  const geojson = await response.json();

  return geojson;
}
