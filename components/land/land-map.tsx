import { useEffect, useRef, useState } from 'react';
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
  selectedIndex: number | null;
  onMapPress: (coordinate: LatLng) => void;
  onMarkerPress: (index: number) => void;
  onPointDrag: (index: number, coord: LatLng) => void;
  unavailableMessage: string;
  loadingMessage: string;
};

function LandMapInner({
  mapsModule,
  mapRef,
  mapType,
  initialRegion,
  points,
  minPoints,
  selectedIndex,
  onMapPress,
  onMarkerPress,
  onPointDrag,
}: Omit<LandMapProps, 'unavailableMessage' | 'loadingMessage'> & {
  mapsModule: MapsModule;
}) {
  const MapView = mapsModule.default;
  const { Marker, Polygon, Polyline } = mapsModule;
  const markerTouchedRef = useRef(false);

  function handleMapPress(coordinate: LatLng) {
    if (markerTouchedRef.current) {
      markerTouchedRef.current = false;
      return;
    }
    onMapPress(coordinate);
  }

  function handleMarkerPress(index: number) {
    markerTouchedRef.current = true;
    onMarkerPress(index);
  }

  function handleDrag(index: number, coordinate: LatLng) {
    onPointDrag(index, coordinate);
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      mapType={mapType}
      initialRegion={initialRegion}
      onPress={(e) => handleMapPress(e.nativeEvent.coordinate)}
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      moveOnMarkerPress={false}
    >
      {points.length >= minPoints && (
        <Polygon
          coordinates={points}
          strokeColor={Palette.indiaGreen}
          strokeWidth={3}
          fillColor="rgba(70, 150, 47, 0.30)"
        />
      )}

      {points.length >= 2 && points.length < minPoints && (
        <Polyline
          coordinates={points}
          strokeColor={Palette.indiaGreen}
          strokeWidth={3}
          lineDashPattern={[8, 4]}
        />
      )}

      {points.map((point, index) => {
        const selected = selectedIndex === index;
        const isFirst = index === 0;

        return (
          <Marker
            key={point.id ?? `corner-${index}`}
            coordinate={point}
            anchor={{ x: 0.5, y: 0.5 }}
            draggable
            onPress={() => handleMarkerPress(index)}
            onDrag={(e) => handleDrag(index, e.nativeEvent.coordinate)}
            onDragEnd={(e) => handleDrag(index, e.nativeEvent.coordinate)}
            tracksViewChanges={selected}
            zIndex={selected ? 10 : 1}
          >
            <View style={styles.markerWrap}>
              {selected ? <View style={styles.markerSelectedRing} /> : null}
              <View
                style={[
                  styles.vertexMarker,
                  isFirst && styles.vertexMarkerFirst,
                  selected && styles.vertexMarkerSelected,
                ]}
              >
                <RNText style={styles.vertexLabel}>{index + 1}</RNText>
              </View>
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

export function LandMap(props: LandMapProps) {
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
  markerSelectedRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Palette.indiaGreen,
    backgroundColor: 'rgba(70, 150, 47, 0.15)',
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
  vertexMarkerSelected: {
    transform: [{ scale: 1.12 }],
    borderColor: Palette.indiaGreen,
    borderWidth: 3,
  },
  vertexLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
});

export type { LatLng, MapType, Region };
