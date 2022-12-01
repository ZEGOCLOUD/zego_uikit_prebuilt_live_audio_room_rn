const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const uikitPak = require('../../../package.json');
const prebuiltPak = require('../package.json');

const prebuiltRoot = path.resolve(__dirname, '..');
const uikitRoot = path.resolve(__dirname, '../../..');

const uikitModules = Object.keys({
  ...uikitPak.peerDependencies,
});

const prebuiltModules = Object.keys({
  ...prebuiltPak.peerDependencies,
});

module.exports = {
  projectRoot: __dirname,
  watchFolders: [prebuiltRoot, uikitRoot],

  // We need to make sure that only one version is loaded for peerDependencies
  // So we block them at the root, and alias them to the versions in example's node_modules
  resolver: {
    blacklistRE: exclusionList([
      ...uikitModules.map(
        m =>
          new RegExp(
            `^${escape(path.join(uikitRoot, 'node_modules', m))}\\/.*$`,
          ),
      ),
      ...prebuiltModules.map(
        m =>
          new RegExp(
            `^${escape(path.join(prebuiltRoot, 'node_modules', m))}\\/.*$`,
          ),
      ),
    ]),

    extraNodeModules: uikitModules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
