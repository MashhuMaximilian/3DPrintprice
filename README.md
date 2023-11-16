<<<<<<< HEAD
# 3dPrint-Price
=======
# 3dprintprice

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
>>>>>>> 935f2e7 (init)


### Clarifications 
I use Vue 3 and Vuetify.

App.vue is a parent to 3DviewerComponen.vue, PriceQuotationConponent.vue,  FileUploadComponent.vue, ChangeElementeComponent.vue
    
    The main things you can do:
    1.1) Upload an STL
    1.2) View the STL in the 3DViewer placed in a specific way
    1.3) Change the quantity of the 3d prints you need and a button to order
    1.4) Change the scaled volume (based on height input from a v-slider) and the price would update in real-time based on this recalculated volume (*deprecated*)
    2.1) Change the skybox with one from a list with a button
    2.2) Change the floor with one from a list with a button
    2.3) Change the floor's color with a color picker
    2.4) Replace the skybox with a huge sphere
    2.5) Change the color and material properties of the sphere (*deprecated*)
    3.1) Hide/Show Floor
    3.2) Hide/Show HDR
