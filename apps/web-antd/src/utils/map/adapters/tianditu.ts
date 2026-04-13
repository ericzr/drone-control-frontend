/**
 * Tianditu (天地图) adapter — government compliance default.
 *
 * Requires `VITE_TIANDITU_KEY`. Coordinate system: CGCS2000 ≈ WGS84 for
 * most practical purposes.  This is a skeleton for future integration.
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

export class TiandituAdapter implements IMapAdapter {
  private map: any = null;
  private seq = 0;

  private nextId(p: string) {
    return `${p}_${++this.seq}`;
  }

  async init(_container: HTMLElement, _options: MapOptions): Promise<void> {
    // TODO: inject <script src="http://api.tianditu.gov.cn/api?v=4.0&tk=KEY">
    console.warn('[TiandituAdapter] SDK not loaded – using stub');
  }

  destroy(): void {
    this.map = null;
  }

  getCenter(): [number, number] | undefined {
    return undefined;
  }
  getZoom(): number | undefined {
    return undefined;
  }
  setCenter(_lng: number, _lat: number, _zoom?: number): void {}
  async flyTo(_lng: number, _lat: number, _opts?: FlyOptions): Promise<void> {}
  fitBounds(_bounds: Bounds): void {}

  addLayer(_l: LayerConfig): string {
    return this.nextId('layer');
  }
  removeLayer(_id: string): void {}
  setLayerVisible(_id: string, _v: boolean): void {}

  addMarker(o: MarkerOptions): string {
    return o.id ?? this.nextId('marker');
  }
  addPolyline(o: PolylineOptions): string {
    return o.id ?? this.nextId('polyline');
  }
  addPolygon(o: PolygonOptions): string {
    return o.id ?? this.nextId('polygon');
  }
  removeFeature(_id: string): void {}
  updateFeature(_id: string, _p: Partial<FeatureOptions>): void {}

  enableDraw(_t: DrawType): void {}
  disableDraw(): void {}
  onDrawComplete(_cb: (g: Geometry) => void): void {}

  async measureDistance(): Promise<number> {
    return 0;
  }
  async measureArea(): Promise<number> {
    return 0;
  }

  toWGS84(lng: number, lat: number): [number, number] {
    return [lng, lat];
  }
  fromWGS84(lng: number, lat: number): [number, number] {
    return [lng, lat];
  }

  on(_e: MapEvent, _h: EventHandler): void {}
  off(_e: MapEvent, _h?: EventHandler): void {}
}
