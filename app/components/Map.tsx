"use client";

import { useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView() {
  const [viewState, setViewState] = useState({
    latitude: 3.139,
    longitude: 101.6869,
    zoom: 13,
  });

  return (
    <div className="w-full max-w-5xl h-[650px] rounded-3xl overflow-hidden shadow-2xl border bg-white relative">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: "100%", height: "100%" }}
      >

        <Marker latitude={3.139} longitude={101.6869} anchor="bottom">
          <div className="text-4xl drop-shadow">📍</div>
        </Marker>
      </Map>
    </div>
  );
}