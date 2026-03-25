// Mock Three.js for unit tests
export class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  distanceTo(v: Vector3) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

export class Object3D {
  position = new Vector3();
  rotation = { x: 0, y: 0, z: 0 };
  scale = {
    x: 1,
    y: 1,
    z: 1,
    setScalar(s: number) {
      this.x = s;
      this.y = s;
      this.z = s;
    },
  };
  matrix = { elements: new Float32Array(16) };
  parent: Object3D | null = null;

  updateMatrix() {}
}

export class Mesh extends Object3D {
  material: unknown = null;
  geometry: unknown = null;

  setMatrixAt(_index: number, _matrix: unknown) {}
}

export class Group extends Object3D {}

export class InstancedMesh extends Mesh {
  instanceMatrix = { needsUpdate: false };

  setMatrixAt(_index: number, _matrix: unknown) {}
}

export class BufferGeometry {
  setFromPoints(_points: Vector3[]) {
    return this;
  }
  dispose() {}
}

export class SphereGeometry extends BufferGeometry {
  constructor(_radius?: number, _widthSegments?: number, _heightSegments?: number) {
    super();
  }
}

export class LineBasicMaterial {
  color: string;
  transparent: boolean;
  opacity: number;
  depthWrite: boolean;

  constructor(params: Record<string, unknown> = {}) {
    this.color = (params.color as string) ?? "#ffffff";
    this.transparent = (params.transparent as boolean) ?? false;
    this.opacity = (params.opacity as number) ?? 1;
    this.depthWrite = (params.depthWrite as boolean) ?? true;
  }
  dispose() {}
}

export class MeshBasicMaterial {
  color: string;
  transparent: boolean;
  opacity: number;
  depthWrite: boolean;
  blending: number;

  constructor(params: Record<string, unknown> = {}) {
    this.color = (params.color as string) ?? "#ffffff";
    this.transparent = (params.transparent as boolean) ?? false;
    this.opacity = (params.opacity as number) ?? 1;
    this.depthWrite = (params.depthWrite as boolean) ?? true;
    this.blending = (params.blending as number) ?? 0;
  }
  dispose() {}
}

export class Line extends Object3D {
  geometry: BufferGeometry;
  material: LineBasicMaterial;

  constructor(geo?: BufferGeometry, mat?: LineBasicMaterial) {
    super();
    this.geometry = geo ?? new BufferGeometry();
    this.material = mat ?? new LineBasicMaterial();
  }
}

export const AdditiveBlending = 2;
export const NormalBlending = 1;
