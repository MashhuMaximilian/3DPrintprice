module.exports = {
  transpileDependencies: true,

  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.gltf$/,
          use: 'file-loader',
        },
        {
          test: /\.bin$/,
          use: 'file-loader',
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10240,
            },
          },
        },
      ],
    },
  },

  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    },
  },
};
