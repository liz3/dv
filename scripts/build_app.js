require("esbuild")
  .build({
    entryPoints: ["app/index.js"],
    bundle: true,
    outfile: "app/build.js",
    platform: "node",
    external: ["electron"],
  })
  .catch(() => process.exit(1));
