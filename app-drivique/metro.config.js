// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Fix: "Uncaught SyntaxError: Cannot use 'import.meta' outside a module"
// on web.
//
// Some dependencies (notably zustand v5) publish a modern ESM build that
// uses `import.meta`. Metro's default package-exports resolution prefers
// that ESM build over the CommonJS one, and hands it straight to Hermes,
// which doesn't understand `import.meta` — the web bundle then crashes at
// runtime with a blank screen. Forcing Metro to resolve the
// `require`/`react-native` conditions first makes it pick the
// pre-compiled CommonJS build instead, which has no `import.meta` in it.
config.resolver.unstable_conditionNames = [
  "browser",
  "require",
  "react-native",
];

// Paleta de marca dinámica: todo color pasa por utils/normalizeColorBrand antes de llegar a lo nativo
const path = require("path");
const resolverOriginal = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "@react-native/normalize-colors" &&
    !context.originModulePath.includes("normalizeColorBrand")
  ) {
    return { type: "sourceFile", filePath: path.resolve(__dirname, "utils/normalizeColorBrand.ts") };
  }
  return resolverOriginal ? resolverOriginal(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
