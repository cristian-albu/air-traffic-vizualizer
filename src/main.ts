import Plane from "./plane";
import Airport from "./airport";
import "./style.css";
import World from "./world";
import { GLOBE_RADIUS } from "./constants";

const world = new World();

const airport = new Airport({ coordinates: { lat: 33, lon: 33, radius: GLOBE_RADIUS }, parent: world.earth.earthMesh });
const airport2 = new Airport({ coordinates: { lat: 80, lon: 80, radius: GLOBE_RADIUS }, parent: world.earth.earthMesh });

const plane = new Plane({ coordinates: { lat: 55, lon: -55, radius: GLOBE_RADIUS }, parent: world.earth.earthMesh });

plane.setFlightSchedule([airport, airport2, airport, airport2, airport, airport2]);
world.attachToAnimation(() => plane.animateFlight());

world.animate();
