import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Earth from "./earth";

export default class World {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  sun: THREE.DirectionalLight;
  earth: Earth;
  animationActions: Array<(t?: number) => void> = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.TextureLoader().load("/space.jpg");
    this.scene.backgroundIntensity = 0.03;
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.sun = new THREE.DirectionalLight(0xffffff, 1.5);
    this.sun.position.set(20, 20, 20);
    this.sun.target.position.set(0, 0, 0);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 4096;
    this.sun.shadow.mapSize.height = 4096;
    this.sun.shadow.camera.near = 0.1;
    this.sun.shadow.camera.far = 50;

    this.scene.add(this.sun);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.earth = new Earth(this.scene);
  }

  public attachToAnimation(fn: (t?: number) => void) {
    this.animationActions.push(fn);
  }

  public animate = () => {
    requestAnimationFrame(this.animate);

    this.animationActions.forEach((fn) => fn());

    this.earth.earthMesh.rotation.y += 0.0001;
    this.earth.cloudsMesh.rotation.y += 0.0001;
    this.earth.cloudsMesh.rotation.x += 0.00005;
    this.earth.atmosphere.lookAt(this.camera.position);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
