import esbuild from "esbuild";
import process from "process";

const isProduction = process.argv.includes("production");
const isWatch = process.argv.includes("--watch");

/**
 * ESBuild configuration for Sankrypt Obsidian plugin
 * Builds secure, minified plugin code with proper bundling
 */
const buildOptions = {
  entryPoints: ["src/main.js"],
  bundle: true,
  external: ["obsidian"], // Obsidian API is external
  format: "cjs",
  target: "es2020",
  logLevel: "info",
  sourcemap: !isProduction, // Sourcemaps for development
  treeShaking: true,
  outfile: "main.js",
  platform: "browser",

  // Security banner warning
  banner: {
    js: `/*
SANKRYPT v1.0 - Professional Encryption
Military-grade AES-256-GCM encryption for your notes
===================================================
WARNING: Keep your master password safe! 
It cannot be recovered if lost.
===================================================
*/`,
  },

  // Minification for production builds
  ...(isProduction && {
    minify: true,
    minifySyntax: true,
    minifyWhitespace: true,
    minifyIdentifiers: false, // Keep identifiers for debugging
  }),
};

// Watch mode configuration
if (isWatch) {
  buildOptions.watch = {
    onRebuild(error) {
      if (error) {
        console.error("❌ Watch build failed:", error);
      } else {
        console.log("✅ Watch build succeeded");
      }
    },
  };
}

// Execute build
esbuild
  .build(buildOptions)
  .then(() => {
    console.log(
      `✅ ${isProduction ? "Production" : "Development"} build successful!`,
    );
    if (isWatch) console.log("👀 Watching for changes...");
  })
  .catch((err) => {
    console.error("❌ Build failed:", err);
    process.exit(1);
  });
