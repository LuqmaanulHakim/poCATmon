"use client";

import { useState } from "react";
import Map, { Marker, NavigationControl, ScaleControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { useTheme } from "../context/ThemeContext";

const lightStyle =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const darkStyle =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export default function MapPage() {
  const { darkMode } = useTheme();

  const [viewState, setViewState] = useState({
    latitude: 3.139,
    longitude: 101.6869,
    zoom: 13,
  });

  return (
    <div className="w-screen h-screen">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={darkMode ? darkStyle : lightStyle}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {/* <NavigationControl position="bottom-left" /> */}
        {/* <ScaleControl position="bottom-right" /> */}

        <Marker latitude={3.139} longitude={101.6869} anchor="bottom">
          <div className="text-3xl">📍</div>
        </Marker>
      </Map>
    </div>
  );
}