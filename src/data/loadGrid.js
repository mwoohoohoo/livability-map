export async function loadGrid() {
  const response = await fetch("/data/grid.geojson");

  if (!response.ok) {
    throw new Error(`Failed to load grid data: ${response.status}`);
  }

  const geojson = await response.json();

  return geojson;
}

export async function loadUnderlyingGrid() {
  const response = await fetch("/data/underlying-grid.geojson");

  if (!response.ok) {
    throw new Error(`Failed to load underlying grid: ${response.status}`);
  }

  const geojson = await response.json();

  return geojson;
}
