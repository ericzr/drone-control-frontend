/**
 * Mars3D (MarsGIS) adapter — 3D scene, tilted photography, localized first choice.
 *
 * Requires `mars3d` and `mars3d-cesium` packages plus `VITE_MARS3D_TOKEN`.
 * Coordinate system: WGS84/CGCS2000.  This is a skeleton.
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

export class Mars3DAdapter implements IMapAdapter {
  private map: any = null;
  private seq = 0;

  private nextId(p: string) {
    return `${p}_${++this.seq}`;
  }

  async init(_container: HTMLElement, _options: MapOptions): Promise<void> {
    // TODO: import mars3d and create Map instance
    // import * as mars3d from 'mars3d';
    // this.map = new mars3d.Map(container, { ... });
    console.warn('[Mars3DAdapter] SDK not loaded – using stub');
  }

  destroy(): void {
    this.map?.destroy?.();
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
