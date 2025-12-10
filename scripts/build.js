const execa = require("execa");
const fs = require("fs-extra");
const vite = require("vite");
const esbuild = require("esbuild");
const { createClientBuildConfig, getPath } = require("./utils");

fs.ensureDir(getPath("out"));

const build = async () => {
  
  vite.build(createClientBuildConfig("explorer"));
  
  // const clientBuilder = execa("pnpm", ["run", "build:client"]);
  // clientBuilder.stdout.pipe(process.stdout);

  esbuild.buildSync({
    entryPoints: [getPath('./src/host/index.ts')],
    bundle:true,
    outdir:getPath("./out/host"),
    external: ['vscode'],
    format:"cjs",
    platform: 'node',
  });
};

build();
