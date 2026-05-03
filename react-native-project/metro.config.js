function getDefaultConfig() {
  return {
    project: {
      ios: {},
      android: {},
    },
    resolver: {
      extraNodeModules: require('react-native-node-polyfills/with-crypto'),
    },
  };
}

const config = require('@react-native-community/cli-platform-android/native_modules');

module.exports = {
  project: {
    ios: {},
    android: {},
  },
  resolver: {
    nodeModulesPaths: [require.resolve('react-native-node-polyfills')],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
