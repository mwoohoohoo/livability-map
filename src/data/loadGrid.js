const BASE_URL = import.meta.env.BASE_URL;

export async function loadGrid() {
  const response = await fetch(`${BASE_URL}data/grid.geojson`);

  if (!response.ok) {
    throw new Error(`Failed to load grid data: ${response.status}`);
  }

  return response.json();
}

export async function loadUnderlyingGrid() {
  const response = await fetch(`${BASE_URL}data/underlying-grid.geojson`);

  if (!response.ok) {
    throw new Error(`Failed to load underlying grid data: ${response.status}`);
  }

  return response.json();
}
