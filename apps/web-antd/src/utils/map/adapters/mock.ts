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

interface StoredFeature {
  id: string;
  options: FeatureOptions;
  type: 'marker' | 'polygon' | 'polyline';
}

/**
 * Canvas-based mock map for development when no real map SDK is available.
 * Renders a simple grid, markers, polylines, and polygons.
 */
export class MockMapAdapter implements IMapAdapter {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private container: HTMLElement | null = null;
  private center: [number, number] = [108.94, 34.26];
  private zoom = 12;
  private features = new Map<string, StoredFeature>();
  private layers = new Map<string, LayerConfig & { id: string }>();
  private listeners = new Map<MapEvent, Set<EventHandler>>();
  private drawMode: DrawType | null = null;
  private drawCallback: ((geometry: Geometry) => void) | null = null;
  private seq = 0;
  private animFrame = 0;
  private resizeObserver: ResizeObserver | null = null;

  private nextId(prefix: string) {
    return `${prefix}_${++this.seq}`;
  }

  async init(container: HTMLElement, options: MapOptions = {}): Promise<void> {
    this.container = container;
    this.center = options.center ?? [108.94, 34.26];
    this.zoom = options.zoom ?? 12;

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();

    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObserver.observe(container);

    this.bindCanvasEvents();
    this.render();
  }

  destroy(): void {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.resizeObserver?.disconnect();
    if (this.canvas && this.container?.contains(this.canvas)) {
      this.container.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
    this.container = null;
    this.features.clear();
    this.layers.clear();
    this.listeners.clear();
  }

  getCenter(): [number, number] {
    return [...this.center];
  }

  getZoom(): number {
    return this.zoom;
  }

  setCenter(lng: number, lat: number, zoom?: number): void {
    this.center = [lng, lat];
    if (zoom !== undefined) this.zoom = zoom;
    this.render();
  }

  async flyTo(lng: number, lat: number, options?: FlyOptions): Promise<void> {
    const steps = 30;
    const duration = options?.duration ?? 1000;
    const [startLng, startLat] = this.center;
    const startZoom = this.zoom;
    const endZoom = options?.zoom ?? this.zoom;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = t * (2 - t);
      this.center = [
        startLng + (lng - startLng) * ease,
        startLat + (lat - startLat) * ease,
      ];
      this.zoom = startZoom + (endZoom - startZoom) * ease;
      this.render();
      await this.sleep(duration / steps);
    }
    this.emit('moveend');
  }

  fitBounds(bounds: Bounds): void {
    const lng = (bounds.southwest[0] + bounds.northeast[0]) / 2;
    const lat = (bounds.southwest[1] + bounds.northeast[1]) / 2;
    this.center = [lng, lat];
    this.render();
  }

  addLayer(layer: LayerConfig): string {
    const id = layer.id ?? this.nextId('layer');
    this.layers.set(id, { ...layer, id, visible: layer.visible !== false });
    this.render();
    return id;
  }

  removeLayer(layerId: string): void {
    this.layers.delete(layerId);
    this.render();
  }

  setLayerVisible(layerId: string, visible: boolean): void {
    const l = this.layers.get(layerId);
    if (l) {
      l.visible = visible;
      this.render();
    }
  }

  addMarker(options: MarkerOptions): string {
    const id = options.id ?? this.nextId('marker');
    this.features.set(id, { id, type: 'marker', options });
    this.render();
    return id;
  }

  addPolyline(options: PolylineOptions): string {
    const id = options.id ?? this.nextId('polyline');
    this.features.set(id, { id, type: 'polyline', options });
    this.render();
    return id;
  }

  addPolygon(options: PolygonOptions): string {
    const id = options.id ?? this.nextId('polygon');
    this.features.set(id, { id, type: 'polygon', options });
    this.render();
    return id;
  }

  removeFeature(featureId: string): void {
    this.features.delete(featureId);
    this.render();
  }

  updateFeature(featureId: string, props: Partial<FeatureOptions>): void {
    const f = this.features.get(featureId);
    if (f) {
      f.options = { ...f.options, ...props } as FeatureOptions;
      this.render();
    }
  }

  enableDraw(type: DrawType): void {
    this.drawMode = type;
    if (this.canvas) this.canvas.style.cursor = 'crosshair';
  }

  disableDraw(): void {
    this.drawMode = null;
    if (this.canvas) this.canvas.style.cursor = '';
  }

  onDrawComplete(callback: (geometry: Geometry) => void): void {
    this.drawCallback = callback;
  }

  async measureDistance(): Promise<number> {
    return 1250.5;
  }

  async measureArea(): Promise<number> {
    return 35200.8;
  }

  toWGS84(lng: number, lat: number): [number, number] {
    return [lng, lat];
  }

  fromWGS84(lng: number, lat: number): [number, number] {
    return [lng, lat];
  }

  on(event: MapEvent, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: MapEvent, handler?: EventHandler): void {
    if (!handler) {
      this.listeners.delete(event);
    } else {
      this.listeners.get(event)?.delete(handler);
    }
  }

  // ── internal ──

  private emit(event: MapEvent, ...args: any[]) {
    this.listeners.get(event)?.forEach((h) => h(...args));
  }

  private resizeCanvas() {
    if (!this.canvas || !this.container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx?.scale(dpr, dpr);
    this.render();
  }

  private lngLatToPixel(lng: number, lat: number): [number, number] {
    if (!this.canvas) return [0, 0];
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    const scale = Math.pow(2, this.zoom - 10) * 80;
    const x = w / 2 + (lng - this.center[0]) * scale;
    const y = h / 2 - (lat - this.center[1]) * scale;
    return [x, y];
  }

  private render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#e8f4f8');
    grad.addColorStop(0.5, '#d4ecf7');
    grad.addColorStop(1, '#c5e1f5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // grid
    this.drawGrid(ctx, w, h);

    // layers label
    const visibleLayers = [...this.layers.values()].filter((l) => l.visible);
    if (visibleLayers.length > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.font = '11px sans-serif';
      ctx.fillText(
        `图层: ${visibleLayers.map((l) => l.type).join(', ')}`,
        8,
        h - 8,
      );
    }

    // features
    for (const f of this.features.values()) {
      switch (f.type) {
        case 'marker':
          this.drawMarker(ctx, f.options as MarkerOptions);
          break;
        case 'polyline':
          this.drawPolyline(ctx, f.options as PolylineOptions);
          break;
        case 'polygon':
          this.drawPolygon(ctx, f.options as PolygonOptions);
          break;
      }
    }

    // HUD
    this.drawHUD(ctx, w, h);

    ctx.restore();
  }

  private drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const spacing = 40;
    ctx.strokeStyle = 'rgba(100,160,200,0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  private drawMarker(ctx: CanvasRenderingContext2D, opts: MarkerOptions) {
    const [x, y] = this.lngLatToPixel(opts.position[0], opts.position[1]);
    const r = 8;
    // pin
    ctx.beginPath();
    ctx.arc(x, y - r - 4, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1677ff';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    // inner dot
    ctx.beginPath();
    ctx.arc(x, y - r - 4, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    // pin tail
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 6);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 4, y - 6);
    ctx.fillStyle = '#1677ff';
    ctx.fill();
    // label
    if (opts.label) {
      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.label, x, y - r * 2 - 8);
      ctx.textAlign = 'start';
    }
  }

  private drawPolyline(ctx: CanvasRenderingContext2D, opts: PolylineOptions) {
    if (opts.path.length < 2) return;
    ctx.beginPath();
    const [sx, sy] = this.lngLatToPixel(opts.path[0]![0], opts.path[0]![1]);
    ctx.moveTo(sx, sy);
    for (let i = 1; i < opts.path.length; i++) {
      const [px, py] = this.lngLatToPixel(opts.path[i]![0], opts.path[i]![1]);
      ctx.lineTo(px, py);
    }
    ctx.strokeStyle = opts.color ?? '#1677ff';
    ctx.lineWidth = opts.width ?? 3;
    ctx.globalAlpha = opts.opacity ?? 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  private drawPolygon(ctx: CanvasRenderingContext2D, opts: PolygonOptions) {
    if (opts.path.length < 3) return;
    ctx.beginPath();
    const [sx, sy] = this.lngLatToPixel(opts.path[0]![0], opts.path[0]![1]);
    ctx.moveTo(sx, sy);
    for (let i = 1; i < opts.path.length; i++) {
      const [px, py] = this.lngLatToPixel(opts.path[i]![0], opts.path[i]![1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = opts.fillColor ?? 'rgba(22,119,255,0.2)';
    ctx.globalAlpha = opts.fillOpacity ?? 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = opts.strokeColor ?? '#1677ff';
    ctx.lineWidth = opts.strokeWidth ?? 2;
    ctx.stroke();
  }

  private drawHUD(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // top-left badge
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    this.roundRect(ctx, 8, 8, 160, 28, 4);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`Mock Map · Z${this.zoom}`, 16, 27);

    // center coords
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    const coordText = `${this.center[0].toFixed(4)}, ${this.center[1].toFixed(4)}`;
    const tm = ctx.measureText(coordText);
    const cw = tm.width + 20;
    this.roundRect(ctx, w / 2 - cw / 2, h - 32, cw, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(coordText, w / 2, h - 16);
    ctx.textAlign = 'start';

    // feature count
    if (this.features.size > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      this.roundRect(ctx, w - 100, 8, 92, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '11px sans-serif';
      ctx.fillText(`要素: ${this.features.size}`, w - 92, 24);
    }

    // draw mode indicator
    if (this.drawMode) {
      ctx.fillStyle = 'rgba(255,77,79,0.8)';
      const label = `绘制: ${this.drawMode}`;
      const dtm = ctx.measureText(label);
      this.roundRect(ctx, 8, 42, dtm.width + 20, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(label, 18, 58);
    }
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private bindCanvasEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas!.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      const scale = Math.pow(2, this.zoom - 10) * 80;
      const lng = this.center[0] + (px - w / 2) / scale;
      const lat = this.center[1] - (py - h / 2) / scale;

      if (this.drawMode && this.drawCallback) {
        this.drawCallback({
          type: 'Point',
          coordinates: [lng, lat],
        });
      }

      this.emit('click', { lnglat: [lng, lat], pixel: [px, py] });
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.5 : 0.5;
      this.zoom = Math.max(3, Math.min(20, this.zoom + delta));
      this.render();
      this.emit('zoomend', { zoom: this.zoom });
    });

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    this.canvas.addEventListener('mousedown', (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      this.emit('dragstart');
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const scale = Math.pow(2, this.zoom - 10) * 80;
      this.center[0] -= dx / scale;
      this.center[1] += dy / scale;
      this.render();
    });

    window.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false;
        this.emit('dragend');
        this.emit('moveend');
      }
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
