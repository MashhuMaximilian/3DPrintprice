  

<template>
    <div><!-- This is a necessary root element for Vue --></div>
  </template>
  
  <script>
  import * as THREE from 'three';

  export default {
    name: 'LightingSetup',
  
    props: {
    scene: Object, // The scene object is passed as a prop
  },
  
    data() {
      return {
        // Define the data properties that the extracted functions might rely on
      };
    },
  
    methods: {
    setupLights() {
      if (!this.scene) {
        console.error("Scene not initialized in LightingSetup");
        return;
      }
  // Ambient light to provide overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 4); // Adjust intensity here
  this.$options.scene.add(ambientLight);

  // Key light (main light source)
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0); // Adjust intensity here
  keyLight.position.set(-50, 50, 50); // Adjust position
  this.$options.scene.add(keyLight);

  // Fill light (soft, less intense light to fill in shadows)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5); // Adjust intensity here
  fillLight.position.set(50, 50, -50); // Adjust position
  this.$options.scene.add(fillLight);

  // Background light (illuminates the background or backdrop)
  const backgroundLight = new THREE.DirectionalLight(0xffffff, 5); // Adjust intensity here
  backgroundLight.position.set(0, 0, -100); // Adjust position
  this.$options.scene.add(backgroundLight);

  // Rim light (creates a subtle highlight on the subject's edges)
  const rimLight = new THREE.SpotLight(0xffffff, 1.0, 0, Math.PI / 6, 1); // Adjust intensity here
  rimLight.position.set(0, 0, 50); // Adjust position
  this.$options.scene.add(rimLight);

  // Optionally, you can configure shadow maps for specific lights
  keyLight.castShadow = true;
  fillLight.castShadow = true;
  rimLight.castShadow = true;

  // Set up shadow parameters (you may need to adjust these)
  const shadowMapSize = 1024;
  keyLight.shadow.mapSize.width = shadowMapSize;
  keyLight.shadow.mapSize.height = shadowMapSize;
  fillLight.shadow.mapSize.width = shadowMapSize;
  fillLight.shadow.mapSize.height = shadowMapSize;
  rimLight.shadow.mapSize.width = shadowMapSize;
  rimLight.shadow.mapSize.height = shadowMapSize;

  this.$emit('update-lights', this.setupLights); 
    },
   
      updateHDR(newHDR) {
  console.log('Updating HDR with:', newHDR);
  this.currentHDR = `/assets/hdrs/${newHDR}`;
  this.loadEnvironment(); // Load the new HDR environment
      this.$emit('hdr-updated', { newHDR });
    },
    
    updateHDRIntensity(newIntensity) {
  this.hdrIntensity = newIntensity;
  if (this.$options.scene && this.$options.scene.environment) {
    this.$options.scene.environment.intensity = newIntensity;
    this.$emit('hdr-intensity-updated', { newIntensity });
  }
},
  mounted() {
    // Example: Setup the lights when the component mounts
    this.setupLights();
    this.$emit('lights-setup-complete');
  }
},
  
    mounted() {
      this.setupLights(); // Set up the lights when the component mounts
    }
  };
  </script>
  
  <style scoped>
    /* Styles specific to LightingSetup.vue (if any) would go here */
  </style>
  