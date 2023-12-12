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
      @input="emitSkyboxPropertyChange('metalness', skyboxMetalness)"
      :min="0"
      :max="1"
      step="0.1"
      label="Metalness"
    ></v-slider>
    <v-slider
      v-model="skyboxRoughness"
      @input="emitSkyboxPropertyChange('roughness', skyboxRoughness)"
      :min="0"
      :max="1"
      step="0.1"
      label="Roughness"
    ></v-slider>
    <v-slider
      v-model="skyboxClearcoat"
      @input="emitSkyboxPropertyChange('clearcoat', skyboxClearcoat)"
      :min="0"
      :max="1"
      step="0.1"
      label="Clearcoat"
    ></v-slider>
    <v-slider
      v-model="skyboxClearcoatRoughness"
      @input="emitSkyboxPropertyChange('clearcoatRoughness', skyboxClearcoaRoughness)"
      :min="0"
      :max="1"
      step="0.1"
      label="Clearcoat Roughness"
    ></v-slider><v-slider
      v-model="skyboxReflectivity"
      @input="emitSkyboxPropertyChange('reflectivity', skyboxReflectivity)"
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
import { ref, watch } from 'vue';

export default {
  name: 'AdminPanel',
  setup(_, { emit }) {
    // Refactored reactive state
    const skyboxColorInput = ref('#333333');
    const floorColorInput = ref('#333333');
    const currentFloorIndex = ref(0);
    const isHDREnabled = ref(true);
    const isFloorVisible = ref(true);
    const skyboxMetalness = ref(0.5);
    const skyboxRoughness = ref(0.3);
    const skyboxClearcoat = ref(0.9);
    const skyboxClearcoatRoughness = ref(0.2);
    const skyboxReflectivity = ref(0.5);

    const floors = ['pinkfloor1.glb', 'pinkfloor2.glb', 'bathroomfloor.glb', 'scififloor.glb'];

    // Methods
    const emitSkyboxPropertyChange = (property, value) => {
      emit('changeSkyboxProperty', { property, value });
    };

    const toggleHDR = () => {
      emit('toggle-hdr', isHDREnabled.value);
    };

    const toggleFloor = () => {
      emit('toggle-floor', isFloorVisible.value);
    };

    const changeHDR = () => {
      emit('changeHdr');
    };

    const changeFloor = () => {
      currentFloorIndex.value = (currentFloorIndex.value + 1) % floors.length;
      emit('changeFloor', floors[currentFloorIndex.value]);
    };

    const changeSkybox = () => {
      emit('changeSkybox');
    };

    const changeSkyboxColor = () => {
      const colorHex = skyboxColorInput.value || "#e8e8e8";
      emit("changeSkyboxColor", colorHex);
    };

    // Watchers
    watch(floorColorInput, (newColor) => {
      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor)) {
        emit("changeFloorColor", newColor);
      } else {
        console.warn('Invalid floor color hex:', newColor);
      }
    });

    watch(skyboxColorInput, (newValue) => {
      emit('changeSkyboxColor', newValue);
    });

    // Return reactive state and methods
    return {
      skyboxColorInput,
      floorColorInput,
      isHDREnabled,
      isFloorVisible,
      skyboxMetalness,
      skyboxRoughness,
      skyboxClearcoat,
      skyboxClearcoatRoughness,
      skyboxReflectivity,
      emitSkyboxPropertyChange,
      toggleHDR,
      toggleFloor,
      changeHDR,
      changeFloor,
      changeSkybox,
      changeSkyboxColor
    };
  }
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
