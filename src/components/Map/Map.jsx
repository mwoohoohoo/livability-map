import * as d3 from "d3";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { loadGrid, loadUnderlyingGrid } from "../../data/loadGrid";

import { transformGrid } from "../../data/transformGrid";

import {
  VARIABLES,
  calculateFinalScore,
  calculateWeights,
  createDefaultSettings,
} from "../../data/scoreModel";

import MapCanvas from "./MapCanvas";
import MapInteraction from "./MapInteraction";
import MapTooltip from "./MapTooltip";
import { createProjection } from "./mapUtils";

import ScoreSidebar from "../ScoreControls/ScoreSidebar";
import ScoreSheet from "../ScoreControls/ScoreSheet";
import FiltersButton from "../ScoreControls/FiltersButton";

export default function Map() {
  const mapViewportRef = useRef(null);

  const [grid, setGrid] = useState(null);
  const [underlyingGrid, setUnderlyingGrid] = useState(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const [hoveredCell, setHoveredCell] = useState(null);

  const [tooltipPosition, setTooltipPosition] = useState(null);

  const [error, setError] = useState(null);

  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity);

  // --------------------------------
  // Score settings
  // --------------------------------

  const [scoreSettings, setScoreSettings] = useState(createDefaultSettings);

  const defaultSettings = useMemo(() => createDefaultSettings(), []);

  const weights = useMemo(
    () => calculateWeights(scoreSettings),
    [scoreSettings],
  );

  const hoveredFinalScore = useMemo(() => {
    if (!hoveredCell) return null;

    return calculateFinalScore(hoveredCell, weights, scoreSettings.dealbreaker);
  }, [hoveredCell, weights, scoreSettings.dealbreaker]);

  // --------------------------------
  // Filters UI
  // --------------------------------

  const [filtersOpen, setFiltersOpen] = useState(false);

  // --------------------------------
  // Load data
  // --------------------------------

  useEffect(() => {
    async function fetchMapData() {
      try {
        const [gridGeoJSON, underlyingGridGeoJSON] = await Promise.all([
          loadGrid(),
          loadUnderlyingGrid(),
        ]);

        setGrid(transformGrid(gridGeoJSON));
        setUnderlyingGrid(underlyingGridGeoJSON);
      } catch (err) {
        console.error("Failed to load map data:", err);

        setError(err);
      }
    }

    fetchMapData();
  }, []);

  // --------------------------------
  // Map dimensions
  // --------------------------------

  useLayoutEffect(() => {
    const element = mapViewportRef.current;

    if (!element) {
      return;
    }

    function updateDimensions() {
      setWidth(element.clientWidth);
      setHeight(element.clientHeight);
    }

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [grid, underlyingGrid]);

  // --------------------------------
  // Projection
  // --------------------------------

  const projection = useMemo(() => {
    if (!grid || width === 0 || height === 0) {
      return null;
    }

    const hasSidebar = width >= 1580;
    const sidebarWidth = hasSidebar ? 360 : 0;

    return createProjection(grid, width, height, {
      availableLeft: sidebarWidth,
      availableRight: width,
      fitToHeight: hasSidebar,
    });
  }, [grid, width, height]);

  // --------------------------------
  // Hover and zoom
  // --------------------------------

  const handleZoom = useCallback((transform) => {
    setZoomTransform(transform);
  }, []);

  function handleHover(cell, position) {
    setHoveredCell(cell);
    setTooltipPosition(position);
  }

  // --------------------------------
  // Score controls
  // --------------------------------

  function handleImportanceChange(variableId, value) {
    setScoreSettings((previous) => ({
      ...previous,
      [variableId]: value,
    }));
  }

  function handleRemove(variableId) {
    setScoreSettings((previous) => {
      const isCurrentlyRemoved = previous.removed.includes(variableId);

      if (isCurrentlyRemoved) {
        return {
          ...previous,
          removed: previous.removed.filter((id) => id !== variableId),
        };
      }

      return {
        ...previous,

        removed: [...previous.removed, variableId],

        dealbreaker:
          previous.dealbreaker === variableId ? null : previous.dealbreaker,
      };
    });
  }

  function handleDealbreakerChange(variableId, checked) {
    setScoreSettings((previous) => ({
      ...previous,
      dealbreaker: checked ? variableId : null,
    }));
  }

  function handleReset() {
    setScoreSettings(createDefaultSettings());
  }

  // --------------------------------
  // Render
  // --------------------------------

  if (error) {
    return <div>Failed to load map data.</div>;
  }

  if (!grid || !underlyingGrid) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Actual map viewport */}
      <div ref={mapViewportRef} className="relative h-full w-full">
        {projection && width > 0 && height > 0 && (
          <>
            <MapCanvas
              grid={grid}
              underlyingGrid={underlyingGrid}
              projection={projection}
              width={width}
              height={height}
              zoomTransform={zoomTransform}
              weights={weights}
              dealbreaker={scoreSettings.dealbreaker}
            />

            <MapInteraction
              grid={grid}
              underlyingGrid={underlyingGrid}
              projection={projection}
              zoomTransform={zoomTransform}
              onZoom={handleZoom}
              onHover={handleHover}
            />

            <MapTooltip
              cell={hoveredCell}
              position={tooltipPosition}
              mapWidth={width}
              mapHeight={height}
              finalScore={hoveredFinalScore}
            />
          </>
        )}
      </div>

      {/* Permanent sidebar on wider screens */}
      <div
        className="
        absolute
        inset-y-0
        left-0
        z-30
        hidden
        w-[360px]
        min-[1580px]:block
      "
      >
        <ScoreSidebar
          variables={VARIABLES}
          settings={scoreSettings}
          defaultSettings={defaultSettings}
          onImportanceChange={handleImportanceChange}
          onRemove={handleRemove}
          onDealbreakerChange={handleDealbreakerChange}
          onReset={handleReset}
        />
      </div>

      {/* Filters CTA on narrower screens */}
      <div
        className="
        fixed
        bottom-6
        left-1/2
        z-30
        -translate-x-1/2
        min-[1580px]:hidden
      "
      >
        <FiltersButton onClick={() => setFiltersOpen(true)} />
      </div>

      {/* Overlay / bottom sheet on narrower screens */}
      <ScoreSheet
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        variables={VARIABLES}
        settings={scoreSettings}
        defaultSettings={defaultSettings}
        onImportanceChange={handleImportanceChange}
        onRemove={handleRemove}
        onDealbreakerChange={handleDealbreakerChange}
        onReset={handleReset}
      />
    </div>
  );
}
