import * as THREE from "three";
import { GLOBE_RADIUS } from "./constants";

export default class Earth {
  earthMesh: THREE.Mesh;
  cloudsMesh: THREE.Mesh;
  scene: THREE.Scene;
  textureLoader: THREE.TextureLoader;
  cloudShadows: THREE.Mesh;
  atmosphere: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.textureLoader = new THREE.TextureLoader();

    const diffuseTexture = this.textureLoader.load("/8k_earth_daymap.jpg");
    const bumpTexture = this.textureLoader.load("/8k_earth_normal_map.jpg");
    const specularTexture = this.textureLoader.load("/8k_earth_specular_map.jpg");
    const cloudsTexture = this.textureLoader.load("/8k_earth_clouds.jpg");

    this.earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS, 50, 50),
      new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.05,
        metalness: 0.0,
        roughnessMap: specularTexture,
      })
    );
    this.earthMesh.rotation.x = THREE.MathUtils.degToRad(23.5);

    this.cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.01, 50, 50),
      new THREE.MeshStandardMaterial({
        map: cloudsTexture,
        alphaMap: cloudsTexture,
        alphaTest: 0.05,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        shadowSide: THREE.FrontSide,
      })
    );
    this.cloudsMesh.castShadow = true;

    this.cloudShadows = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.007, 50, 50),
      new THREE.ShadowMaterial({ opacity: 0.05 })
    );
    this.cloudShadows.receiveShadow = true;

    this.atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.15, 50, 50),
      new THREE.ShaderMaterial({
        vertexShader: `
            varying vec2 vertexUV;
            varying vec3 vertexNormal;

            void main() {
                vertexUV = uv;
                vertexNormal = normal;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vertexNormal;

            void main() {
                float intensity = pow(0.65 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                vec4 glowColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
                gl_FragColor = glowColor;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      })
    );

    this.cloudsMesh.add(this.cloudShadows);
    this.earthMesh.add(this.cloudsMesh);
    this.scene.add(this.atmosphere, this.earthMesh);
  }
}
