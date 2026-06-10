import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, type Href } from 'expo-router';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import type MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LandMap,
  type LatLng,
  type MapType,
  type Region,
} from '@/components/land/land-map';

import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { useCreateLandParcel, getLandParcelError } from '@/features/farmer/hooks/use-land-parcel';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAuthFlowStore } from '@/stores/auth-flow.store';
import { useAuthStore } from '@/stores/auth.store';
import type { GeoPolygon } from '@/types/farmer';

const INDIA_CENTER: Region = {
  latitude: 22.5937,
  longitude: 78.9629,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

const MIN_POINTS = 3;

type BoundaryPoint = LatLng & { id: string };

type BoundaryState = {
  points: BoundaryPoint[];
  selectedIndex: number | null;
};

type BoundaryAction =
  | { type: 'add'; coordinate: LatLng; id: string }
  | { type: 'update'; index: number; coordinate: LatLng }
  | { type: 'toggle_select'; index: number }
  | { type: 'undo' }
  | { type: 'clear' };

function boundaryReducer(state: BoundaryState, action: BoundaryAction): BoundaryState {
  switch (action.type) {
    case 'add': {
      const points = [...state.points, { ...action.coordinate, id: action.id }];
      return { points, selectedIndex: points.length - 1 };
    }
    case 'update': {
      if (action.index < 0 || action.index >= state.points.length) return state;
      const points = state.points.map((point, index) =>
        index === action.index ? { ...point, ...action.coordinate } : point,
      );
      return { ...state, points };
    }
    case 'toggle_select':
      return {
        ...state,
        selectedIndex: state.selectedIndex === action.index ? null : action.index,
      };
    case 'undo': {
      if (state.points.length === 0) return state;
      const removedIndex = state.points.length - 1;
      const points = state.points.slice(0, -1);
      let { selectedIndex } = state;

      if (selectedIndex !== null) {
        if (selectedIndex === removedIndex) {
          selectedIndex = points.length > 0 ? points.length - 1 : null;
        } else if (selectedIndex >= points.length) {
          selectedIndex = null;
        }
      }

      return { points, selectedIndex };
    }
    case 'clear':
      return { points: [], selectedIndex: null };
    default:
      return state;
  }
}

// Shoelace formula with equirectangular projection — accurate to <0.5% for parcels up to ~500 acres
function computeAreaAcres(coords: LatLng[]): number {
  if (coords.length < 3) return 0;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const avgLat = coords.reduce((s, c) => s + c.latitude, 0) / coords.length;
  const mPerLat = 111_320;
  const mPerLon = 111_320 * Math.cos(toRad(avgLat));
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area +=
      coords[i].longitude * mPerLon * (coords[j].latitude * mPerLat) -
      coords[j].longitude * mPerLon * (coords[i].latitude * mPerLat);
  }
  return Math.abs(area) / 2 / 4_047;
}

function toGeoJsonPolygon(coords: LatLng[]): GeoPolygon {
  const ring = coords.map((c): [number, number] => [c.longitude, c.latitude]);
  ring.push([coords[0].longitude, coords[0].latitude]); // close the ring
  return { type: 'Polygon', coordinates: [ring] };
}

function formatArea(acres: number): string {
  if (acres < 0.01) return '< 0.01 ac';
  if (acres >= 1000) return `${(acres / 1000).toFixed(1)}k ac`;
  return `${acres.toFixed(2)} ac`;
}

export default function LandBoundaryScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setProfileCompleted = useAuthStore((s) => s.setProfileCompleted);
  const landType = useAuthFlowStore((s) => s.landType);
  const setSignupStep = useAuthFlowStore((s) => s.setSignupStep);
  const mapRef = useRef<MapView>(null);
  const pointIdRef = useRef(0);
  const createParcel = useCreateLandParcel();
  const isBusy = createParcel.isPending;

  const [{ points, selectedIndex }, dispatchBoundary] = useReducer(boundaryReducer, {
    points: [],
    selectedIndex: null,
  });
  const [mapType, setMapType] = useState<MapType>('hybrid');
  const [initialRegion, setInitialRegion] = useState<Region>(INDIA_CENTER);
  const [locationReady, setLocationReady] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(90);
  const [bottomHeight, setBottomHeight] = useState(180);

  const finishOnboarding = useCallback(() => {
    setSignupStep('complete');
    setProfileCompleted(true);
    router.replace('/(tabs)' as Href);
  }, [setProfileCompleted, setSignupStep]);

  useEffect(() => {
    async function initLocation() {
      try {
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationDenied(true);
          setLocationReady(true);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setInitialRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        });
      } catch {
        // fallback to India center already set
      } finally {
        setLocationReady(true);
      }
    }
    initLocation();
  }, []);

  const handleBack = useCallback(() => {
    Alert.alert(
      t('landBoundary.backWarningTitle'),
      t('landBoundary.backWarningMessage'),
      [
        { text: t('landBoundary.backWarningCancel'), style: 'cancel' },
        {
          text: t('landBoundary.backWarningSkip'),
          style: 'default',
          onPress: finishOnboarding,
        },
      ],
    );
  }, [finishOnboarding, t]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [handleBack]);

  async function locateMe() {
    try {
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationDenied(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      mapRef.current?.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        },
        500,
      );
    } catch {}
  }

  function handleMapPress(coordinate: LatLng) {
    if (isBusy) return;

    if (selectedIndex !== null) {
      dispatchBoundary({ type: 'update', index: selectedIndex, coordinate });
      return;
    }

    dispatchBoundary({
      type: 'add',
      coordinate,
      id: `corner-${pointIdRef.current++}`,
    });
  }

  function handleMarkerPress(index: number) {
    if (isBusy) return;
    dispatchBoundary({ type: 'toggle_select', index });
  }

  function updatePoint(index: number, coord: LatLng) {
    if (isBusy) return;
    dispatchBoundary({ type: 'update', index, coordinate: coord });
  }

  function selectCorner(index: number) {
    if (isBusy) return;
    dispatchBoundary({ type: 'toggle_select', index });
  }

  function undoLastPoint() {
    if (isBusy || points.length === 0) return;
    dispatchBoundary({ type: 'undo' });
  }

  function clearAll() {
    if (isBusy || points.length === 0) return;
    Alert.alert(t('landBoundary.clearTitle'), t('landBoundary.clearMessage'), [
      { text: t('landBoundary.clearCancel'), style: 'cancel' },
      {
        text: t('landBoundary.clearConfirm'),
        style: 'destructive',
        onPress: () => dispatchBoundary({ type: 'clear' }),
      },
    ]);
  }

  async function handleConfirm() {
    if (points.length < MIN_POINTS) return;
    try {
      const geometry = toGeoJsonPolygon(points);
      await createParcel.mutateAsync({ name: 'My Field', geometry, landType });
      finishOnboarding();
    } catch (error) {
      Alert.alert('', getLandParcelError(error, t('landBoundary.errors.save')));
    }
  }

  function handleSkip() {
    finishOnboarding();
  }

  if (!isAuthenticated) {
    return <Redirect href={'/get-started' as Href} />;
  }

  const area = computeAreaAcres(points);
  const canConfirm = points.length >= MIN_POINTS;

  return (
    <View style={styles.container}>
      {/* Full-screen map */}
      {locationReady ? (
        <LandMap
          mapRef={mapRef}
          mapType={mapType}
          initialRegion={initialRegion}
          points={points}
          minPoints={MIN_POINTS}
          selectedIndex={selectedIndex}
          onMapPress={handleMapPress}
          onMarkerPress={handleMarkerPress}
          onPointDrag={updatePoint}
          unavailableMessage={t('landBoundary.mapsUnavailable')}
          loadingMessage={t('landBoundary.loadingMap')}
        />
      ) : (
        <View style={[styles.map, styles.mapLoading]}>
          <ActivityIndicator size="large" color={Palette.indiaGreen} />
          <RNText style={styles.loadingText}>{t('landBoundary.loadingMap')}</RNText>
        </View>
      )}

      {/* ── Header overlay ── */}
      <View
        style={[styles.headerOverlay, { paddingTop: insets.top }]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color={Palette.indigo} />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{t('landBoundary.stepLabel')}</Text>
            </View>
            <Text style={styles.headerTitle}>{t('landBoundary.title')}</Text>
          </View>

          {/* Map type toggle */}
          <Pressable
            style={styles.mapTypeButton}
            onPress={() => setMapType((t) => (t === 'hybrid' ? 'standard' : 'hybrid'))}
          >
            <Ionicons
              name={mapType === 'hybrid' ? 'map-outline' : 'globe-outline'}
              size={16}
              color={Palette.indigo}
            />
            <RNText style={styles.mapTypeText}>
              {mapType === 'hybrid' ? t('landBoundary.mapView') : t('landBoundary.satelliteView')}
            </RNText>
          </Pressable>
        </View>

        {/* Location denied banner */}
        {locationDenied && (
          <View style={styles.locationBanner}>
            <Ionicons name="location-outline" size={14} color="#92400E" />
            <Text style={styles.locationBannerText}>{t('landBoundary.locationDenied')}</Text>
          </View>
        )}
      </View>

      {/* ── Floating right controls ── */}
      <View style={[styles.floatingRight, { top: headerHeight + 12 }]}>
        <Pressable style={styles.floatingButton} onPress={locateMe}>
          <Ionicons name="locate" size={20} color={Palette.indigo} />
        </Pressable>
      </View>

      {/* ── Instruction card (shown when 0 points) ── */}
      {points.length === 0 && locationReady && (
        <View style={[styles.instructionCard, { bottom: bottomHeight + 16 }]}>
          <View style={styles.instructionIcon}>
            <Ionicons name="finger-print-outline" size={24} color={Palette.indigo} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.instructionTitle}>{t('landBoundary.instructionTitle')}</Text>
            <Text style={styles.instructionBody}>{t('landBoundary.instructionBody')}</Text>
          </View>
        </View>
      )}

      {/* ── Bottom panel ── */}
      <View
        style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 16) }]}
        onLayout={(e) => setBottomHeight(e.nativeEvent.layout.height)}
      >
        {/* Stats row */}
        {points.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{points.length}</Text>
              <Text style={styles.statLabel}>{t('landBoundary.cornersLabel')}</Text>
            </View>
            {canConfirm && (
              <View style={[styles.statCard, styles.statCardAccent]}>
                <Text style={[styles.statValue, styles.statValueAccent]}>
                  {formatArea(area)}
                </Text>
                <Text style={[styles.statLabel, styles.statLabelAccent]}>
                  {t('landBoundary.areaLabel')}
                </Text>
              </View>
            )}
            {!canConfirm && (
              <View style={[styles.statCard, { flex: 2 }]}>
                <Text style={styles.statHint}>{t('landBoundary.minPointsHint')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Corner selector chips */}
        {points.length > 0 && (
          <View style={styles.cornerRow}>
            <RNText style={styles.cornerRowLabel}>{t('landBoundary.selectCorner')}</RNText>
            <View style={styles.cornerChips}>
              {points.map((point, index) => {
                const selected = selectedIndex === index;
                return (
                  <Pressable
                    key={point.id}
                    onPress={() => selectCorner(index)}
                    style={[styles.cornerChip, selected && styles.cornerChipSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <RNText
                      style={[styles.cornerChipText, selected && styles.cornerChipTextSelected]}
                    >
                      {index + 1}
                    </RNText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Undo / Clear row */}
        {points.length > 0 && (
          <View style={styles.editRow}>
            <Pressable
              style={[styles.editButton, isBusy && styles.editButtonDisabled]}
              onPress={undoLastPoint}
              disabled={isBusy || points.length === 0}
            >
              <Ionicons name="arrow-undo" size={16} color={Palette.indigo} />
              <RNText style={styles.editButtonText}>{t('landBoundary.undo')}</RNText>
            </Pressable>
            <Pressable
              style={[styles.editButton, isBusy && styles.editButtonDisabled]}
              onPress={clearAll}
              disabled={isBusy}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <RNText style={[styles.editButtonText, { color: '#EF4444' }]}>
                {t('landBoundary.clearAll')}
              </RNText>
            </Pressable>
          </View>
        )}

        {/* Drag hint (shown after first point) */}
        {points.length > 0 && (
          <Text style={styles.dragHint}>
            {selectedIndex !== null
              ? t('landBoundary.moveSelectedHint', { corner: selectedIndex + 1 })
              : t('landBoundary.dragHint')}
          </Text>
        )}

        {/* Primary actions */}
        <View style={styles.primaryRow}>
          <Pressable style={styles.skipButton} onPress={handleSkip} disabled={isBusy}>
            <RNText style={styles.skipText}>{t('landBoundary.skip')}</RNText>
          </Pressable>

          <Pressable
            style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!canConfirm || isBusy}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={canConfirm ? '#fff' : '#94A3B8'}
                />
                <RNText
                  style={[styles.confirmText, !canConfirm && styles.confirmTextDisabled]}
                >
                  {t('landBoundary.confirm')}
                </RNText>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { ...StyleSheet.absoluteFillObject },
  mapLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#EEF2F7',
  },
  loadingText: {
    fontSize: 14,
    color: Palette.indigo,
    fontWeight: '500',
  },

  // Header
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.07)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, gap: 2 },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.indigo,
    lineHeight: 20,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(70,150,47,0.1)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.indiaGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  mapTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    backgroundColor: '#F8FAFC',
  },
  mapTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.indigo,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  locationBannerText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },

  // Floating controls
  floatingRight: {
    position: 'absolute',
    right: 12,
    gap: 8,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },

  // Instruction card
  instructionCard: {
    position: 'absolute',
    left: 16,
    right: 68,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    backgroundColor: 'rgba(26,54,93,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.indigo,
  },
  instructionBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },

  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.07)',
    paddingTop: 14,
    paddingHorizontal: 14,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    gap: 1,
  },
  statCardAccent: {
    backgroundColor: 'rgba(70,150,47,0.08)',
    borderColor: 'rgba(70,150,47,0.2)',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.indigo,
    lineHeight: 22,
  },
  statValueAccent: {
    color: Palette.indiaGreen,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statLabelAccent: {
    color: 'rgba(70,150,47,0.7)',
  },
  statHint: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  cornerRow: {
    gap: 8,
  },
  cornerRowLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cornerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cornerChip: {
    minWidth: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.10)',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  cornerChipSelected: {
    borderColor: Palette.indiaGreen,
    backgroundColor: 'rgba(70, 150, 47, 0.12)',
  },
  cornerChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.indigo,
  },
  cornerChipTextSelected: {
    color: Palette.indiaGreen,
  },
  editRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
    backgroundColor: '#F8FAFC',
  },
  editButtonDisabled: {
    opacity: 0.45,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.indigo,
  },
  dragHint: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 15,
  },
  primaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  skipButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#F8FAFC',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Palette.indiaGreen,
  },
  confirmButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  confirmTextDisabled: {
    color: '#94A3B8',
  },
});
