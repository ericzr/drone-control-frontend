import type { Ref } from 'vue';

import type {
  Bounds,
  DrawType,
  EventHandler,
  FeatureOptions,
  FlyOptions,
  Geometry,
  IMapAdapter,
  LayerConfig,
  MapEvent,
  MapOptions,
  MapType,
  MarkerOptions,
  PolygonOptions,
  PolylineOptions,
} from './types';

import { onBeforeUnmount, ref, shallowRef } from 'vue';

import {
  AMapAdapter,
  Mars3DAdapter,
  MockMapAdapter,
  TiandituAdapter,
} from './adapters';

const adapterRegistry: Record<string, new () => IMapAdapter> = {
  amap: AMapAdapter,
  mars3d: Mars3DAdapter,
  mock: MockMapAdapter,
  tianditu: TiandituAdapter,
};

/**
 * Register a custom adapter at runtime (e.g. Cesium, OpenLayers, MapBox).
 */
export function registerMapAdapter(
  type: string,
  ctor: new () => IMapAdapter,
): void {
  adapterRegistry[type] = ctor;
}

function resolveMapType(): MapType {
  const env =
    (typeof import.meta !== 'undefined' &&
      (import.meta as any).env?.VITE_MAP_TYPE) ||
    '';
  if (env && env in adapterRegistry) return env as MapType;
  return 'mock';
}

function getMapKey(type: MapType): string {
  const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const keyMap: Record<string, string> = {
    amap: env.VITE_AMAP_KEY ?? '',
    tianditu: env.VITE_TIANDITU_KEY ?? '',
    mars3d: env.VITE_MARS3D_TOKEN ?? '',
    cesium: env.VITE_CESIUM_TOKEN ?? '',
    mapbox: env.VITE_MAPBOX_TOKEN ?? '',
  };
  return keyMap[type] ?? '';
}

export interface UseMapReturn {
  adapter: Ref<IMapAdapter | null>;
  mapType: Ref<MapType>;
  ready: Ref<boolean>;
  initMap: (options?: MapOptions) => Promise<void>;
  destroyMap: () => void;
  switchMapType: (newType: MapType, preserveView?: boolean) => Promise<void>;
  flyTo: (lng: number, lat: number, opts?: FlyOptions) => Promise<void>;
  setCenter: (lng: number, lat: number, zoom?: number) => void;
  fitBounds: (bounds: Bounds) => void;
  addMarker: (options: MarkerOptions) => string;
  addPolyline: (options: PolylineOptions) => string;
  addPolygon: (options: PolygonOptions) => string;
  removeFeature: (featureId: string) => void;
  updateFeature: (featureId: string, props: Partial<FeatureOptions>) => void;
  addLayer: (layer: LayerConfig) => string;
  removeLayer: (layerId: string) => void;
  setLayerVisible: (layerId: string, visible: boolean) => void;
  enableDraw: (type: DrawType) => void;
  disableDraw: () => void;
  onDrawComplete: (callback: (geometry: Geometry) => void) => void;
  measureDistance: () => Promise<number>;
  measureArea: () => Promise<number>;
  on: (event: MapEvent, handler: EventHandler) => void;
  off: (event: MapEvent, handler?: EventHandler) => void;
}

/**
 * Composable that wraps IMapAdapter behind a reactive factory.
 *
 * @param containerRef - Ref to the DOM element where the map mounts.
 */
export function useMap(
  containerRef: Ref<HTMLElement | null>,
): UseMapReturn {
  const adapter = shallowRef<IMapAdapter | null>(null);
  const mapType = ref<MapType>(resolveMapType());
  const ready = ref(false);

  const initMap = async (options: MapOptions = {}) => {
    if (!containerRef.value) {
      console.warn('[useMap] Container ref is null, cannot init map');
      return;
    }

    if (adapter.value) {
      adapter.value.destroy();
    }

    const AdapterClass = adapterRegistry[mapType.value];
    if (!AdapterClass) {
      console.error(`[useMap] No adapter registered for type: ${mapType.value}`);
      return;
    }

    const instance = new AdapterClass();
    await instance.init(containerRef.value, {
      ...options,
      key: options.key ?? getMapKey(mapType.value),
    });
    adapter.value = instance;
    ready.value = true;
  };

  const destroyMap = () => {
    adapter.value?.destroy();
    adapter.value = null;
    ready.value = false;
  };

  const switchMapType = async (
    newType: MapType,
    preserveView = true,
  ) => {
    let center: [number, number] | undefined;
    let zoom: number | undefined;

    if (preserveView && adapter.value) {
      center = adapter.value.getCenter();
      zoom = adapter.value.getZoom();
    }

    destroyMap();
    mapType.value = newType;
    await initMap({ center, zoom });
  };

  // ── delegated methods ──

  const flyTo = async (lng: number, lat: number, opts?: FlyOptions) => {
    await adapter.value?.flyTo(lng, lat, opts);
  };

  const setCenter = (lng: number, lat: number, zoom?: number) => {
    adapter.value?.setCenter(lng, lat, zoom);
  };

  const fitBounds = (bounds: Bounds) => {
    adapter.value?.fitBounds(bounds);
  };

  const addMarker = (options: MarkerOptions) => {
    return adapter.value?.addMarker(options) ?? '';
  };

  const addPolyline = (options: PolylineOptions) => {
    return adapter.value?.addPolyline(options) ?? '';
  };

  const addPolygon = (options: PolygonOptions) => {
    return adapter.value?.addPolygon(options) ?? '';
  };

  const removeFeature = (featureId: string) => {
    adapter.value?.removeFeature(featureId);
  };

  const updateFeature = (featureId: string, props: Partial<FeatureOptions>) => {
    adapter.value?.updateFeature(featureId, props);
  };

  const addLayer = (layer: LayerConfig) => {
    return adapter.value?.addLayer(layer) ?? '';
  };

  const removeLayer = (layerId: string) => {
    adapter.value?.removeLayer(layerId);
  };

  const setLayerVisible = (layerId: string, visible: boolean) => {
    adapter.value?.setLayerVisible(layerId, visible);
  };

  const enableDraw = (type: DrawType) => {
    adapter.value?.enableDraw(type);
  };

  const disableDraw = () => {
    adapter.value?.disableDraw();
  };

  const onDrawComplete = (callback: (geometry: Geometry) => void) => {
    adapter.value?.onDrawComplete(callback);
  };

  const measureDistance = async () => {
    return (await adapter.value?.measureDistance()) ?? 0;
  };

  const measureArea = async () => {
    return (await adapter.value?.measureArea()) ?? 0;
  };

  const on = (event: MapEvent, handler: EventHandler) => {
    adapter.value?.on(event, handler);
  };

  const off = (event: MapEvent, handler?: EventHandler) => {
    adapter.value?.off(event, handler);
  };

  // auto-cleanup
  onBeforeUnmount(() => {
    destroyMap();
  });

  return {
    adapter,
    mapType,
    ready,
    initMap,
    destroyMap,
    switchMapType,
    flyTo,
    setCenter,
    fitBounds,
    addMarker,
    addPolyline,
    addPolygon,
    removeFeature,
    updateFeature,
    addLayer,
    removeLayer,
    setLayerVisible,
    enableDraw,
    disableDraw,
    onDrawComplete,
    measureDistance,
    measureArea,
    on,
    off,
  };
}
