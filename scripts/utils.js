const path = require("path");

const getPath = (p) => path.resolve(__dirname, "../", p);

const createClientBuildConfig = (path, watch=undefined) => ({
  root: getPath(`src/client/${path}/`),
  base: "./",
  build: {
    outDir: getPath(`out/client/${path}/`),
    emptyOutDir: true,
    watch,
  },
});

module.exports = {
  getPath,
  createClientBuildConfig
};
