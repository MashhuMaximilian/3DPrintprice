
<template>
  <div><!-- This is a necessary root element for Vue --></div>
</template>
  
  <script>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

export default {
  name: 'ModelLoader',
  props: ['modelUrl'],
  data() {
    return {
      cubeMesh: null, 
      scene: null,
    };
  },


  mounted() {
   
  this.scene = new THREE.Scene(); // Initialize your scene here
  this.loadGLTFModel();
  
  },
  methods: {

    
    loadGLTFModel() {
  const loader = new GLTFLoader();

  loader.load('/assets/resinprinter/scene.gltf', (gltf) => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const currentDimensions = box.getSize(new THREE.Vector3());
    const desiredDimensions = new THREE.Vector3(22.1, 40.3, 22.1);
    const scaleX = desiredDimensions.x / currentDimensions.x;
    const scaleY = desiredDimensions.y / currentDimensions.y;
    const scaleZ = desiredDimensions.z / currentDimensions.z;

    gltf.scene.scale.set(scaleX, scaleY, scaleZ);

    gltf.scene.traverse(node => {
      if (node.isMesh && node.material) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.material.specular = new THREE.Color(0xaaaaaa);
        node.material.shininess = 30;
      }
    });

    if (this.scene) {
      this.scene.add(gltf.scene);

      const center = new THREE.Box3().setFromObject(gltf.scene).getCenter(new THREE.Vector3());
      const innerLight = new THREE.PointLight(0xffffff, 0.1, 10);
      innerLight.position.set(center.x, center.y, center.z);
      this.scene.add(innerLight);

      loader.load('/assets/skyboxes/skyboxanimesky.glb', (gltfSky) => {
        this.scene.add(gltfSky.scene);
        gltfSky.scene.scale.set(50000, 50000, 5000);

        gltfSky.scene.traverse(node => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
      });

      this.$emit('gltf-model-loaded', {
        scene: gltf.scene,
        originalDimensions: currentDimensions,
        scaledDimensions: desiredDimensions,
        scale: { x: scaleX, y: scaleY, z: scaleZ },
        center: center
      });
    } else {
      console.error("Scene is not initialized in ModelLoader");
    }
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

  // Emit the 'model-loaded-STL' event with the necessary model details
  this.$emit('stl-model-loaded', {
    mesh: mesh,
    dimensions: dimensions,
    volume: printVolume
  });
});
};

self.fileReader.onerror = (error) => {
console.error('Error reading STL file:', error);
};

console.log('Reading STL file contents');
self.fileReader.readAsArrayBuffer(file);
},


positionModelInScene(model) {
// Set the position of the model in the scene
// Adjust these values based on where you want to place the model
model.position.set(0, 0, 0);
// If the position is significant to the parent, emit it
this.$emit('model-positioned', { position: model.position });
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



calculateScalingFactor(mesh) {
// Use Squirtle's volume as a reference
const squirtleVolume = 203320; // Volume of Squirtle in mm3
const modelVolume = this.calculateVolume(mesh.geometry); // Calculate the volume of the STL model

// Calculate scaling factor based on the volume ratio
const scalingFactor = Math.cbrt(modelVolume / squirtleVolume);
this.$emit('scaling-factor-calculated', scalingFactor);

return scalingFactor;
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


loadReferenceCube(cubePath) {
      const loader = new STLLoader();
      loader.load(cubePath, (geometry) => {
        const material = new THREE.MeshStandardMaterial({ visible: false });
        this.cubeMesh = new THREE.Mesh(geometry, material); // Update this line
        this.$options.scene.add(this.cubeMesh);
        this.referenceCube = this.cubeMesh;
      });
      this.$emit('reference-cube-loaded', { cubeMesh: this.cubeMesh }); // Update this line
    },
}
};
</script>

<style>
/* Styles for the model loader */
</style>
