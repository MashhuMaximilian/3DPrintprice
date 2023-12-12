<template>
  <div ref="sceneContainer" class="scene-container"><!-- Scene content goes here --></div>

  <div ref="rendererContainer">

    <lighting-setup></lighting-setup>
  <model-loader></model-loader>
  </div>

  

</template>
  
  <script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import LightingSetup from './LightingSetup.vue'; // Adjust the path as per your project structure
import ModelLoader from './ModelLoader.vue';


  export default {
    name: 'SceneSetup',
    emits: ['sceneReady', 'sceneEvents'],

  
    props: {
      // Define any props that SceneSetup.vue might need from its parent component
    },
  
    data() {
      return {
        // Define the data properties that the extracted functions might rely on
      };
    },
    created() {
  this.$emit('lights-setup-complete', this.setupLights);
},
components: {
  LightingSetup,
    ModelLoader,
  },
  
    methods: {

      
initializeScene() {

this.$options.scene = new THREE.Scene();
// Add other scene initializations here
this.$emit('scene-ready', this.$options.scene);
console.log("Scene initialized");

if (this.$parent.$refs.lightingSetup) {
    this.$parent.$refs.lightingSetup.setupLights();
  } else {
    console.error("LightingSetup component not ready");
  }
  
this.setupRenderer();
this.setupCameraAndControls();
this.loadEnvironment();
this.loadFloor();
this.animate();
this.loadGLTFModel();
this.loadReferenceCube('/assets/1cm3cube.stl');
this.loadSkybox(this.currentSkybox); // Load the default skybox


this.$emit('scene-initialized', this.$options.scene); // Emit an event to signal that the scene is initialized

},

setupRenderer() {
  if (this.$refs.rendererContainer) {
const width = this.$refs.rendererContainer.clientWidth;
const height = this.$refs.rendererContainer.clientHeight;

this.$options.scene = new THREE.Scene();
this.$options.scene.background = new THREE.Color(0x111111);

this.$options.renderer = new THREE.WebGLRenderer({ antialias: true });
this.$options.renderer.setSize(width, height);
this.$options.renderer.setClearColor(0x111111);
this.$options.renderer.shadowMap.enabled = true;
this.$options.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
this.$refs.rendererContainer.appendChild(this.$options.renderer.domElement);
} else {
    console.error("rendererContainer ref is not available");
  }
},

setupCameraAndControls(center) {
const width = this.$refs.rendererContainer.clientWidth;
const height = this.$refs.rendererContainer.clientHeight;

this.$options.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

if (center) {
// Set the camera to look at the model
this.$options.camera.position.set(center.x, center.y , center.z + 70); // Increase Y and Z for more zoom-out
this.$options.camera.lookAt(center);
} else {
// Default position if center is not provided
this.$options.camera.position.set(70, 70, 70);
}

this.$options.controls = new OrbitControls(this.$options.camera, this.$options.renderer.domElement);
this.$options.controls.minDistance = 30; // Allow the camera to get closer
this.$options.controls.maxDistance = 150; // Allow the camera to move further away

if (center) {
this.$options.controls.target.set(center.x, center.y, center.z);
} else {
this.$options.controls.target.set(0, 0, 0);
}

this.$options.controls.update();
},

loadEnvironment() {
const pmremGenerator = new THREE.PMREMGenerator(this.$options.renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader()
.setDataType(THREE.FloatType)
.load(this.currentHDR, (texture) => {
const envMap = pmremGenerator.fromEquirectangular(texture).texture;

// Adjust the intensity here
envMap.encoding = THREE.sRGBEncoding; // Ensure correct encoding
this.$options.scene.environment = envMap;
this.$options.scene.environment.intensity = this.hdrIntensity; // Set intensity

texture.dispose();
pmremGenerator.dispose();


// Check if this.floorMesh is defined before accessing its properties
if (this.floorMesh) {
// Set the position and scale for the environment
this.floorMesh.position.set(0, -8.5, 0); // Horizontal position at y = -0.09
this.floorMesh.scale.set(20, 20, 20); // Scale to reach the origin minus 20 units
}
});
},
},
    mounted() {
      try {
        
         this.$nextTick(() => {
      if (this.$refs.rendererContainer) {
        const width = this.$refs.rendererContainer.clientWidth;
        const height = this.$refs.rendererContainer.clientHeight;
      
      // Assuming you have methods `setupRenderer` and `initializeScene` that use these values
      this.setupRenderer(width, height);
      this.initializeScene();
    } else {
      console.error("Renderer container not available yet");
    }
    
  }); } catch (error) {
    console.error("Error in mounted hook:", error);
  }
      this.initializeScene();
    this.setupRenderer();   

   }
  };
  </script>
  
  <style scoped>
    /* Styles specific to SceneSetup.vue (if any) would go here */
  </style>
  