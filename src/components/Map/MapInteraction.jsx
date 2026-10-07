import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import { createCellIndex, findCellAtPoint } from "./mapUtils";

function constrainTransform(transform, underlyingGrid, projection, element) {
  if (!underlyingGrid || !projection || !element) {
    return transform;
  }

  const [[minX, minY], [maxX, maxY]] = d3
    .geoPath(projection)
    .bounds(underlyingGrid);

  const viewportWidth = element.clientWidth;
  const viewportHeight = element.clientHeight;

  const mapWidth = (maxX - minX) * transform.k;
  const mapHeight = (maxY - minY) * transform.k;

  let x = transform.x;
  let y = transform.y;

  // --------------------------------
  // Horizontal boundary
  // --------------------------------

  if (mapWidth <= viewportWidth) {
    x = (viewportWidth - mapWidth) / 2 - minX * transform.k;
  } else {
    const minTranslate = viewportWidth - maxX * transform.k;

    const maxTranslate = -minX * transform.k;

    x = Math.max(minTranslate, Math.min(maxTranslate, x));
  }

  // --------------------------------
  // Vertical boundary
  // --------------------------------

  if (mapHeight <= viewportHeight) {
    y = (viewportHeight - mapHeight) / 2 - minY * transform.k;
  } else {
    const minTranslate = viewportHeight - maxY * transform.k;

    const maxTranslate = -minY * transform.k;

    y = Math.max(minTranslate, Math.min(maxTranslate, y));
  }

  return d3.zoomIdentity.translate(x, y).scale(transform.k);
}

export default function MapInteraction({
  grid,
  underlyingGrid,
  projection,
  zoomTransform,
  onZoom,
  onHover,
}) {
  const interactionRef = useRef(null);
  const dragRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  // --------------------------------
  // Cell index
  // --------------------------------

  const cellIndex = useMemo(() => {
    if (!grid || !projection) {
      return null;
    }

    return createCellIndex(grid, projection);
  }, [grid, projection]);

  // --------------------------------
  // Zoom
  // --------------------------------

  useEffect(() => {
    const element = interactionRef.current;

    if (!element || !underlyingGrid || !projection) return;

    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .filter((event) => {
        // Mouse dragging is handled by our pointer handlers.
        // D3 still handles wheel and touch zooming.
        return event.type !== "mousedown";
      })
      .on("zoom", (event) => {
        const constrainedTransform = constrainTransform(
          event.transform,
          underlyingGrid,
          projection,
          element,
        );

        onZoom(constrainedTransform);

        d3.select(element).property("__zoom", constrainedTransform);
      });

    d3.select(element).call(zoom);

    return () => {
      d3.select(element).on(".zoom", null);
    };
  }, [underlyingGrid, projection, onZoom]);

  // --------------------------------
  // Pan
  // --------------------------------

  function handlePointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };

    setIsDragging(true);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;

    // Always update the pointer position.
    // This prevents overshoot from accumulating
    // when the map is against a boundary.
    drag.x = event.clientX;
    drag.y = event.clientY;

    const nextTransform = d3.zoomIdentity
      .translate(zoomTransform.x + dx, zoomTransform.y + dy)
      .scale(zoomTransform.k);

    const constrainedTransform = constrainTransform(
      nextTransform,
      underlyingGrid,
      projection,
      interactionRef.current,
    );

    onZoom(constrainedTransform);

    // Keep D3's wheel-zoom baseline aligned with the React transform.
    d3.select(event.currentTarget).property("__zoom", constrainedTransform);
  }

  function handlePointerUp(event) {
    if (dragRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  // --------------------------------
  // Hover
  // --------------------------------

  function handleMouseMove(event) {
    if (!cellIndex || !projection) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    // Convert screen coordinates back into
    // the unzoomed map coordinate system.
    const x = (screenX - zoomTransform.x) / zoomTransform.k;

    const y = (screenY - zoomTransform.y) / zoomTransform.k;

    const cell = findCellAtPoint(x, y, cellIndex, projection);

    onHover(cell, {
      x: screenX,
      y: screenY,
    });
  }

  function handleMouseLeave() {
    onHover(null, null);
  }

  // --------------------------------
  // Render
  // --------------------------------

  return (
    <div
      ref={interactionRef}
      className="absolute inset-0 z-10 bg-transparent"
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
    />
  );
}
