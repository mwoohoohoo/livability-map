import { useEffect, useRef } from "react";
import { drawUnderlyingGrid, drawGrid } from "./mapUtils";

export default function MapCanvas({
  grid,
  underlyingGrid,
  projection,
  width,
  height,
  zoomTransform,
  weights,
  dealbreaker,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (
      !canvas ||
      !grid ||
      !underlyingGrid ||
      !projection ||
      width === 0 ||
      height === 0
    ) {
      return;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    context.clearRect(0, 0, width, height);

    // Apply zoom / pan
    context.save();

    context.translate(zoomTransform.x, zoomTransform.y);

    context.scale(zoomTransform.k, zoomTransform.k);

    // Base layer
    drawUnderlyingGrid(context, projection, underlyingGrid);

    // Scored grid
    drawGrid(context, projection, grid, weights, dealbreaker);

    context.restore();
  }, [
    grid,
    underlyingGrid,
    projection,
    width,
    height,
    zoomTransform,
    weights,
    dealbreaker,
  ]);

  return <canvas ref={canvasRef} className="absolute inset-0 block" />;
}
