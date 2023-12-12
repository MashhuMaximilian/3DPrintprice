<template>
  <v-container>
    <v-row class="bluecontainer">
      <!-- Left Column: Price -->
      <v-col cols="12" md="6">
        <div class="price-display">
         <h3>Preț: </h3>
          <p v-if="sellPrice"> {{ sellPrice.toFixed(2) }} RON</p>
        </div>
      </v-col>

      <!-- Right Column: Quantity and Height Selection -->
      <v-col cols="12" md="6">
        <div class>
          <!-- Height Selection -->
          <div class="counter">
            <label class="small">Alege înălțimea dorită:</label>
            <v-slider v-model="localSelectedHeight" :value="selectedHeight" @input="updateSelectedHeight" :min="minHeight" :max="maxHeight" thumb-label></v-slider>
            <p class="small"> Înălțimea actuală: {{ (selectedHeight/10).toFixed(2) }} cm</p>
          </div>

          <!-- Quantity Counter -->
          <div class="counter">
            <p class="small">Alege cantitatea</p>
            <v-btn size="small" variant="tonal" @click="decreaseQuantity">-</v-btn>
            <span class="quantity">{{ quantity }}</span>
            <v-btn size="small" variant="tonal" @click="increaseQuantity">+</v-btn>
          </div>

          <!-- Order Button -->
          <v-btn large color="primary">Comandă Acum</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';

export default {
  name: 'PriceQuotation',
  props: {
    volumeInMilliliters: Number,
    selectedHeight: Number,
    originalDimensions: Object,
  },
  setup(props, { emit }) {
    // Refactor data
    const sellPrice = ref(null);
    const localSelectedHeight = ref(props.initialHeight);
    const quantity = ref(1);

    // Refactor methods
    const increaseQuantity = () => {
      quantity.value++;
    };

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--;
      }
    };

    const updateSelectedHeight = (newValue) => {
      localSelectedHeight.value = newValue;
      emit('update:selectedHeight', newValue);
      console.log("Slider value changed in PriceQuotationComponent.vue:", newValue);
    };

    // const calculateScaledVolume = () => {
    //   if (props.originalDimensions.height === 0) {
    //     return 0;
    //   }
    //   const scale = props.selectedHeight / props.originalDimensions.height;
    //   return props.originalDimensions.width * props.originalDimensions.depth * props.selectedHeight * scale;
    // };

    const calculatePrice = () => {
      console.log("Volume for price calculation:", props.volumeInMilliliters);
      const constants = reactive({
        packagingCost: 1,
        machineCost: 2,
        markup: 2,
        designAndReviews: 25,
        pricePerLiterOfResin: 120
      });

      const materialCost = constants.pricePerLiterOfResin * props.volumeInMilliliters * 1.15 / 1000;
      sellPrice.value = ((constants.packagingCost + materialCost + constants.machineCost) * constants.markup + constants.designAndReviews) * quantity.value;
      console.log(`Sell Price: ${sellPrice.value}`);
    };

    // Refactor lifecycle hooks
    onMounted(() => {
      emit('volume-calculated', calculatePrice);
    });

    onUnmounted(() => {
      emit.$off('volume-calculated', calculatePrice);
    });

    // Refactor watchers
    watch(() => props.selectedHeight, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        console.log("Selected height changed:", newVal);
        console.log("Original dimensions:", props.originalDimensions);
        calculatePrice();
      }
    });

    watch(() => props.volumeInMilliliters, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        calculatePrice();
      }
    });

    watch(quantity, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        calculatePrice();
      }
    });

    // Return reactive properties and methods
    return {
      sellPrice,
      localSelectedHeight,
      quantity,
      increaseQuantity,
      decreaseQuantity,
      updateSelectedHeight,
      calculatePrice,
    };
  }
};
</script>





<style>
.file-upload-container {
  border: 2px dashed #fff;
  padding: 20px;
  position: relative;
}

.uploaded-file-view {
padding: 25px;
flex-direction: column;
justify-content: center;
align-items: center;
align-self: stretch;
  background-color: #E3F2FD;
  color:#1976D2;
  border-radius: 12px;
}


v-btn {
  border-radius: 4px;
  padding: 2px;
}

.counter{
  border-radius: 4px;
  padding: 0px 10px 0px 10px;
  background-color: #ffffff;
  width:100%;
  margin-top: 5px;
  margin-bottom:5px;
}

.bluecontainer {
width: 100%;
padding: 5px;
/* flex-direction: column;
justify-content: center;
align-items: center;
align-self: stretch; */
  background-color: #E3F2FD;
  color:#1976D2;
  border-radius: 12px;
}

.small {
  font-size:12px;
  font-weight: 500;
}
</style>
