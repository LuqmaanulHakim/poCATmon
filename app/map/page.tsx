"use client";

import { useState, useEffect, useRef } from "react";
import Map, { Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { onSnapshot, collection } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";
import { getFirebaseDb } from "../lib/firebase";
import type { CatSighting } from "../lib/sightings";

const lightStyle =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const darkStyle =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const STORAGE_KEY = "lastMapState";

// ─── Cat pin ──────────────────────────────────────────────────────────────────
function CatPin() {
  return (
    <div
      className="cursor-pointer transition-transform duration-150 hover:scale-110"
      style={{ transform: "translateY(-6px)" }}
    >
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
        <path
          d="M17 1C8.16 1 1 8.16 1 17c0 11 16 23 16 23s16-12 16-23C33 8.16 25.84 1 17 1z"
          fill="var(--accent)"
          stroke="var(--background)"
          strokeWidth="2"
        />
        {/* paw print */}
        <g fill="var(--background)">
          <circle cx="11.5" cy="14" r="2.1" />
          <circle cx="17" cy="11.5" r="2.3" />
          <circle cx="22.5" cy="14" r="2.1" />
          <ellipse cx="17" cy="19.5" rx="5.2" ry="4.4" />
        </g>
      </svg>
    </div>
  );
}

export default function MapPage() {
  const { darkMode } = useTheme();

  const mapRef = useRef<any>(null);

  const [gpsEnabled, setGpsEnabled] = useState(false);

  const [viewState, setViewState] = useState({
    latitude: 2.8,
    longitude: 102.35,
    zoom: 6,
  });

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationError, setLocationError] = useState<string | null>(null);

  // ── Cat sightings ────────────────────────────────────────────────────────────
  const [sightings, setSightings] = useState<CatSighting[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<CatSighting | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const unsubscribe = onSnapshot(
      collection(db, "sightings"),
      (snapshot) => {
        const next = snapshot.docs.map((d) => d.data() as CatSighting);
        setSightings(next);
      },
      (error) => {
        console.error("Failed to listen for sightings:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save map state
  const saveMapState = (state: {
    latitude: number;
    longitude: number;
    zoom: number;
  }) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        savedAt: Date.now(),
      })
    );
  };

  // Restore map state with smooth flyTo
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const data = JSON.parse(saved);

      const expired =
        Date.now() - data.savedAt >
        24 * 60 * 60 * 1000;

      if (expired) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Smooth animation on load
      setTimeout(() => {
        mapRef.current?.flyTo({
          center: [data.longitude, data.latitude],
          zoom: data.zoom ?? 10,
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });
      }, 100);

      setViewState({
        latitude: data.latitude,
        longitude: data.longitude,
        zoom: data.zoom ?? 10,
      });

      // DO NOT restore marker
      setUserLocation(null);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // GPS single fetch
  const startGPS = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setGpsEnabled(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const newState = {
          latitude,
          longitude,
          zoom: 15,
        };

        setUserLocation({ latitude, longitude });

        // Smooth camera move
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });

        setViewState((prev) => ({
          ...prev,
          ...newState,
        }));

        saveMapState(newState);

        setGpsEnabled(false);
      },
      (error) => {
        console.error(error);
        setLocationError("Unable to retrieve location");
        setGpsEnabled(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const toggleGPS = () => {
    if (!gpsEnabled) startGPS();
  };

  return (
    <div className="relative w-screen h-screen">
      <style>{`
        .cat-sighting-popup .maplibregl-popup-content {
          background: transparent;
          padding: 0;
          box-shadow: none;
        }
        .cat-sighting-popup .maplibregl-popup-tip {
          display: none;
        }
      `}</style>

      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => {
          setViewState(evt.viewState);

          saveMapState({
            latitude: evt.viewState.latitude,
            longitude: evt.viewState.longitude,
            zoom: evt.viewState.zoom,
          });
        }}
        mapStyle={darkMode ? darkStyle : lightStyle}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        onClick={() => setSelectedSighting(null)}
      >
        {userLocation && (
          <Marker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-5 w-5 rounded-full bg-blue-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500 border-2 border-white shadow" />
            </div>
          </Marker>
        )}

        {sightings.map((sighting) => (
          <Marker
            key={sighting.id}
            latitude={sighting.latitude}
            longitude={sighting.longitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedSighting((current) =>
                current?.id === sighting.id ? null : sighting
              );
            }}
          >
            <CatPin />
          </Marker>
        ))}

        {selectedSighting && (
          <Popup
            latitude={selectedSighting.latitude}
            longitude={selectedSighting.longitude}
            closeButton={false}
            offset={28}
            anchor="bottom"
            className="cat-sighting-popup"
          >
            <div
              style={{
                width: 168,
                padding: 10,
                borderRadius: 10,
                background: "var(--background)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
              }}
            >
              <div
                style={{
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}
              >
                <img
                  src={selectedSighting.imageData}
                  alt="Cat sighting"
                  style={{
                    width: "100%",
                    height: 132,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Sighting
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  {Math.round(selectedSighting.confidence * 100)}%
                </span>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* GPS Button (unchanged design) */}
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