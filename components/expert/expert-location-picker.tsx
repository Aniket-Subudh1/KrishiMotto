import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    Pressable,
    Text as RNText,
    StyleSheet,
    View,
} from "react-native";
import type MapView from "react-native-maps";
import type { LatLng, MapType, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/error-boundary";
import { Text } from "@/components/ui/text";
import { Palette } from "@/constants/theme";

const INDIA_CENTER: Region = {
  latitude: 22.5937,
  longitude: 78.9629,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

type MapsModule = {
  default: typeof MapView;
};

type ExpertLocationPickerProps = {
  stepLabel: string;
  title: string;
  subtitle: string;
  instructionTitle: string;
  instructionBody: string;
  confirmLabel: string;
  coordsLabel: string;
  locationDeniedLabel: string;
  mapsUnavailableLabel: string;
  loadingMapLabel: string;
  onBack: () => void;
  onConfirm: (latitude: number, longitude: number) => void;
  isSubmitting?: boolean;
  error?: string | null;
};

function LocationMap({
  mapsModule,
  mapRef,
  mapType,
  initialRegion,
  showsUserLocation,
  onRegionChangeComplete,
}: {
  mapsModule: MapsModule;
  mapRef: React.RefObject<MapView | null>;
  mapType: MapType;
  initialRegion: Region;
  showsUserLocation: boolean;
  onRegionChangeComplete: (region: Region) => void;
}) {
  "use no memo";
  const MapView = mapsModule.default;

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      mapType={mapType}
      initialRegion={initialRegion}
      onRegionChangeComplete={onRegionChangeComplete}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
    />
  );
}

export function ExpertLocationPicker({
  stepLabel,
  title,
  subtitle,
  instructionTitle,
  instructionBody,
  confirmLabel,
  coordsLabel,
  locationDeniedLabel,
  mapsUnavailableLabel,
  loadingMapLabel,
  onBack,
  onConfirm,
  isSubmitting = false,
  error,
}: ExpertLocationPickerProps) {
  "use no memo";
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [mapsModule, setMapsModule] = useState<MapsModule | null>(null);
  const [mapsFailed, setMapsFailed] = useState(false);
  const [mapType, setMapType] = useState<MapType>(
    Platform.OS === "android" ? "standard" : "hybrid",
  );
  const [initialRegion, setInitialRegion] = useState<Region>(INDIA_CENTER);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [locationReady, setLocationReady] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(90);

  useEffect(() => {
    let cancelled = false;

    import("react-native-maps")
      .then((mod) => {
        if (!cancelled) {
          setMapsModule({ default: mod.default });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMapsFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    async function initLocation() {
      try {
        const Location = await import("expo-location");
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationDenied(true);
          setSelectedLocation({
            latitude: INDIA_CENTER.latitude,
            longitude: INDIA_CENTER.longitude,
          });
          return;
        }

        const timeout = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 8000),
        );
        const loc = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          timeout,
        ]);
        if (loc) {
          const region = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          };
          setInitialRegion(region);
          setSelectedLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } else {
          setSelectedLocation({
            latitude: INDIA_CENTER.latitude,
            longitude: INDIA_CENTER.longitude,
          });
        }
      } catch {
        setSelectedLocation({
          latitude: INDIA_CENTER.latitude,
          longitude: INDIA_CENTER.longitude,
        });
      } finally {
        setLocationReady(true);
      }
    }

    void initLocation();
  }, []);

  async function locateMe() {
    try {
      const Location = await import("expo-location");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationDenied(true);
        return;
      }

      setLocationDenied(false);
      const timeout = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 8000),
      );
      const loc = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        timeout,
      ]);
      if (!loc) return;
      const region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      };
      mapRef.current?.animateToRegion(region, 400);
      setSelectedLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch {
      // keep current map position
    }
  }

  function handleRegionChange(region: Region) {
    setSelectedLocation({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  }

  function handleConfirm() {
    if (!selectedLocation) {
      return;
    }
    onConfirm(selectedLocation.latitude, selectedLocation.longitude);
  }

  const canConfirm = selectedLocation != null;

  return (
    <View style={styles.container}>
      {locationReady && mapsModule && !mapsFailed ? (
        <ErrorBoundary
          fallback={
            <View style={[styles.map, styles.mapLoading]}>
              <Text className="px-6 text-center text-[14px] leading-[21px] text-muted">
                {mapsUnavailableLabel}
              </Text>
            </View>
          }
        >
          <LocationMap
            mapsModule={mapsModule}
            mapRef={mapRef}
            mapType={mapType}
            initialRegion={initialRegion}
            showsUserLocation={!locationDenied}
            onRegionChangeComplete={handleRegionChange}
          />
        </ErrorBoundary>
      ) : mapsFailed ? (
        <View style={[styles.map, styles.mapLoading]}>
          <Text className="px-6 text-center text-[14px] leading-[21px] text-muted">
            {mapsUnavailableLabel}
          </Text>
        </View>
      ) : (
        <View style={[styles.map, styles.mapLoading]}>
          <ActivityIndicator size="large" color={Palette.indiaGreen} />
          <RNText style={styles.loadingText}>{loadingMapLabel}</RNText>
        </View>
      )}

      {locationReady ? (
        <View pointerEvents="none" style={styles.centerPin}>
          <Ionicons name="location" size={42} color={Palette.saffron} />
        </View>
      ) : null}

      <View
        style={[styles.headerOverlay, { paddingTop: insets.top }]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={20} color={Palette.indigo} />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{stepLabel}</Text>
            </View>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>

          <Pressable
            style={styles.mapTypeButton}
            onPress={() =>
              setMapType((current) => {
                if (Platform.OS === "android") {
                  return current === "standard" ? "satellite" : "standard";
                }

                return current === "hybrid" ? "standard" : "hybrid";
              })
            }
          >
            <Ionicons
              name={mapType === "standard" ? "globe-outline" : "map-outline"}
              size={16}
              color={Palette.indigo}
            />
          </Pressable>
        </View>

        {locationDenied ? (
          <View style={styles.locationBanner}>
            <Ionicons name="location-outline" size={14} color="#92400E" />
            <Text style={styles.locationBannerText}>{locationDeniedLabel}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}
      </View>

      {locationReady ? (
        <View style={[styles.floatingRight, { top: headerHeight + 12 }]}>
          <Pressable
            style={styles.floatingButton}
            onPress={() => void locateMe()}
          >
            <Ionicons name="locate" size={20} color={Palette.indigo} />
          </Pressable>
        </View>
      ) : null}

      {locationReady ? (
        <View
          style={[
            styles.instructionCard,
            { bottom: 120 + Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={styles.instructionIcon}>
            <Ionicons name="move-outline" size={24} color={Palette.indigo} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.instructionTitle}>{instructionTitle}</Text>
            <Text style={styles.instructionBody}>{instructionBody}</Text>
          </View>
        </View>
      ) : null}

      <View
        style={[
          styles.bottomPanel,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {selectedLocation ? (
          <Text style={styles.coordsText}>
            {coordsLabel
              .replace("{{lat}}", selectedLocation.latitude.toFixed(6))
              .replace("{{lon}}", selectedLocation.longitude.toFixed(6))}
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.confirmButton,
            (!canConfirm || isSubmitting) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!canConfirm || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={canConfirm ? "#fff" : "#94A3B8"}
              />
              <RNText
                style={[
                  styles.confirmText,
                  !canConfirm && styles.confirmTextDisabled,
                ]}
              >
                {confirmLabel}
              </RNText>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  map: { ...StyleSheet.absoluteFillObject },
  mapLoading: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#EEF2F7",
  },
  loadingText: {
    fontSize: 14,
    color: Palette.indigo,
    fontWeight: "500",
  },
  centerPin: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -42,
    marginLeft: -21,
    zIndex: 2,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.07)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, gap: 2 },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.indigo,
    lineHeight: 20,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  stepBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(244,164,96,0.16)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.saffron,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  mapTypeButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
  },
  locationBannerText: {
    fontSize: 12,
    color: "#92400E",
    flex: 1,
  },
  errorBanner: {
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  errorBannerText: {
    fontSize: 12,
    color: "#B91C1C",
  },
  floatingRight: {
    position: "absolute",
    right: 12,
    gap: 8,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  instructionCard: {
    position: "absolute",
    left: 16,
    right: 68,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  instructionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(26,54,93,0.07)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.indigo,
  },
  instructionBody: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.07)",
    paddingTop: 14,
    paddingHorizontal: 14,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  coordsText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.indigo,
    textAlign: "center",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Palette.indiaGreen,
  },
  confirmButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  confirmTextDisabled: {
    color: "#94A3B8",
  },
});
