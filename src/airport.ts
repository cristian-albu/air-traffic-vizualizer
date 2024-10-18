import AirObject, { Coordinates } from "./airObject";
import * as THREE from "three";

interface AirportProps {
  parent: THREE.Scene | THREE.Mesh;
  coordinates: Coordinates;
}

export default class Airport extends AirObject {
  id: string;
  constructor({ parent, coordinates }: AirportProps) {
    super({ modelPath: "/airport.glb", parent, coordinates, scale: 0.03 });

    this.id = crypto.randomUUID();
  }

  public getId() {
    return this.id;
  }
}
