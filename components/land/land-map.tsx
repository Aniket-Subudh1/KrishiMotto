import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text as RNText, View } from 'react-native';
import type MapView from 'react-native-maps';
import type {
  LatLng,
  MapType,
  Marker as MarkerType,
  Polygon as PolygonType,
  Polyline as PolylineType,
  Region,
} from 'react-native-maps';

import { ErrorBoundary } from '@/components/error-boundary';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

type MapsModule = {
  default: typeof MapView;
  Marker: typeof MarkerType;
  Polygon: typeof PolygonType;
  Polyline: typeof PolylineType;
};

type MapPoint = LatLng & { id?: string };

type LandMapProps = {
  mapRef: React.RefObject<MapView | null>;
  mapType: MapType;
  initialRegion: Region;
  points: MapPoint[];
  minPoints: number;
  onMapPress: (coordinate: LatLng) => void;
  unavailableMessage: string;
  loadingMessage: string;
  showsUserLocation?: boolean;
};

function LandMapInner({
  mapsModule,
  mapRef,
  mapType,
  initialRegion,
  points,
  minPoints,
  onMapPress,
  showsUserLocation = true,
}: Omit<LandMapProps, 'unavailableMessage' | 'loadingMessage'> & {
  mapsModule: MapsModule;
}) {
  'use no memo';
  const MapView = mapsModule.default;
  const { Marker, Polygon, Polyline } = mapsModule;

  const mapCoordinates = useMemo(
    () => points.map(({ latitude, longitude }) => ({ latitude, longitude })),
    [points],
  );

  function handleMapPress(coordinate: LatLng | undefined) {
    if (!coordinate) return;
    onMapPress(coordinate);
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      mapType={mapType}
      initialRegion={initialRegion}
      onPress={(e) => handleMapPress(e.nativeEvent.coordinate)}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      moveOnMarkerPress={false}
    >
      {points.length >= minPoints && (
        <Polygon
          coordinates={mapCoordinates}
          strokeColor={Palette.indiaGreen}
          strokeWidth={3}
          fillColor="rgba(70, 150, 47, 0.30)"
        />
      )}

      {points.length >= 2 && points.length < minPoints && (
        <Polyline
          coordinates={mapCoordinates}
          strokeColor={Palette.indiaGreen}
          strokeWidth={3}
          lineDashPattern={[8, 4]}
        />
      )}

      {points.map((point, index) => {
        const isFirst = index === 0;
        const coordinate = mapCoordinates[index];

        return (
          <Marker
            key={point.id ?? `corner-${index}`}
            coordinate={coordinate}
            anchor={Platform.OS === 'ios' ? { x: 0.5, y: 0.5 } : undefined}
            pinColor={Platform.OS === 'android' ? (isFirst ? Palette.saffron : Palette.indigo) : undefined}
            tracksViewChanges={Platform.OS === 'ios' ? false : undefined}
            zIndex={1}
            title={Platform.OS === 'android' ? `Point ${index + 1}` : undefined}
          >
            {Platform.OS === 'ios' ? (
              <View style={styles.markerWrap} collapsable={false}>
                <View
                  style={[styles.vertexMarker, isFirst && styles.vertexMarkerFirst]}
                  collapsable={false}
                >
                  <RNText style={styles.vertexLabel}>{index + 1}</RNText>
                </View>
              </View>
            ) : null}
          </Marker>
        );
      })}
    </MapView>
  );
}

export function LandMap(props: LandMapProps) {
  'use no memo';
  const [mapsModule, setMapsModule] = useState<MapsModule | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    import('react-native-maps')
      .then((mod) => {
        if (!cancelled) {
          setMapsModule(mod as MapsModule);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadFailed) {
    return (
      <View style={[styles.map, styles.fallback]}>
        <Text className="px-6 text-center text-[14px] leading-[21px] text-muted">
          {props.unavailableMessage}
        </Text>
      </View>
    );
  }

  if (!mapsModule) {
    return (
      <View style={[styles.map, styles.fallback]}>
        <ActivityIndicator size="large" color={Palette.indiaGreen} />
        <Text className="mt-3 text-[14px] text-muted">{props.loadingMessage}</Text>
      </View>
    );
  }

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
      <LandMapInner mapsModule={mapsModule} {...props} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F7',
    gap: 8,
  },
  markerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  vertexMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Palette.indigo,
    borderWidth: 2.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
      },
      android: { elevation: 5 },
    }),
  },
  vertexMarkerFirst: {
    backgroundColor: Palette.saffron,
  },
  vertexLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
});

export type { LatLng, MapType, Region };
