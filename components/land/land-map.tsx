import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    View,
} from "react-native";
import type { LatLng, Region } from "react-native-maps";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { ErrorBoundary } from "@/components/error-boundary";
import { Text } from "@/components/ui/text";
import { Palette } from "@/constants/theme";

type MapPoint = LatLng & { id?: string };

type LandMapProps = {
  initialRegion: Region;
  points: MapPoint[];
  minPoints: number;
  onMapPress: (coordinate: LatLng) => void;
  unavailableMessage: string;
  loadingMessage: string;
  showsUserLocation?: boolean;
};

type WebMapPayload = {
  region: Region;
  points: LatLng[];
  minPoints: number;
};

type WebMapMessage =
  | { type: "ready" }
  | { type: "error" }
  | { type: "press"; payload?: unknown };

function serializeForInlineScript(value: unknown) {
  return (JSON.stringify(value) ?? "null").replace(/</g, "\\u003c");
}

function coordinateFromPayload(payload: unknown): LatLng | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const coordinate = payload as Partial<LatLng>;
  if (
    typeof coordinate.latitude === "number" &&
    typeof coordinate.longitude === "number" &&
    Number.isFinite(coordinate.latitude) &&
    Number.isFinite(coordinate.longitude)
  ) {
    return {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    };
  }

  return null;
}

function getOpenStreetMapHtml(payload: WebMapPayload) {
  const initialPayload = serializeForInlineScript(payload);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        background: #eef2f7;
      }
      body {
        overflow: hidden;
        -webkit-user-select: none;
        user-select: none;
      }
      .leaflet-container {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .corner-marker {
        width: 30px;
        height: 30px;
        border-radius: 15px;
        border: 2.5px solid #ffffff;
        background: ${Palette.indigo};
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 800;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.28);
      }
      .corner-marker.first {
        background: ${Palette.saffron};
      }
      .leaflet-control-attribution {
        font-size: 10px;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function () {
        var payload = ${initialPayload};
        var map = null;
        var layers = [];

        function post(type, messagePayload) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: type,
              payload: messagePayload
            }));
          }
        }

        function isFiniteNumber(value) {
          return typeof value === "number" && isFinite(value);
        }

        function validPoint(point) {
          return point &&
            isFiniteNumber(point.latitude) &&
            isFiniteNumber(point.longitude);
        }

        function validRegion(region) {
          return validPoint(region);
        }

        function mapZoom(region) {
          var delta = Math.max(
            region && region.latitudeDelta ? region.latitudeDelta : 8,
            region && region.longitudeDelta ? region.longitudeDelta : 8,
            0.0005
          );
          return Math.max(3, Math.min(19, Math.round(Math.log2(360 / delta))));
        }

        function safePoints(points) {
          if (!Array.isArray(points)) {
            return [];
          }
          return points.filter(validPoint);
        }

        function clearLayers() {
          layers.forEach(function (layer) {
            map.removeLayer(layer);
          });
          layers = [];
        }

        function renderBoundary() {
          if (!map) {
            return;
          }

          clearLayers();

          var points = safePoints(payload.points);
          var minPoints = Math.max(3, payload.minPoints || 3);
          var latLngs = points.map(function (point) {
            return [point.latitude, point.longitude];
          });

          if (latLngs.length >= minPoints) {
            layers.push(L.polygon(latLngs, {
              color: "${Palette.indiaGreen}",
              weight: 3,
              fillColor: "${Palette.indiaGreen}",
              fillOpacity: 0.3
            }).addTo(map));
          } else if (latLngs.length >= 2) {
            layers.push(L.polyline(latLngs, {
              color: "${Palette.indiaGreen}",
              weight: 3,
              dashArray: "8, 4"
            }).addTo(map));
          }

          latLngs.forEach(function (latLng, index) {
            var marker = L.marker(latLng, {
              icon: L.divIcon({
                className: "",
                html: '<div class="corner-marker ' + (index === 0 ? "first" : "") + '">' + (index + 1) + "</div>",
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              }),
              keyboard: false
            }).addTo(map);
            layers.push(marker);
          });
        }

        function applyPayload(nextPayload, shouldMove) {
          payload = Object.assign({}, payload, nextPayload || {});
          if (map && shouldMove && validRegion(payload.region)) {
            map.setView(
              [payload.region.latitude, payload.region.longitude],
              mapZoom(payload.region),
              { animate: true }
            );
          }
          renderBoundary();
        }

        window.updateLandMap = function (nextPayload) {
          applyPayload(nextPayload, true);
        };

        function init() {
          if (!window.L || !validRegion(payload.region)) {
            post("error", null);
            return;
          }

          map = L.map("map", {
            attributionControl: true,
            zoomControl: false,
            preferCanvas: true
          }).setView(
            [payload.region.latitude, payload.region.longitude],
            mapZoom(payload.region)
          );

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(map);

          map.on("click", function (event) {
            if (!event || !event.latlng) {
              return;
            }
            post("press", {
              latitude: event.latlng.lat,
              longitude: event.latlng.lng
            });
          });

          renderBoundary();
          setTimeout(function () {
            map.invalidateSize();
          }, 100);
          post("ready", null);
        }

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", init);
        } else {
          init();
        }
      })();
    </script>
  </body>
</html>`;
}

function LandMapInner(props: LandMapProps) {
  "use no memo";
  const { initialRegion, points, minPoints, onMapPress, unavailableMessage, loadingMessage } =
    props;
  const webViewRef = useRef<WebView>(null);
  const initialHtmlRef = useRef<string | null>(null);
  const [webReady, setWebReady] = useState(false);
  const [webFailed, setWebFailed] = useState(false);

  const mapCoordinates = useMemo(
    () => points.map(({ latitude, longitude }) => ({ latitude, longitude })),
    [points],
  );
  const webPayload = useMemo(
    () => ({
      region: initialRegion,
      points: mapCoordinates,
      minPoints,
    }),
    [initialRegion, mapCoordinates, minPoints],
  );

  if (initialHtmlRef.current == null) {
    initialHtmlRef.current = getOpenStreetMapHtml(webPayload);
  }

  useEffect(() => {
    if (!webReady || webFailed) {
      return;
    }

    webViewRef.current?.injectJavaScript(
      `window.updateLandMap && window.updateLandMap(${serializeForInlineScript(
        webPayload,
      )}); true;`,
    );
  }, [webFailed, webPayload, webReady]);

  function handleMessage(event: WebViewMessageEvent) {
    let message: WebMapMessage;
    try {
      message = JSON.parse(event.nativeEvent.data) as WebMapMessage;
    } catch {
      return;
    }

    if (message.type === "ready") {
      setWebReady(true);
      return;
    }

    if (message.type === "error") {
      setWebFailed(true);
      return;
    }

    if (message.type === "press") {
      const coordinate = coordinateFromPayload(message.payload);
      if (coordinate) {
        onMapPress(coordinate);
      }
    }
  }

  if (webFailed) {
    return (
      <View style={[styles.map, styles.fallback]}>
        <Text className="px-6 text-center text-[14px] leading-[21px] text-muted">
          {unavailableMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <WebView
        ref={webViewRef}
        source={{ html: initialHtmlRef.current }}
        style={styles.map}
        containerStyle={styles.map}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled={false}
        scrollEnabled={false}
        bounces={false}
        setSupportMultipleWindows={false}
        onMessage={handleMessage}
        onError={() => setWebFailed(true)}
      />
      {!webReady ? (
        <View pointerEvents="none" style={[styles.map, styles.fallback]}>
          <ActivityIndicator size="large" color={Palette.indiaGreen} />
          <Text className="mt-3 text-[14px] text-muted">{loadingMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function LandMap(props: LandMapProps) {
  "use no memo";
  return (
    <ErrorBoundary
      fallback={
        <View style={[styles.map, styles.fallback]}>
          <Text className="px-6 text-center text-[14px] leading-[21px] text-muted">
            {props.unavailableMessage}
          </Text>
        </View>
      }
    >
      <LandMapInner {...props} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  mapContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: "#EEF2F7" },
  map: { ...StyleSheet.absoluteFillObject },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2F7",
    gap: 8,
  },
});

export type { LatLng, Region };
