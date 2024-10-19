import Plane from "./plane";
import Airport from "./airport";
import "./style.css";
import World from "./world";
import { GLOBE_RADIUS } from "./constants";

const world = new World();

type AirportData = {
  lat: number;
  lon: number;
  name: string;
  city: string;
  country: string;
};

const airportsData: AirportData[] = await fetch("/airports.json")
  .then((res) => {
    if (res.ok) {
      return res.json();
    }
  })
  .catch((err) => console.log(err));

const airports = airportsData.map(
  ({ name, lat, lon }) =>
    new Airport({ coordinates: { lat, lon, radius: GLOBE_RADIUS }, parent: world.earth.earthMesh, name })
);

const plane = new Plane({ coordinates: { lat: 55, lon: -55, radius: GLOBE_RADIUS }, parent: world.earth.earthMesh });

plane.setFlightSchedule(airports);
world.attachToAnimation(() => plane.animateFlight());

world.animate();
