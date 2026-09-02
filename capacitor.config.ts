import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.voicekanban.app",
  appName: "聲動看板",
  webDir: "out",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  plugins: {
    // 預設外掛配置可依需要擴充 (如 SplashScreen, Keyboard)
  },
};

export default config;
