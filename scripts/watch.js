// const execa = require("execa");
const cp = require("child_process");
const fs = require("fs-extra");
const vite = require("vite");
const { createClientBuildConfig, getPath } = require("./utils");

fs.ensureDir(getPath("out"));

const watch = async () => {
  
  vite.build(createClientBuildConfig("explorer",{}));
  const hostWatcher = cp.exec("npm", ["run", "watch:host"]);
  // const hostWatcher = execa("npm", ["run", "watch:host"]);
  hostWatcher.stdout.pipe(process.stdout);
};

watch();
