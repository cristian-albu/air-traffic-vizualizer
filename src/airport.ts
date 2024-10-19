import AirObject, { Coordinates } from "./airObject";
import * as THREE from "three";
import { AIR_FLIGHT_START_RADIUS } from "./constants";

interface AirportProps {
  parent: THREE.Scene | THREE.Mesh;
  coordinates: Coordinates;
  name: string; // Include the airport name in props
}

export default class Airport extends AirObject {
  id: string;
  private name: string;
  private label: THREE.Sprite | null = null;

  constructor({ parent, coordinates, name }: AirportProps) {
    super({ modelPath: "/airport.glb", parent, coordinates, scale: 0.03 });

    this.id = crypto.randomUUID();
    this.name = name;

    this.createLabel();
  }

  private createLabel() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) return;

    const fontSize = 32;
    const textPadding = 4;
    context.font = `${fontSize}px Arial`;
    const textWidth = (context.measureText(this.name).width + textPadding) / 3;

    canvas.width = textWidth;
    canvas.height = fontSize + textPadding;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 255, 255, 0.7)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    context.fillText(this.name, textPadding / 2, fontSize);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture });
    this.label = new THREE.Sprite(material);

    const labelScale = 0.001;
    this.label.scale.set(labelScale * canvas.width, labelScale * canvas.height, 1);

    const position = this.getGlobeToCartesian(this.lat - 1, this.lon, AIR_FLIGHT_START_RADIUS * 0.97);
    this.label.position.set(position.x, position.y, position.z);

    this.parent.add(this.label);
  }

  public getId() {
    return this.id;
  }
}
