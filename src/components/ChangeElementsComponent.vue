<template>
  <div class="change">
    <v-btn variant="tonal" size="small" @click="changeHDR">Change HDR</v-btn>
    <v-btn variant="tonal" size="small" @click="changeFloor"
      >Change Floor</v-btn
    >
    <v-btn variant="tonal" size="small" @click="changeSkybox"
      >Change Skybox</v-btn
    >
    <div>
      <!-- Existing color picker for skybox color -->
      <span class="changecolor">
        Choose Background Color
        <input type="color" v-model="skyboxColorInput" />
      </span>

      <!-- Sliders for skybox material properties -->
      <v-slider
        v-model="skyboxMetalness"
        @input="emitSkyboxPropertyChange('metalness', skyboxMetalness)"
        :min="0.1"
        :max="1"
        step="0.1"
        label="Metalness"
      ></v-slider>
      <v-slider
        v-model="skyboxRoughness"
        @input="emitSkyboxPropertyChange('roughness', skyboxRoughness)"
        :min="0.1"
        :max="1"
        step="0.1"
        label="Roughness"
      ></v-slider>
      <v-slider
        v-model="skyboxClearcoat"
        @input="emitSkyboxPropertyChange('clearcoat', skyboxClearcoat)"
        :min="0.1"
        :max="1"
        step="0.1"
        label="Clearcoat"
      ></v-slider>
      <v-slider
        v-model="skyboxClearcoatRoughness"
        @input="
          emitSkyboxPropertyChange(
            'clearcoatRoughness',
            skyboxClearcoaRoughness
          )
        "
        :min="0.1"
        :max="1"
        step="0.1"
        label="Clearcoat Roughness"
      ></v-slider
      ><v-slider
        v-model="skyboxReflectivity"
        @input="emitSkyboxPropertyChange('reflectivity', skyboxReflectivity)"
        :min="0.1"
        :max="1"
        step="0.1"
        label="Reflectivity"
      ></v-slider>
    </div>

    <div>
      <!-- Input field for the hexadecimal color value of the floor -->
      <span class="changecolor">
        Choose Floor Color <input type="color" v-model="floorColorInput" />
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
  name: "ChangeElementsComponent",
  data() {
    return {
      showColorPicker: false,
      skyboxColorInput: "#333333",
      floorColorInput: "#333333", // Add a data property for floor color
      floors: [
        "pinkfloor1.glb",
        "pinkfloor2.glb",
        "bathroomfloor.glb",
        "scififloor.glb",
      ],
      currentFloorIndex: 0,
      isHDREnabled: true,
      isFloorVisible: true,
      skyboxMetalness: 0.5, // Default value or initial value
      skyboxRoughness: 0.3,
      skyboxClearcoat: 0.9,
      skyboxClearcoatRoughness: 0.2,
      skyboxReflectivity: 0.5,
    };
  },
  methods: {
    emitSkyboxPropertyChange(property, value) {
      this.$emit("changeSkyboxProperty", { property, value });
      console.log("emitted properties skybox");
    },

    toggleHDR() {
      this.$emit("toggle-hdr", this.isHDREnabled);
    },
    toggleFloor() {
      this.$emit("toggle-floor", this.isFloorVisible);
    },

    changeHDR() {
      this.$emit("changeHdr");
    },
    changeFloor() {
      // Update the current floor index
      this.currentFloorIndex =
        (this.currentFloorIndex + 1) % this.floors.length;
      // Emit the changeFloor event with the selected floor identifier
      this.$emit("changeFloor", this.floors[this.currentFloorIndex]);
    },

    changeFloorType() {
      // Emit the changeFloor event when the button is clicked
      this.$emit("changeFloor");
    },
    changeSkybox() {
      this.$emit("changeSkybox");
    },
    // No changes needed here, continue emitting the color change event
    // Emit the changeSkyboxColor event when the button is clicked
    changeSkyboxColor() {
      // Get the color value from the input field (skyboxColorInput)
      const colorHex = this.skyboxColorInput || "#e8e8e8"; // Use the input value or default to black

      // Emit the changeSkyboxColor event with the selected color
      this.$emit("changeSkyboxColor", colorHex);
    },

    // Emit the changeFloorColor event when the button is clicked
  },
  watch: {
    floorColorInput(newColor) {
      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor)) {
        // Valid hex code
        this.$emit("changeFloorColor", newColor);
      } else {
        console.warn("Invalid floor color hex:", newColor);
      }
    },

    skyboxMetalness(newValue) {
      this.emitSkyboxPropertyChange("metalness", newValue);
    },
    skyboxRoughness(newValue) {
      this.emitSkyboxPropertyChange("roughness", newValue);
    },
    skyboxClearcoat(newValue) {
      this.emitSkyboxPropertyChange("clearcoat", newValue);
    },
    skyboxClearcoatRoughness(newValue) {
      this.emitSkyboxPropertyChange("clearcoatRoughness", newValue);
    },
    skyboxReflectivity(newValue) {
      this.emitSkyboxPropertyChange("reflectivity", newValue);
    },

    skyboxColorInput(newValue) {
      this.$emit("changeSkyboxColor", newValue); // Automatically emit color change for skybox
    },
  },
};
</script>

<style>
.change {
  align-content: space-evenly;
}
.v-btn {
  margin: 0.5rem;
}

.changecolor {
  padding: 1em;
}
</style>
