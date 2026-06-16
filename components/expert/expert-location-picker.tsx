import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text as RNText,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  LocationPickerMap,
  type LatLng,
  type Region,
} from "@/components/land/land-map";
import { Text } from "@/components/ui/text";
import { Palette } from "@/constants/theme";

const INDIA_CENTER: Region = {
  latitude: 22.5937,
  longitude: 78.9629,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

type MapBootState = {
  region: Region;
  denied: boolean;
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

function regionFromCoords(latitude: number, longitude: number): Region {
  return {
    latitude,
    longitude,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  };
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
  const [mapBoot, setMapBoot] = useState<MapBootState | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>(INDIA_CENTER);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [headerHeight, setHeaderHeight] = useState(90);

  useEffect(() => {
    let cancelled = false;

    async function initLocation() {
      let region = INDIA_CENTER;
      let denied = false;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          denied = true;
        } else {
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
            region = regionFromCoords(loc.coords.latitude, loc.coords.longitude);
          }
        }
      } catch {
        // keep India fallback
      }

      if (cancelled) {
        return;
      }

      setMapRegion(region);
      setMapBoot({ region, denied });
    }

    void initLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  async function locateMe() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setMapBoot((current) =>
          current ? { ...current, denied: true } : current,
        );
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
      if (!loc) return;

      const region = regionFromCoords(loc.coords.latitude, loc.coords.longitude);
      setMapBoot((current) =>
        current ? { ...current, denied: false } : current,
      );
      setMapRegion(region);
    } catch {
      // keep current map position
    }
  }

  function handleCenterChange(center: LatLng) {
    setSelectedLocation(center);
  }

  function handleConfirm() {
    if (!selectedLocation) {
      return;
    }
    onConfirm(selectedLocation.latitude, selectedLocation.longitude);
  }

  const canConfirm = selectedLocation != null;
  const locationDenied = mapBoot?.denied ?? false;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {mapBoot ? (
        <View style={styles.mapLayer} pointerEvents="box-none">
          <LocationPickerMap
            initialRegion={mapRegion}
            onCenterChange={handleCenterChange}
            unavailableMessage={mapsUnavailableLabel}
            loadingMessage={loadingMapLabel}
          />
        </View>
      ) : (
        <View style={[styles.map, styles.mapLoading]}>
          <ActivityIndicator size="large" color={Palette.indiaGreen} />
          <RNText style={styles.loadingText}>{loadingMapLabel}</RNText>
        </View>
      )}

      {mapBoot ? (
        <View pointerEvents="none" style={styles.centerPin}>
          <Ionicons name="location" size={42} color={Palette.saffron} />
        </View>
      ) : null}

      <View
        pointerEvents="box-none"
        style={[styles.headerOverlay, { paddingTop: insets.top }]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View pointerEvents="auto" style={styles.headerRow}>
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

          <View style={styles.headerSpacer} />
        </View>

        {locationDenied ? (
          <View pointerEvents="auto" style={styles.locationBanner}>
            <Ionicons name="location-outline" size={14} color="#92400E" />
            <Text style={styles.locationBannerText}>{locationDeniedLabel}</Text>
          </View>
        ) : null}

        {error ? (
          <View pointerEvents="auto" style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}
      </View>

      {mapBoot ? (
        <View
          pointerEvents="box-none"
          style={[styles.floatingRight, { top: headerHeight + 12 }]}
        >
          <Pressable
            style={styles.floatingButton}
            onPress={() => void locateMe()}
          >
            <Ionicons name="locate" size={20} color={Palette.indigo} />
          </Pressable>
        </View>
      ) : null}

      {mapBoot ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.instructionCard,
            { bottom: 120 + Math.max(insets.bottom, 16) },
          ]}
        >
          <View pointerEvents="auto" style={styles.instructionCardInner}>
            <View style={styles.instructionIcon}>
              <Ionicons name="move-outline" size={24} color={Palette.indigo} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.instructionTitle}>{instructionTitle}</Text>
              <Text style={styles.instructionBody}>{instructionBody}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {mapBoot ? (
        <View
          pointerEvents="box-none"
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
          ) : (
            <RNText style={styles.coordsPlaceholder}>{loadingMapLabel}</RNText>
          )}

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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  mapLayer: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
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
    zIndex: 3,
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
  headerSpacer: { width: 38 },
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
    zIndex: 3,
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
    zIndex: 3,
  },
  instructionCardInner: {
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
    zIndex: 3,
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
  coordsPlaceholder: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B8",
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
