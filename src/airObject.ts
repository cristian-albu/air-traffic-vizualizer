import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export type Coordinates = { lat: number; lon: number; radius: number } | THREE.Vector3;

interface AirObjectProps {
  modelPath: string;
  parent: THREE.Scene | THREE.Mesh;
  coordinates: Coordinates;
  scale?: number;
}

export default abstract class AirObject {
  loader: GLTFLoader;
  parent: THREE.Scene | THREE.Mesh;
  model: THREE.Group<THREE.Object3DEventMap> | null = null;
  lat: number;
  lon: number;
  position: THREE.Vector3;

  constructor({ modelPath, parent, coordinates, scale }: AirObjectProps) {
    this.loader = new GLTFLoader();
    this.parent = parent;

    if (coordinates instanceof THREE.Vector3) {
      const { lat, lon } = this.getCartesianToGlobe(coordinates);
      this.lat = lat;
      this.lon = lon;
      this.position = coordinates;
    } else {
      this.lat = coordinates.lat;
      this.lon = coordinates.lon;
      this.position = this.getGlobeToCartesian(coordinates.lat, coordinates.lon, coordinates.radius);
    }

    this.loader.load(
      modelPath,
      (gltf) => {
        this.model = gltf.scene;
        if (scale) {
          gltf.scene.scale.set(scale, scale, scale);
        }
        gltf.scene.position.copy(this.position);
        gltf.scene.quaternion.copy(this.getQuarterion(this.position));

        parent.add(gltf.scene);
      },
      undefined,
      (error) => {
        console.log(error);
      }
    );
  }

  /** Method to convert Globe coordinates (lat, lon, radius) to Cartesian (x, y, z) */
  public getGlobeToCartesian(lat: number, lon: number, radius: number) {
    // Convert latitude and longitude from degrees to radians
    const theta = (90 - lat) * (Math.PI / 180);
    const phi = lon * (Math.PI / 180);

    const x = radius * Math.cos(theta) * Math.cos(phi);
    const y = radius * Math.cos(theta) * Math.sin(phi);
    const z = radius * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  }

  /** Method to convert Cartesian (x, y, z) to  Globe coordinates (lat, lon, radius) */
  public getCartesianToGlobe(vec: THREE.Vector3) {
    const { x, y, z } = vec;
    const r = Math.sqrt(x * x + y * y + z * z);

    // Calculate latitude (in radians), then convert to degrees
    const lat = Math.asin(z / r) * (180 / Math.PI);

    // Calculate longitude (in radians), then convert to degrees
    const lon = Math.atan2(y, x) * (180 / Math.PI);

    return {
      lat,
      lon,
    };
  }

  /** A quaternion is computed to rotate the station to align its local "up" axis with the normal vector. The more you know. */
  public getQuarterion(vec: THREE.Vector3) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec.normalize());

    return quaternion;
  }
}
