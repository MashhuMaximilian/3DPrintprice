<template>
  <v-app style="background-color: #F3F9FE;">
    <v-main>
      <v-container>
        <v-row>
          <!-- Left Column - 3D Viewer -->
          <v-col cols="12" md="6">
            <v-card class="viewer-section rounded-card">

<viewer-component 
ref="viewer" 
:file="uploadedFile" 
:floor-color="floorColor" 
:enableHDR="enableHDR"
:showFloor="showFloor"
@volume-calculated="handleVolumeCalculated" 
@viewer-mounted="onViewerMounted"
@height-calculated="handleHeightCalculated"
></viewer-component>
</v-card>
            <v-card>
              <ChangeElementsComponent 
              @changeSkybox="handleChangeSkybox"
              @changeHdr="handleChangeHDR"
              @changeFloor="handleChangeFloor"
              @changeSkyboxColor="handleSkyboxColor"
              @changeFloorColor="handleChangeFloorColor"
              @volume-calculated="handleVolumeCalculated"
              @change="handleFileChange" 
              @toggle-hdr="handleHDRChange"
              @toggle-floor="handleFloorChange"
              @changeSkyboxProperty="handleSkyboxPropertyChange"

              />
              
            </v-card>
          </v-col>

          <!-- Right Column - Other Content -->
          <v-col cols="12" md="6">
            <v-card class="upload-section rounded-card">
              <div class="drag-and-drop" style="width: 100%;">
                <file-upload-component 
                    v-if="viewerReady" 
                    :viewer="viewerComponent" 
                    @file-uploaded="handleFileUpload">
              </file-upload-component>
                
              <div class="calculate-button" v-if="fileUploaded">
             <PriceQuotationComponent
              :volumeInMilliliters="volumeInMilliliters"
              :selectedHeight="selectedHeight"
              :originalDimensions="originalDimensions"
              @update:selectedHeight="handleHeightUpdate" >
  </PriceQuotationComponent></div>
  

              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// import * as THREE from 'three'; 
import FileUploadComponent from './components/FileUploadComponent.vue';
import ViewerComponent from './components/3DViewerComponent.vue';
import PriceQuotationComponent from './components/PriceQuotationComponent.vue';
import ChangeElementsComponent from './components/ChangeElementsComponent.vue';



export default {
  components: {
    FileUploadComponent,
    ViewerComponent,
    PriceQuotationComponent,
    ChangeElementsComponent
  },
  data() {
    return {
      uploadedFile: null,
      scene: null,
      hdrs: ['AmbienceExposure4k.hdr', 'Animesky2.hdr', 'blouberg.hdr', 'brownphotostudio.hdr', 'CasualDay4K.hdr', 'christmas.hdr', 'CloudedSunGlow4k.hdr', 'Cloudymorning4k.hdr', 'CoriolisNight4k.hdr', 'cyclorama_hard_light_1k.hdr', 'cyclorama.hdr', 'DarkStorm4K.hdr', 'DayInTheClouds4k.hdr', 'Animesky2.hdr', 'HighFantasy4k.hdr', 'MegaSun4k.hdr', 'memorial.hdr', 'PlanetaryEarth4k.hdr', 'moonlessgolf.hdr', 'spot1Lux.hdr', 'sangiuseppe.hdr', 'SunlessCirruscover4k.hdr', 'UnderTheSea4k.hdr', 'UnearthlyRed4k.hdr', 'SkyhighFluffycloudField4k.hdr'],
      floors: ['pinkfloor2.glb', 'bathroomfloor.glb', 'scififloor.glb'],
      skyboxes: ['CyberinYourFace.glb', 'DreamlikeLandscape.glb', 'GreenExplosion.glb', 'lightbluesky.glb', 'skyboxanimesky.glb', 'skyboxautumnforest.glb', 'skyboxbasicsky.glb', 'skyboxcityskyline.glb', 'skyboxinthecloud.glb', 'freebasicsky.glb', 'milkyway.glb', 'spacenebula.glb'],
      currentHDRIndex: 0,
      currentFloorIndex: 0,
      currentSkyboxIndex: 0,
      floorColor: '#333333',
      viewerReady: false, // Default floor color
      viewerComponent: null,
      selectedHeight: null,
      fileUploaded: false,
      volumeInMilliliters: null,
      originalDimensions: null, 
      enableHDR: true,
      showFloor: true,
    };
  },

  mounted() {
  console.log("Viewer reference in App.vue after mount:", this.$refs.viewer);
  this.$emit('file-uploaded', this.handleUploadedFile);
},
beforeunmount() {
    // Remove the 'file-uploaded' event listener
    this.$emit.$off('file-uploaded', this.handleUploadedFile);
  },

  methods: {


    handleSkyboxPropertyChange({ property, value }) {
    if (this.$refs.viewer) {
      // Call a method that handles all property changes including color
      this.$refs.viewer.updateSkyboxProperties({ [property]: value });
    }
  },

    handleHDRChange(isEnabled) {
      this.enableHDR = isEnabled;
    },
    handleFloorChange(isVisible) {
      this.showFloor = isVisible;
    },

    handleHeightCalculated({ height, originalDimensions }) {
      console.log("Received in App.vue:", { height, originalDimensions });
      this.selectedHeight = height;
      this.originalDimensions = originalDimensions; // Store original dimensions
    },

    handleHeightUpdate(height) {
    console.log("Selected height updated in App.vue:", height);
    this.selectedHeight = height;
    
  },

    handleVolumeCalculated(volume) {
      this.volumeInMilliliters = volume; // Update the volumeInMilliliters when the event is emitted
    },
   
    onViewerMounted() {
  this.$nextTick(() => {
    this.viewerComponent = this.$refs.viewer;
    this.viewerReady = true; // Set viewerReady to true when the viewer is mounted
    console.log("Viewer reference in App.vue after viewer mounted:", this.viewerComponent);
  });
},

onFileUploaded(file) {
      if (this.$refs.viewer) {
        this.$refs.viewer.loadSTLModel(file);
      }
    },
    
  handleFileChange(event, file) {
    if (!this.viewerComponent) {
    console.error("Viewer is undefined");
    return;
  }
  this.viewerComponent.loadSTLModel(file);
  this.fileUploaded = true; // Set fileUploaded to true when a file is uploaded
 
        console.log("Event:", event);
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file && file.size <= 150 * 1024 * 1024) {
                this.uploadedFile = file;
                console.log("File selected in App.vue:", file);
                this.handleFileUpload(file);
            } else {
                alert("File size exceeds 150MB.");
            }
        } else {
            console.error("No file selected");
        }
    },
    
    handleFileUpload(file) {
  // Make sure the received parameter is indeed a file
  if (!(file instanceof File)) {
    console.error("Invalid file type:", file);
    return;
  }

  // Load and display the STL file in the 3D viewer
  if (this.$refs.viewer) {
    this.$refs.viewer.loadSTLModel(file);
  }

  // Set fileUploaded to true after the file is successfully uploaded
  this.fileUploaded = true;

  console.log("Received file in App.vue:", file);
},

onFileSelected(event) {

  console.log("onFileSelected triggered");
  const file = event.target.files[0];
  console.log("File selected in App.vue:", file);
  if (file) {
    this.uploadedFile = file;
    console.log("Uploaded file:", this.uploadedFile);
  }
},

handleChangeHDR() {
  this.currentHDRIndex = (this.currentHDRIndex + 1) % this.hdrs.length;
  const newHDR = this.hdrs[this.currentHDRIndex];
  this.$refs.viewer.updateHDR(newHDR);
},
handleChangeFloor() {
    // Update the current floor index
    this.currentFloorIndex = (this.currentFloorIndex + 1) % this.floors.length;
    // Emit the changeFloor event with the selected floor identifier
    this.$refs.viewer.updateFloor(this.floors[this.currentFloorIndex]);
  },

 
// Handle the changeFloorColor event
handleChangeFloorColor(colorHex) {
  console.log('Received changeFloorColor event with colorHex:', colorHex);
  this.floorColor = colorHex;
},


handleChangeSkybox() {
  if (this.$refs.viewer && this.$refs.viewer.updateSkybox) {
    this.currentSkyboxIndex = (this.currentSkyboxIndex + 1) % this.skyboxes.length;
    const newSkybox = this.skyboxes[this.currentSkyboxIndex];
    this.$refs.viewer.updateSkybox(`/assets/skyboxes/${newSkybox}`);
  } else {
    console.error("Viewer component or updateSkybox method not found.");
  }
},

handleSceneInitialized(scene) {
    this.scene = scene;
  },
  
 handleSkyboxColor(colorHex) {
    console.log('handleSkyboxColor called.');
    console.log("Changing background color to:", colorHex);

    if (!this.$refs.viewer) {
      console.error("Viewer component is not found.");
      return;
    }

    // Dispose of the old skybox and set the new background color
    this.$refs.viewer.updateSkyboxMaterial(colorHex);
  },
  
   




    
  }

  
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
#app, .v-application {
  font-family: 'Roboto', sans-serif;
}

input[type="file"] {
  display: none;
}

.viewer {
  width: 100%;
  height: 100%;
}

.viewer-section, .upload-section {
  width: 100%;
  height: 400px;
  height:fit-content;
  margin-bottom: 20px;
  box-shadow: 0px 3px 16px 2px rgba(0, 0, 0, 0.12),
              0px 9px 12px 1px rgba(0, 0, 0, 0.14),
              0px 5px 6px -3px rgba(0, 0, 0, 0.20);
}

.viewer-section {
  height: 600px;
}
.rounded-card {
  border-radius: 15px !important;
}

.calculate-button > v-btn {
  width: 100%;
  font-size: 18px;
  font-weight: bold;
}
</style>
