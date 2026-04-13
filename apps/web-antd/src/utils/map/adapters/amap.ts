/**
 * AMap (Gaode) adapter — SaaS default.
 *
 * Requires `@amap/amap-jsapi-loader` and a valid key configured via
 * `VITE_AMAP_KEY`. This file is a skeleton that mirrors the IMapAdapter
 * contract; concrete SDK calls are stubbed until the dependency is added.
 */
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
  MarkerOptions,
  PolygonOptions,
  PolylineOptions,
} from '../types';

export class AMapAdapter implements IMapAdapter {
  private map: any = null;
  private seq = 0;
  private features = new Map<string, any>();

  private nextId(prefix: string) {
    return `${prefix}_${++this.seq}`;
  }

  async init(container: HTMLElement, options: MapOptions): Promise<void> {
    // TODO: load AMap SDK via @amap/amap-jsapi-loader
    // const AMapLoader = (await import('@amap/amap-jsapi-loader')).default;
    // const AMap = await AMapLoader.load({ key: options.key, version: '2.0' });
    // this.map = new AMap.Map(container, {
    //   center: options.center,
    //   zoom: options.zoom ?? 12,
    // });
    console.warn('[AMapAdapter] SDK not loaded – using stub');
  }

  destroy(): void {
    this.map?.destroy?.();
    this.map = null;
    this.features.clear();
  }

  getCenter(): [number, number] | undefined {
    const c = this.map?.getCenter?.();
    return c ? [c.lng ?? c.getLng(), c.lat ?? c.getLat()] : undefined;
  }

  getZoom(): number | undefined {
    return this.map?.getZoom?.();
  }

  setCenter(lng: number, lat: number, zoom?: number): void {
    this.map?.setCenter?.([lng, lat]);
    if (zoom !== undefined) this.map?.setZoom?.(zoom);
  }

  async flyTo(lng: number, lat: number, options?: FlyOptions): Promise<void> {
    this.map?.panTo?.([lng, lat]);
    if (options?.zoom) this.map?.setZoom?.(options.zoom);
  }

  fitBounds(bounds: Bounds): void {
    this.map?.setBounds?.([bounds.southwest, bounds.northeast]);
  }

  addLayer(_layer: LayerConfig): string {
    return this.nextId('layer');
  }

  removeLayer(_layerId: string): void {}

  setLayerVisible(_layerId: string, _visible: boolean): void {}

  addMarker(options: MarkerOptions): string {
    const id = options.id ?? this.nextId('marker');
    // const marker = new AMap.Marker({ position: options.position, ... });
    // this.map?.add(marker);
    // this.features.set(id, marker);
    return id;
  }

  addPolyline(options: PolylineOptions): string {
    const id = options.id ?? this.nextId('polyline');
    return id;
  }

  addPolygon(options: PolygonOptions): string {
    const id = options.id ?? this.nextId('polygon');
    return id;
  }

  removeFeature(featureId: string): void {
    const f = this.features.get(featureId);
    if (f) {
      this.map?.remove?.(f);
      this.features.delete(featureId);
    }
  }

  updateFeature(_featureId: string, _props: Partial<FeatureOptions>): void {}

  enableDraw(_type: DrawType): void {}
  disableDraw(): void {}
  onDrawComplete(_callback: (geometry: Geometry) => void): void {}

  async measureDistance(): Promise<number> {
    return 0;
  }

  async measureArea(): Promise<number> {
    return 0;
  }

  /**
   * GCJ-02 → WGS84 approximate offset correction.
   */
  toWGS84(lng: number, lat: number): [number, number] {
    return gcj02ToWgs84(lng, lat);
  }

  fromWGS84(lng: number, lat: number): [number, number] {
    return wgs84ToGcj02(lng, lat);
  }

  on(event: MapEvent, handler: EventHandler): void {
    this.map?.on?.(event, handler);
  }

  off(event: MapEvent, handler?: EventHandler): void {
    this.map?.off?.(event, handler);
  }
}

// ── GCJ-02 / WGS-84 conversion helpers ──

const PI = Math.PI;
const A = 6_378_245;
const EE = 0.006_693_421_62;

function outOfChina(lng: number, lat: number) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(x: number, y: number) {
  let ret =
    -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2) / 3;
  ret += ((20 * Math.sin(y * PI) + 40 * Math.sin((y / 3) * PI)) * 2) / 3;
  ret += ((160 * Math.sin((y / 12) * PI) + 320 * Math.sin((y * PI) / 30)) * 2) / 3;
  return ret;
}

function transformLng(x: number, y: number) {
  let ret =
    300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2) / 3;
  ret += ((20 * Math.sin(x * PI) + 40 * Math.sin((x / 3) * PI)) * 2) / 3;
  ret += ((150 * Math.sin((x / 12) * PI) + 300 * Math.sin((x / 30) * PI)) * 2) / 3;
  return ret;
}

function delta(lng: number, lat: number): [number, number] {
  let dLat = transformLat(lng - 105, lat - 35);
  let dLng = transformLng(lng - 105, lat - 35);
  const radLat = (lat / 180) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return [dLng, dLat];
}

function wgs84ToGcj02(lng: number, lat: number): [number, number] {
  if (outOfChina(lng, lat)) return [lng, lat];
  const [dLng, dLat] = delta(lng, lat);
  return [lng + dLng, lat + dLat];
}

function gcj02ToWgs84(lng: number, lat: number): [number, number] {
  if (outOfChina(lng, lat)) return [lng, lat];
  const [dLng, dLat] = delta(lng, lat);
  return [lng - dLng, lat - dLat];
}
