process.env.NITRO_PRESET = process.env.NITRO_PRESET || (process.env.VERCEL ? "vercel" : "node-server");

import { defineConfig as defineBaseConfig } from "@lovable.dev/vite-tanstack-config";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin, PluginOption } from "vite";

const baseConfig = defineBaseConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        strict: false,
        allow: ["..", "/"],
      },
    },
    resolve: {
      tsconfigPaths: true,
    },
  },
});

function isViteTsconfigPathsPlugin(plugin: unknown): boolean {
  return (
    typeof plugin === "object" &&
    plugin !== null &&
    "name" in plugin &&
    (plugin as Plugin).name === "vite-tsconfig-paths"
  );
}

export default async (env: Parameters<typeof baseConfig>[0]) => {
  const config = await baseConfig(env);
  if (config.plugins) {
    config.plugins = (config.plugins as PluginOption[])
      .flat(Infinity as 1)
      .filter((plugin) => !isViteTsconfigPathsPlugin(plugin));
    config.plugins.unshift(tailwindcss());
  }
  return config;
};

