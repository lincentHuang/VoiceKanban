# 📱 Feature: 行動端封裝、Capacitor App 與 PWA 支援 (Mobile App & PWA)

## 1. 模組概述 (Overview & Purpose)
本模組負責專案在行動裝置（iOS 與 Android）上的原生 App 體驗與 PWA（Progressive Web App）完整支援：
1. 整合 **Capacitor 跨平台原生框架**，產生可直接編譯並上架至 Apple App Store 與 Google Play Store 的原生工程專案（App ID: `com.voicekanban.app`，名稱：聲動看板）。
2. 提供標準 **PWA 規範**（Manifest、Service Worker 離線快取、Apple Touch Icons、Safe Area Insets 適配）。
3. 於頂部導覽列（Navbar）使用者頭像下拉選單中整合**「在手機安裝應用」**快捷按鈕，提供針對 Android/Chrome（原生安裝觸發）與 iOS Safari（3 步驟圖文引導彈窗）的智慧雙軌體驗，並在已安裝/原生模式下自動隱藏。

---

## 2. 核心功能規格 (Core Capabilities)

### 2.1 Capacitor 跨平台原生封裝 (iOS & Android)
- **應用識別資訊**：
  - App ID / Bundle Identifier: `com.voicekanban.app`
  - 應用程式顯示名稱: `聲動看板` (Voice Kanban)
- **平台專案結構**：
  - `ios/`：完整 Xcode Workspace 專案，配置 `Info.plist`（`NSMicrophoneUsageDescription` 語音輸入辨識權限說明）。
  - `android/`：完整 Android Studio Gradle 專案，配置 `AndroidManifest.xml`（`RECORD_AUDIO`, `INTERNET` 權限）。
- **雙軌容錯架構**：
  - `capacitor.config.ts` 支援本地靜態匯出目錄，並可無縫設定生產環境 Server URL 做為混合容錯代理，確保 Next.js Route Handlers（語音結構化解析 API、BYOK 驗證）在原生容器內穩定運作。
- **建置腳本整合**：
  - `npm run cap:sync`：同步 Web 資源至原生 iOS 與 Android 專案。
  - `npm run cap:open:ios`：啟動 Xcode 進行除錯、打包與上架。
  - `npm run cap:open:android`：啟動 Android Studio 進行除錯與 Play Store 簽署。

### 2.2 Progressive Web App (PWA) 規範與離線支援
- **Web App Manifest (`public/manifest.webmanifest`)**：
  - 應用名稱：`聲動看板 - AI 語音智能任務管理`、短名稱：`聲動看板`。
  - 獨立視窗模式：`display: "standalone"`，直立鎖定 `orientation: "portrait-primary"`。
  - 主題色調：`theme_color: "#f97316"`、`background_color: "#ffffff"`。
  - 完整圖示集：192x192、512x512 以及 Maskable 安全邊界圖示。
- **Service Worker 離線快取 (`public/sw.js`)**：
  - 預快取關鍵資源（`/`, CSS, JS, 圖示）。
  - 導航請求採 Network-First 降級至 Cache，靜態資源採 Stale-While-Revalidate。
  - 前端全自動註冊與更新檢查。
- **全域 iOS 適配與 Safe Area Insets**：
  - `<meta name="apple-mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
  - 響應動態島（Dynamic Island）與底部 Home Bar 安全邊距。

### 2.3 頭像選單「在手機安裝應用」按鈕與雙軌體驗
- **選單入口**：位於 Navbar 頭像下拉選單中的「在手機安裝應用」選單項目。
- **智慧隱藏**：若偵測到當前已處於獨立 PWA 模式（`window.matchMedia('(display-mode: standalone)').matches`）或 Capacitor 原生 App 中，自動隱藏該按鈕，維持選單純淨。
- **雙軌安裝體驗**：
  - **Android / 桌面 Chrome**：捕獲 `beforeinstallprompt` 事件，點擊後調用系統原生安裝彈窗。
  - **iOS Safari**：因 iOS 不支援程式化安裝，自動開啟精緻 3 步驟圖文導引視窗（`IosInstallGuideModal`）：
    1. 點擊 Safari 底部工具列的「分享」按鈕（圖示：⎋）。
    2. 滑動選單並點選「加入主畫面 ➕ (Add to Home Screen)」。
    3. 點擊右上角的「新增」，立即在手機桌面生成獨立 App 圖示。

---

## 3. 模組架構 (Module Architecture)

```text
src/features/pwa-mobile/
├── components/
│   ├── IosInstallGuideModal.tsx   # iOS 3 步驟圖文安裝教學對話框 (落實 UI 5 態)
│   └── InstallPwaMenuItem.tsx     # 下拉選單「在手機安裝應用」按鈕項目
├── hooks/
│   └── usePwaInstall.ts           # PWA 安裝事件捕獲、平台偵測與安裝狀態管理
├── types/
│   └── index.ts                   # PWA 與行動端相關型別定義
├── index.ts                       # 模組統一對外出口
└── feature.md                     # 本功能規格文檔
```

---

## 4. UI 5 種狀態規範 (5 UI States)

1. **Loading**：安裝流程觸發中（呼叫原生 prompt 或確認安裝狀態），按鈕顯示微載入動畫，防止重複點擊。
2. **Empty / Hidden**：當已處於 Standalone PWA 或 Capacitor 原生環境時，元件回傳 `null` 自動隱藏。
3. **Error**：使用者取消安裝或瀏覽器拒絕時，彈出友善 Toast 提示「安裝未完成，可隨時再次點擊安裝」。
4. **Success**：安裝完成（捕獲 `appinstalled` 事件），觸發震動反饋或成功提示，自動隱藏按鈕。
5. **Active / Interactive**：Hover/聚焦狀態下具備柔和橘色高亮與微縮放效果；點擊時呈現點擊反饋。

---

## 5. 驗收標準 (Acceptance Criteria, AC)

- [x] **AC-PWA-1**：提供標準 `public/manifest.webmanifest`，包含名稱、主題色與各尺寸圖示，通過 PWA 規範校驗。
- [x] **AC-PWA-2**：提供 `public/sw.js`，離線快取關鍵資源並支援自動註冊與更新機制。
- [x] **AC-PWA-3**：在 Navbar 頭像選單中呈現「在手機安裝應用」按鈕，在 Standalone/原生環境下自動隱藏。
- [x] **AC-PWA-4**：Chrome/Android 上點擊觸發 `beforeinstallprompt` 原生安裝；iOS Safari 點擊開啟 3 步驟圖文導引視窗。
- [x] **AC-PWA-5**：Capacitor 雙平台專案（`ios/` 與 `android/`）完整生成，設定 Bundle ID `com.voicekanban.app` 與名稱「聲動看板」，權限與建置指令配置齊全。
