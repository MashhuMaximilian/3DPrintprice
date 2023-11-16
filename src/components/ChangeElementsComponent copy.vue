<template>
  <div class="change">
    <v-btn variant="tonal" size="small" @click="changeHDR">Change HDR</v-btn>
    <v-btn variant="tonal" size="small" @click="changeFloor">Change Floor</v-btn>
    <v-btn variant="tonal" size="small" @click="changeSkybox">Change Skybox</v-btn>
    <div>
    <!-- Existing color picker for skybox color -->
    <span class ="changecolor">  
      Choose Background Color  
      <input type="color" v-model="skyboxColorInput" />
    </span>

    <!-- Sliders for skybox material properties -->
    <v-slider
      v-model="skyboxMetalness"
      @input="emitSkyboxMaterialsChange('metalness', $event)"
      :min="0"
      :max="1"
      step="0.1"
      label="Metalness"
    ></v-slider>
    <v-slider
      v-model="skyboxRoughness"
      @input="emitSkyboxMaterialsChange('roughness', $event)"
      :min="0"
      :max="1"
      step="0.1"
      label="Roughness"
    ></v-slider>
    <v-slider
      v-model="skyboxClearcoat"
      @input="emitSkyboxMaterialsChange('clearcoat', $event)"
      :min="0"
      :max="1"
      step="0.1"
      label="Clearcoat"
    ></v-slider><v-slider
      v-model="skyboxClearcoatRoughness"
      @input="emitSkyboxMaterialsChange('clearcoatRoughness', $event)"
      :min="0"
      :max="1"
      step="0.1"
      label="Clearcoat Roughness"
    ></v-slider><v-slider
      v-model="skyboxReflectivity"
      @input="emitSkyboxMaterialsChange('reflectivity', $event)"
      :min="0"
      :max="1"
      step="0.1"
      label="Reflectivity"
    ></v-slider>
  </div>

<div>
    <!-- Input field for the hexadecimal color value of the floor -->
    <span class ="changecolor">  Choose Floor Color <input type="color" v-model="floorColorInput" />
    <!-- <v-btn variant="tonal" size="small" @click="changeFloorColor">Change Floor Color</v-btn> -->
  </span>
</div>

<v-row>
    <v-col cols="12" sm="6">
      <v-checkbox
        v-model="isHDREnabled"
        :label="'Enable HDR'"
        @change="toggleHDR"
      ></v-checkbox>
    </v-col>
    <v-col cols="12" sm="6">
      <v-checkbox
        v-model="isFloorVisible"
        :label="'Show Floor'"
        @change="toggleFloor"
      ></v-checkbox>
    </v-col>
  </v-row>

</div>
</template>


<script>
export default {
  name: 'ChangeElementsComponent',
  data() {
    return {
      showColorPicker: false,
      skyboxColorInput: '#333333',
      floorColorInput: '#333333', // Add a data property for floor color
      floors: ['pinkfloor1.glb', 'pinkfloor2.glb', 'bathroomfloor.glb', 'scififloor.glb'],
      currentFloorIndex: 0,
      isHDREnabled: true,
      isFloorVisible: true,
      skyboxMetalness: 0.70, // Default value
      skyboxRoughness: 0, // Default value
      skyboxClearcoat: 0, // Default value
      skyboxClearcoatRoughness: 0.1,
      skyboxReflectivity: 0.9,
    };
  },
  methods: {

    // emitSkyboxMaterialsChange(property, value) {
    //   console.log("Emitting skyboxMaterialsChanged event", { property, value });
    //   this.$emit('skyboxMaterialsChanged', { property, value });
    // },

    updateSkyboxProperties() {
    const updatedProperties = {
      metalness: this.skyboxMetalness,
      roughness: this.skyboxRoughness,
      clearcoat: this.skyboxClearcoat,
      clearcoatRoughness: this.skyboxClearcoatRoughness,
      reflectivity: this.skyboxReflectivity
    };
    this.$emit('update-skybox-properties', updatedProperties);
  },

    toggleHDR() {
      this.$emit('toggle-hdr', this.isHDREnabled);
    },
    toggleFloor() {
      this.$emit('toggle-floor', this.isFloorVisible);
    },

    changeHDR() {
      this.$emit('changeHdr');
    },
    changeFloor() {
// Update the current floor index
this.currentFloorIndex = (this.currentFloorIndex + 1) % this.floors.length;
// Emit the changeFloor event with the selected floor identifier
this.$emit('changeFloor', this.floors[this.currentFloorIndex]);
},

changeFloorType() {
  // Emit the changeFloor event when the button is clicked
  this.$emit('changeFloor');
},
    changeSkybox() {
      this.$emit('changeSkybox');
    },
    // No changes needed here, continue emitting the color change event
  // Emit the changeSkyboxColor event when the button is clicked
  changeSkyboxColor() {
  // Get the color value from the input field (skyboxColorInput)
  const colorHex = this.skyboxColorInput || "#e8e8e8"; // Use the input value or default to black

  // Emit the changeSkyboxColor event with the selected color
  this.$emit("changeSkyboxColor", colorHex);
},

},
watch: {
  floorColorInput(newColor) {
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor)) {
      // Valid hex code
      this.$emit("changeFloorColor", newColor);
    } else {
      console.warn('Invalid floor color hex:', newColor);
    }
  },

  skyboxColorInput(newValue) {
      this.$emit('changeSkyboxColor', newValue); // Automatically emit color change for skybox
    },
},
  };
</script>

<style>
.change{
align-content: space-evenly;
}
.v-btn {
margin: 0.5rem;
}

.changecolor {
  padding: 1em;
}
</style>
