
<template>
    <div><!-- This is a necessary root element for Vue --></div>
  </template>
  <script>

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


  export default {
    name: 'EnvironmentSetup',
  
    props: {
      // Define any props that EnvironmentSetup.vue might need from its parent component
    },
  
    data() {
      return {
        // Define the data properties that the extracted functions might rely on
      };
    },
  
    methods: {


loadFloor() {
  const loader = new GLTFLoader();

  // Remove the previous floor if it exists
  if (this.floorMesh) {
    this.$options.scene.remove(this.floorMesh);
  }

  loader.load(this.currentFloor, (gltfFloor) => {
  if (gltfFloor.scene) {
    this.floorMesh = gltfFloor.scene;

    // Set the position and scale for the floor
    this.floorMesh.position.set(0, -8.5, 0); // Horizontal position at y = -0.09
    this.floorMesh.scale.set(27, 0.01, 27); // Scale to reach the origin minus 20 units

    // Traverse through the nodes and apply the new color to the floor
    this.floorMesh.traverse((node) => {
      if (node.isMesh && node.material) {
        node.material.color.copy(new THREE.Color(this.floorColor));
      }
      this.$emit('floorLoaded', { floor: this.floorMesh });
    });

    this.$options.scene.add(this.floorMesh);
  } else {
    console.error("Failed to load the floor model or scene is undefined.");
  }
}, undefined, (error) => {
  console.error("Error loading floor model:", error);
  this.$emit('floorLoadError', { error: 'Error message' });
});

},

updateFloor(newFloor) {
    console.log('Updating floor with:', newFloor);
    this.currentFloor = `/assets/floors/${newFloor}`;
    this.loadFloor(); // Load the new floor into the scene
  },


  updateFloorColor(newColorHex) {
      if (this.floorMesh) {
      const newColor = new THREE.Color(newColorHex);
      this.floorMesh.traverse((node) => {
        if (node.isMesh && node.material) {
          node.material.color.copy(newColor);
      }
    });
  }
},
      
updateSkyboxMaterial(properties) {
  // Ensure properties are reactive
  this.$nextTick(() => {
    console.log("Received properties for update:", properties);

    // Create a default color if none is provided
    const defaultColor = '#ffffff'; // white color as default
    const colorValue = properties.color ?? defaultColor;

    // Ensure the color value is a string and starts with '#'
    const color = new THREE.Color(colorValue.startsWith('#') ? colorValue : `#${colorValue}`);
    console.log("THREE.Color object created:", color);

    // If the skybox material already exists, update its properties
    if (this.skyboxMaterial) {
    
      this.skyboxMaterial.color.set(color); // Update color
      this.skyboxMaterial.metalness = properties.metalness ?? this.skyboxMaterial.metalness;
      this.skyboxMaterial.roughness = properties.roughness ?? this.skyboxMaterial.roughness;
      this.skyboxMaterial.clearcoat = properties.clearcoat ?? this.skyboxMaterial.clearcoat;
      this.skyboxMaterial.clearcoatRoughness = properties.clearcoatRoughness ?? this.skyboxMaterial.clearcoatRoughness;
      this.skyboxMaterial.reflectivity = properties.reflectivity ?? this.skyboxMaterial.reflectivity;
      this.skyboxMaterial.needsUpdate = true; // Tell Three.js to update the material
      console.log("updated material");
    } else {
      // If the material does not exist, create it with new properties
      this.skyboxMaterial = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: properties.metalness ?? 0.5,
        roughness: properties.roughness ?? 0.3,
        clearcoat: properties.clearcoat ?? 0.9,
        clearcoatRoughness: properties.clearcoatRoughness ?? 0.2,
        reflectivity: properties.reflectivity ?? 0.5,
        side: THREE.BackSide,
      });
      console.log("updated material1");
      // Assuming you have a mesh that uses this material, set it here
      this.skyboxMaterial.needsUpdate = true; // Tell Three.js to recompile the material's shaders
this.skyboxMesh.material = this.skyboxMaterial; // Apply the updated material to the mesh
    }

    // Update the scene background if a color is provided
    if (properties.color) {
      this.$options.scene.background.set(color); // Set the background to the new color
    }

    // Render the scene again to reflect the changes
    this.$options.renderer.render(this.$options.scene, this.$options.camera);
    
  });
},

      
loadSkybox() {
      
      // Remove the previous skybox from the scene if it exists
      if (this.skyboxMesh) {
        this.$options.scene.remove(this.skyboxMesh);
        this.skyboxMesh = null; // Ensure the previous mesh is cleared
    
        // Remove the background color
        this.$options.scene.background = null;
      }
    
      if (this.isColorSkybox && this.currentSkyboxColor) {
        // Create a geometry for the skybox. Here, we use a BoxGeometry.
        const skyboxGeometry = new THREE.BoxGeometry(5000, 5000, 5000);
    
        // Create a material with the color selected
        const skyboxMaterial = new THREE.MeshPhysicalMaterial({
      color: this.currentSkyboxColor, // Base color
      metalness: 0.5, // 0.0 for non-metallic, 1.0 for fully metallic
      roughness: 0.3, // 0.0 for smooth, 1.0 for rough
      clearcoat: 0.9, // Intensity of the clearcoat layer
      clearcoatRoughness: 0.2, // Roughness of the clearcoat layer
      reflectivity: 0.5, // Overall reflectivity
      side: THREE.BackSide, // Important for skybox
    });
    
        
        // Create a mesh with the geometry and material
        this.skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    
        // Add the skybox mesh to the scene
        this.$options.scene.add(this.skyboxMesh);
      } else {
        // Load the default or specified skybox
        const loader = new GLTFLoader();
        loader.load(this.currentSkybox, (gltfSkybox) => {
          this.skyboxMesh = gltfSkybox.scene;
          this.$options.scene.add(this.skyboxMesh);
        }, undefined, (error) => {
          console.error("Error loading skybox:", error);
        });
      }
    },
    
      
    updateSkybox(newSkybox) {
    console.log('Updating skybox with:', newSkybox);

    // Hide the skybox color sphere if it exists
    if (this.skyboxColorSphere) {
        this.skyboxColorSphere.visible = false;
    }

    if (newSkybox) {
        // If a new skybox is provided, use it
        this.currentSkybox = newSkybox;
        this.isColorSkybox = false; // Reset the color skybox flag
        this.loadSkybox(); // Load the new skybox into the scene
    } else {
        // If no new skybox is provided, use the default
        this.currentSkybox = this.defaultSkybox;
        this.loadSkybox(); // Load the default skybox into the scene
    }
},
    },
  
    mounted() {
      // If there's any initialization logic that needs to run when the component is mounted, it will go here
    }
  };
  </script>
  
  <style scoped>
    /* Styles specific to EnvironmentSetup.vue (if any) would go here */
  </style>