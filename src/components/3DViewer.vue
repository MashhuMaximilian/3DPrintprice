Look at this code and view the video:

<template>
  <div ref="rendererContainer" style="width: 100%; height: 100%;"></div>
</template>

<script>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';


export default {
  name: '3DViewer',
  props: {
    updateLights: Function,
    updateEnvironment: Function,
    updatenewFloor: Function,
    enableHDR: Boolean,
    showFloor: Boolean,
    floorColor: {
    type: String,
    default: '#8c52ff',
    // Initial properties of the skybox material
    skyboxProperties: {
      color: '#333333', // Default color
      metalness: 0.5,
      roughness: 0.3,
      clearcoat: 0.9,
      clearcoatRoughness: 0.2,
      reflectivity: 0.5,
    },
  }
    
  },

data() {
    return {
      currentHDR: '/assets/hdrs/DayInTheClouds4k.hdr',
      currentFloor: '/assets/floors/pinkfloor2.glb',
      currentSkybox: '/assets/skyboxes/lightbluesky.glb',
      currentSkyboxColor: '#FFFFFF', // Default color for skybox
      isColorSkybox: false, // Flag to determine skybox type
      scene: null,
      isReady: false,
      fileReader: new FileReader(),
      hdrIntensity: 2, 
      volume: 0, // This will store the volume calculated in the 3D viewer

    };
  },
  
// Add event listeners in the mounted() lifecycle hook
mounted() {
  this.$options.scene = new THREE.Scene();
  this.isReady = true;
    // Now you can call the passed-in methods like this:
  this.$options.scene = new THREE.Scene();
    // Initialize other scene elements
  this.initializeScene();
  
  console.log("3DViewerComponent mounted");
  this.$emit('viewer-mounted'); // Emit a specific event
  window.addEventListener('resize', this.handleWindowResize);
// Add event listeners
 this.$emit('mounted'); 
this.$emit('update-lights', this.setupLights); 
this.$emit('update-environment', this.loadEnvironment);
this.$emit('update-floor', this.loadFloor);
this.$emit('changeSkyboxProperty', this.updateSkyboxMaterial);

this.animate = this.animate.bind(this); // Bind the method
  this.animate(); // Start the animation loop



},

// Remove event listeners in the beforeUnmount() lifecycle hook
beforeUnmount() {
  window.removeEventListener('resize', this.handleWindowResize);
  this.$emit.$off('update-lights', this.setupLights);
  this.$emit.$off('update-environment', this.loadEnvironment);
  this.$emit.$off('update-floor', this.loadFloor); 
},

  methods: {
    
    handleWindowResize() {
      const width = this.$refs.rendererContainer.clientWidth;
      const height = this.$refs.rendererContainer.clientHeight;
      this.$options.camera.aspect = width / height;
      this.$options.camera.updateProjectionMatrix();
      this.$options.renderer.setSize(width, height);
    },
    initializeScene() {
      
      this.$options.scene = new THREE.Scene();
      // Add other scene initializations here
      console.log("Scene initialized"); 

      this.setupRenderer();
      this.setupCameraAndControls();
      this.setupLights();
      this.loadEnvironment();
      this.loadFloor(); 
      this.animate();
      this.loadGLTFModel();
      this.loadReferenceCube('/assets/1cm3cube.stl');
      this.loadSkybox(this.currentSkybox); // Load the default skybox
     

      this.$emit('scene-initialized', this.$options.scene); // Emit an event to signal that the scene is initialized

    },

    setupRenderer() {
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




    setupLights() {
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




    updateHDR(newHDR) {
  console.log('Updating HDR with:', newHDR);
  this.currentHDR = `/assets/hdrs/${newHDR}`;
  this.loadEnvironment(); // Load the new HDR environment
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

updateHDRIntensity(newIntensity) {
  this.hdrIntensity = newIntensity;
  if (this.$options.scene && this.$options.scene.environment) {
    this.$options.scene.environment.intensity = newIntensity;
  }
},

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
    });

    this.$options.scene.add(this.floorMesh);
  } else {
    console.error("Failed to load the floor model or scene is undefined.");
  }
}, undefined, (error) => {
  console.error("Error loading floor model:", error);
});

},

loadReferenceCube(cubePath) {
  const loader = new STLLoader();
  loader.load(cubePath, (geometry) => {
    const material = new THREE.MeshStandardMaterial({visible: false}); // Invisible as it's just for reference
    const cubeMesh = new THREE.Mesh(geometry, material);
    this.$options.scene.add(cubeMesh);
    this.referenceCube = cubeMesh; // Store for later use
  });
},


calculateScalingFactor(mesh) {
  // Use Squirtle's volume as a reference
  const squirtleVolume = 203320; // Volume of Squirtle in mm3
  const modelVolume = this.calculateVolume(mesh.geometry); // Calculate the volume of the STL model

  // Calculate scaling factor based on the volume ratio
  return Math.cbrt(modelVolume / squirtleVolume);
},

calculateVolume(geometry) {
  // Check if geometry is undefined or not a BufferGeometry
  if (!geometry ?? !(geometry instanceof THREE.BufferGeometry)) {
    console.error('Invalid or undefined geometry passed to calculateVolume.');
    return 0;
  }

  // Get position attribute
  const positionAttribute = geometry.getAttribute('position');

  // Check if position attribute exists
  if (!positionAttribute) {
    console.error('Geometry does not have position attribute.');
    return 0;
  }

  let volume = 0;

  // Iterate over each face (assuming geometry is made of triangles)
  for (let i = 0; i < positionAttribute.count; i += 3) {
    // Get vertices of the triangle
    const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i);
    const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1);
    const v3 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2);

    // Calculate volume of the tetrahedron
    const tetraVolume = v1.dot(v2.cross(v3)) / 6;

    volume += tetraVolume;
  }

  // Convert to absolute value as the volume can be negative depending on the winding order of triangles
  volume = Math.abs(volume);

  // Convert volume from cubic millimeters to milliliters (1 mL = 1000 mm^3)
  const volumeInMilliliters = volume / 1000;
  this.$emit('volume-calculated', volumeInMilliliters);

  // Return volume in milliliters
  return volumeInMilliliters;
},



calculateDimensions(geometry) {
  geometry.computeBoundingBox();
  const boundingBox = geometry.boundingBox;
  const width = Math.abs(boundingBox.max.x - boundingBox.min.x);
  const height = Math.abs(boundingBox.max.y - boundingBox.min.y);
  const depth = Math.abs(boundingBox.max.z - boundingBox.min.z);
   // Emit an event with the calculated height
// Emit an event with the calculated height and original dimensions
console.log("Emitting height and original dimensions:", { height, originalDimensions: { width, height, depth } });
this.$emit('height-calculated', { height, originalDimensions: { width, height, depth } });

  return { width, height, depth };
},


positionModelInScene(model) {
  // Set the position of the model in the scene
  // Adjust these values based on where you want to place the model
  model.position.set(0, 0, 0);
},





loadGLTFModel() {
  const loader = new GLTFLoader();

  loader.load('/assets/resinprinter/scene.gltf', (gltf) => {
    // Get the bounding box of the loaded GLTF model
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const currentDimensions = box.getSize(new THREE.Vector3());

    // Desired dimensions in mm (assuming 1 unit = 1mm)
    const desiredDimensions = new THREE.Vector3(22.1, 40.3, 22.1);

    // Calculate scaling factors
    const scaleX = desiredDimensions.x / currentDimensions.x;
    const scaleY = desiredDimensions.y / currentDimensions.y;
    const scaleZ = desiredDimensions.z / currentDimensions.z;

    // Apply scaling
    gltf.scene.scale.set(scaleX, scaleY, scaleZ);

    // Apply shadow and material properties
    gltf.scene.traverse(node => {
      if (node.isMesh && node.material) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.material.specular = new THREE.Color(0xaaaaaa);
        node.material.shininess = 30;
      }
    });

    // Add the resin printer to the scene
    this.$options.scene.add(gltf.scene);

    // Get the center of the scaled model
    // const center = box.getCenter(new THREE.Vector3());
     // Get the center of the scaled model
     const center = new THREE.Box3().setFromObject(gltf.scene).getCenter(new THREE.Vector3());

      // Call setupCameraAndControls with the center
      this.setupCameraAndControls(center);


    // // Add a PointLight at the center of the model
    const innerLight = new THREE.PointLight(0xffffff, 0.1, 10);
    innerLight.position.set(center.x, center.y, center.z);
    this.$options.scene.add(innerLight);

 // // Load the environment
    loader.load('/assets/skyboxes/skyboxanimesky.glb', (gltfSky) => {
      this.$options.scene.add(gltfSky.scene);

      // Scale the skybox to be larger
      gltfSky.scene.scale.set(50000, 50000, 5000); // Adjust the scale as needed


      gltfSky.scene.traverse(node => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
    });

  });
},
loadSTLModel(file) {
  // Check if the file is of the correct type
  if (!(file instanceof Blob)) {
    console.error('Invalid file type:', file);
    return;
  }

  // Make sure the fileReader is initialized
  if (!this.fileReader) {
    this.fileReader = new FileReader();
  }

  console.log('Loading STL model:', file.name);
  const loader = new STLLoader();
  const self = this;

  // If there is a previously loaded STL model, remove it
  if (self.loadedSTL) {
    self.$options.scene.remove(self.loadedSTL);
  }

  self.fileReader.onload = (e) => {
    console.log('File read completed, parsing geometry');
    const geometry = loader.parse(e.target.result);

    if (!geometry) {
      console.error('Error parsing STL geometry');
      return;
    }
    console.log('Geometry parsed successfully');
    const material = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(geometry, material);

    if (!geometry ?? geometry.type !== 'BufferGeometry') {
      console.error('Invalid or undefined geometry');
      return;
    }

    // Calculate the scaling factor based on the reference cube
    const scalingFactor = this.calculateScalingFactor(geometry, this.referenceCube);
    mesh.scale.set(scalingFactor, scalingFactor, scalingFactor); // Apply scaling

    // Calculate and log the dimensions and volume of the STL model
    const dimensions = this.calculateDimensions(geometry);
    const printVolume = this.calculateVolume(geometry);
    console.log(`STL Model Dimensions: ${dimensions.width / 10} x ${dimensions.height / 10} x ${dimensions.depth / 10} cm`);
    console.log(`STL Model Volume: ${printVolume} mL`);
    this.$emit('volume-calculated', printVolume);

    // Scale down by a factor of 10
    mesh.scale.set(0.1, 0.1, 0.1);

    // Rotate the model to be upside down
    mesh.rotation.z = Math.PI; // Rotate by 180 degrees around the Z-axis
    mesh.rotation.x = Math.PI / 2; // Rotate by 90 degrees around the X-axis

    // Load the GLTF model to get its center and size
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/assets/resinprinter/scene.gltf', (gltf) => {
      const gltfBox = new THREE.Box3().setFromObject(gltf.scene);
      const gltfCenter = gltfBox.getCenter(new THREE.Vector3());

      // Position the STL model in the middle of the GLTF model with its top at the floor
      mesh.position.set(gltfCenter.x - 1, gltfCenter.y + 18.5, gltfCenter.z + 11);

      // Set the currently loaded STL model
      self.loadedSTL = mesh;

      console.log('Adding mesh to scene');
      self.$options.scene.add(mesh);
    });
  };

  self.fileReader.onerror = (error) => {
    console.error('Error reading STL file:', error);
  };

  console.log('Reading STL file contents');
  self.fileReader.readAsArrayBuffer(file);
},




 animate() {
  requestAnimationFrame(this.animate); // This ensures the animate method is called on the next frame
  this.$options.renderer.render(this.$options.scene, this.$options.camera); // Render the scene with the camera
}
    
    
  },



  watch: {
  floorColor(newColor) {
    this.updateFloorColor(newColor);
  },

  enableHDR(newVal) {
      if (newVal) {
        this.loadEnvironment(); // Turn on HDR
      } else {
        this.$options.scene.environment = null; // Turn off HDR
      }
    },
    showFloor(newVal) {
      if (this.floorMesh) {
        this.floorMesh.visible = newVal; // Toggle floor visibility
      }
    }
}
};
</script>
