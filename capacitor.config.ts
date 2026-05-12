import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nexora.fitness",
  appName: "Nexora Fitness",
  webDir: "www",
  server: {
    url: "https://nexora-fitness.vercel.app",
    cleartext: false,
  },
};

export default config;