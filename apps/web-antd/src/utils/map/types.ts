export type MapType =
  | 'amap'
  | 'cesium'
  | 'mapbox'
  | 'mars3d'
  | 'mock'
  | 'openlayers'
  | 'tianditu';

export type DrawType = 'circle' | 'marker' | 'polygon' | 'polyline' | 'rectangle';

export type MapEvent =
  | 'click'
  | 'dblclick'
  | 'dragend'
  | 'dragstart'
  | 'moveend'
  | 'movestart'
  | 'zoomend';

export type EventHandler = (...args: any[]) => void;

export interface MapOptions {
  center?: [number, number];
  key?: string;
  maxZoom?: number;
  minZoom?: number;
  zoom?: number;
  [key: string]: any;
}

export interface FlyOptions {
  duration?: number;
  zoom?: number;
}

export interface Bounds {
  northeast: [number, number];
  southwest: [number, number];
}

export interface MarkerOptions {
  anchor?: [number, number];
  draggable?: boolean;
  icon?: string;
  id?: string;
  label?: string;
  position: [number, number];
  [key: string]: any;
}

export interface PolylineOptions {
  color?: string;
  id?: string;
  opacity?: number;
  path: Array<[number, number]>;
  width?: number;
}

export interface PolygonOptions {
  fillColor?: string;
  fillOpacity?: number;
  id?: string;
  path: Array<[number, number]>;
  strokeColor?: string;
  strokeWidth?: number;
}

export type FeatureOptions = MarkerOptions | PolygonOptions | PolylineOptions;

export interface LayerConfig {
  id?: string;
  opacity?: number;
  type: 'custom' | 'heatmap' | 'satellite' | 'tile' | 'traffic';
  url?: string;
  visible?: boolean;
  [key: string]: any;
}

export interface Geometry {
  coordinates: any;
  type: 'Circle' | 'LineString' | 'Point' | 'Polygon' | 'Rectangle';
}

export interface IMapAdapter {
  init(container: HTMLElement, options: MapOptions): Promise<void>;
  destroy(): void;

  getCenter(): [number, number] | undefined;
  getZoom(): number | undefined;
  setCenter(lng: number, lat: number, zoom?: number): void;
  flyTo(lng: number, lat: number, options?: FlyOptions): Promise<void>;
  fitBounds(bounds: Bounds): void;

  addLayer(layer: LayerConfig): string;
  removeLayer(layerId: string): void;
  setLayerVisible(layerId: string, visible: boolean): void;

  addMarker(options: MarkerOptions): string;
  addPolyline(options: PolylineOptions): string;
  addPolygon(options: PolygonOptions): string;
  removeFeature(featureId: string): void;
  updateFeature(featureId: string, props: Partial<FeatureOptions>): void;

  enableDraw(type: DrawType): void;
  disableDraw(): void;
  onDrawComplete(callback: (geometry: Geometry) => void): void;

  measureDistance(): Promise<number>;
  measureArea(): Promise<number>;

  toWGS84(lng: number, lat: number): [number, number];
  fromWGS84(lng: number, lat: number): [number, number];

  on(event: MapEvent, handler: EventHandler): void;
  off(event: MapEvent, handler?: EventHandler): void;
}
