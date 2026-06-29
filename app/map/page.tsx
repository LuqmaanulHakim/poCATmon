"use client";

import { useState, useRef, useEffect } from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "../context/ThemeContext";

const lightStyle =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const darkStyle =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export default function MapPage() {
  const { darkMode } = useTheme();

  const watchIdRef = useRef<number | null>(null);

  const [gpsEnabled, setGpsEnabled] = useState(false);

  const [viewState, setViewState] = useState({
    latitude: 4.4500,
    longitude: 102.3500,
    zoom: 6,
  });

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationError, setLocationError] = useState<string | null>(null);

  const startGPS = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setLocationError(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setUserLocation({ latitude, longitude });

        setViewState((prev) => ({
          ...prev,
          latitude,
          longitude,
          zoom: 15,
        }));
      },
      (error) => {
        console.error(error);
        setLocationError("Unable to retrieve location");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
      }
    );

    watchIdRef.current = id;
    setGpsEnabled(true);
  };

  const stopGPS = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setGpsEnabled(false);
  };

  const toggleGPS = () => {
    if (gpsEnabled) stopGPS();
    else startGPS();
  };

  return (
    <div className="relative w-screen h-screen">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={darkMode ? darkStyle : lightStyle}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {userLocation && (
          <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-5 w-5 rounded-full bg-blue-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500 border-2 border-white shadow" />
            </div>
          </Marker>
        )}
      </Map>

      {/* GPS Toggle Button */}
      <div className="absolute bottom-35 right-4 flex flex-col items-end gap-2">
        {locationError && (
          <div className="text-xs text-white bg-red-500 rounded-lg px-3 py-1.5 shadow max-w-48 text-right">
            {locationError}
          </div>
        )}

        <button
          onClick={toggleGPS}
          aria-label="Toggle GPS"
          className={`
            flex items-center justify-center w-11 h-11 rounded-xl shadow-lg
            transition-all duration-200 active:scale-95
            ${
              gpsEnabled
                ? "bg-blue-500 text-white"
                : darkMode
                ? "bg-gray-800 hover:bg-gray-700 border border-gray-600"
                : "bg-white hover:bg-gray-50 border border-gray-200"
            }
          `}
        >
          {/* Icon */}
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}