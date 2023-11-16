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
export default {
  props: {
    volumeInMilliliters: Number,
    selectedHeight: Number,
    originalDimensions: Object, // Accept originalDimensions as a prop


  },
  data() {
    return {
      // Define constants
      packagingCost: 1,
      machineCost: 2,
      markup: 2,
      designAndReviews: 25,
      pricePerLiterOfResin: 120,
      // Initialize variables
      sellPrice: null,
      minHeight: 0.5,
      maxHeight: 16,
      localSelectedHeight: this.initialHeight, 
      quantity: 1, // Initial quantity
    };
  },
  mounted() {
    this.$emit('volume-calculated', this.handleVolumeCalculated);
  },
  beforeUnmount() {
    this.$emit.$off('volume-calculated', this.handleVolumeCalculated);
  },
  watch: {
    selectedHeight(newVal) {
    console.log("Selected height changed:", newVal);
    console.log("Original dimensions:", this.originalDimensions);
    if (newVal && this.originalDimensions) {
      const scale = newVal / this.originalDimensions.height;
      const scaledVolume = this.originalDimensions.width * this.originalDimensions.depth * newVal * scale;
      console.log("Calculated scaled volume:", scaledVolume);
      this.calculatePrice(scaledVolume);
    }
  },
    
    volumeInMilliliters(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.calculatePrice();
      }
    },

    quantity(newVal, oldVal) {
    if (newVal !== oldVal) {
      this.calculatePrice();
    }
  },
  },

  methods: {

    increaseQuantity() {
      this.quantity++; // Increase the quantity
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--; // Decrease the quantity, but ensure it's not less than 1
      }
    },

    updateSelectedHeight(newValue) {
    this.localSelectedHeight = newValue;
    this.$emit('update:selectedHeight', newValue);
    console.log("Slider value changed in PriceQuotationComponent.vue:", newValue);
    this.$nextTick(() => {
    this.calculatePrice(); 
  });
    
  },
    calculateScaledVolume() {
    if (this.originalDimensions.height === 0) {
      return 0; // Avoid division by zero
    }
    const scale = this.selectedHeight / this.originalDimensions.height;
    return this.originalDimensions.width * this.originalDimensions.depth * this.selectedHeight * scale;
  },

    calculatePrice() {
      console.log("Volume for price calculation:", this.volumeInMilliliters);
      const materialCost = this.pricePerLiterOfResin * this.volumeInMilliliters * 1.15 / 1000;
      this.sellPrice = ((this.packagingCost + materialCost + this.machineCost) * this.markup + this.designAndReviews) * this.quantity;
      console.log(`Sell Price: ${this.sellPrice}`);
    }
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
