import AirObject, { Coordinates } from "./airObject";
import * as THREE from "three";
import Airport from "./airport";
import { AIR_FLIGHT_RADIUS, GLOBE_RADIUS } from "./constants";

interface PlaneProps {
  parent: THREE.Scene | THREE.Mesh;
  coordinates: Coordinates;
}

type FlightCurve = { curve: THREE.CatmullRomCurve3; curveLine: THREE.Line | null };

export default class Plane extends AirObject {
  private flightProgress = 0;
  private flightSpeed = 0.002;
  private departure: Airport | null = null;
  private destination: Airport | null = null;
  private flightCurve: FlightCurve | null = null;
  private flightSchedule: Airport[] = [];
  private currentFlightIndex = 0;
  private trailPoints: THREE.Vector3[] = [];
  private maxTrailLength = 50;
  private trailLine: THREE.Line | null = null;

  constructor({ parent, coordinates }: PlaneProps) {
    super({ modelPath: "/plane.glb", parent, coordinates, scale: 0.01 });
    this.trailLine = this.createTrailLine();
    if (this.trailLine) {
      this.parent.add(this.trailLine);
    }
  }

  private createTrailLine(): THREE.Line | null {
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const geometry = new THREE.BufferGeometry().setFromPoints(this.trailPoints);
    return new THREE.Line(geometry, material);
  }

  private setDeparture(airport: Airport): void {
    this.departure = airport;
  }

  private setDestination(airport: Airport): void {
    this.destination = airport;
  }

  public setFlightProgress(newProgress: number): void {
    this.flightProgress = newProgress;
  }

  public setFlightSpeed(newSpeed: number): void {
    this.flightSpeed = newSpeed;
  }

  public setFlightCurve(curveObject: FlightCurve): void {
    this.flightCurve = curveObject;
  }

  public getFlightProgress(): number {
    return this.flightProgress;
  }

  public getFlightSpeed(): number {
    return this.flightSpeed;
  }

  public setFlightSchedule(airports: Airport[]): void {
    this.flightSchedule = airports;
  }

  public addToFlightSchedule(airport: Airport): void {
    this.flightSchedule.push(airport);
  }

  private incrementFlightIndex(): void {
    this.currentFlightIndex += 1;
  }

  private createFlightPath(): void {
    if (!this.departure || !this.destination) return;

    const currCoordinates = this.getAirportCoordinates(this.departure);
    const nextCoordinates = this.getAirportCoordinates(this.destination);
    const midpoint = this.calculateMidpoint(currCoordinates, nextCoordinates);

    const curve = new THREE.CatmullRomCurve3([currCoordinates, midpoint, nextCoordinates]);
    this.setFlightCurve({ curve, curveLine: this.trailLine });
  }

  private getAirportCoordinates(airport: Airport): THREE.Vector3 {
    return airport.position
      .clone()
      .normalize()
      .multiplyScalar(GLOBE_RADIUS * 1.01);
  }

  private calculateMidpoint(currCoordinates: THREE.Vector3, nextCoordinates: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3()
      .addVectors(currCoordinates, nextCoordinates)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(AIR_FLIGHT_RADIUS);
  }

  private setNextFlight(): void {
    if (this.currentFlightIndex < this.flightSchedule.length - 1) {
      this.setDeparture(this.flightSchedule[this.currentFlightIndex]);
      this.setDestination(this.flightSchedule[this.currentFlightIndex + 1]);
      this.setFlightProgress(0);
    }
  }

  private setInitialFlight(): void {
    if (!this.departure || !this.destination) {
      this.setDeparture(this.flightSchedule[0]);
      this.setDestination(this.flightSchedule[1]);
    }
  }

  public animateFlight(): void {
    if (this.flightSchedule.length === 0 || this.currentFlightIndex >= this.flightSchedule.length) return;

    this.setInitialFlight();

    if (!this.flightCurve) {
      this.createFlightPath();
    }

    if (!this.flightCurve) return;

    this.updateFlightProgress();
    const currPoint = this.flightCurve.curve.getPointAt(this.flightProgress);
    this.updatePlanePosition(currPoint);
    this.updateTrail(currPoint);
    this.updatePlaneOrientation();
  }

  private updateFlightProgress(): void {
    this.flightProgress += this.flightSpeed;

    if (this.flightProgress > 1) {
      this.incrementFlightIndex();
      this.setNextFlight();
      this.flightProgress = 0;
      this.createFlightPath();
    }
  }

  private updatePlanePosition(currPoint: THREE.Vector3): void {
    if (this.model) {
      this.model.position.set(currPoint.x, currPoint.y, currPoint.z);
    }
  }

  private updateTrail(currPoint: THREE.Vector3): void {
    this.trailPoints.push(new THREE.Vector3(currPoint.x, currPoint.y, currPoint.z));

    if (this.trailPoints.length > this.maxTrailLength) {
      this.trailPoints.shift();
    }

    const trailGeometry = new THREE.BufferGeometry().setFromPoints(this.trailPoints);
    if (this.trailLine) {
      this.trailLine.geometry.dispose();
      this.trailLine.geometry = trailGeometry;
    }
  }

  private updatePlaneOrientation(): void {
    const tangent = this.flightCurve?.curve.getTangentAt(this.flightProgress).normalize();
    if (!tangent || !this.model) return;

    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(tangent, worldUp).normalize();
    const up = new THREE.Vector3().crossVectors(right, tangent).normalize();

    const rotationMatrix = new THREE.Matrix4().set(
      right.x,
      up.x,
      -tangent.x,
      0,
      right.y,
      up.y,
      -tangent.y,
      0,
      right.z,
      up.z,
      -tangent.z,
      0,
      0,
      0,
      0,
      1
    );

    rotationMatrix.multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2));
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
    this.model.quaternion.copy(quaternion);
  }
}
