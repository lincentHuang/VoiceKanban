# 測試驗收報告 (QA_REPORT.md) - 手機版多選模式底部操作列雙行響應式佈局優化

## 1. 測試摘要 (Executive Summary)
- **測試目標**：
  1. 解決手機版小螢幕（`< sm`）在多選模式下，底部浮動 `BatchActionBar` 擠壓在單行導致「移動至」等按鈕字體垂直斷行、按鈕過度擁擠跑版的問題。
  2. 依據需求將手機版操作列調整為**雙行卡片佈局（Two-Line Card Layout）**：
     - **第一行**：選取數量徽章、計數文字（「已選 N 項」）與「退出多選」按鈕。
     - **第二行**：依序排列「移動至」、「優先級」、「未完成」、「完成」與「刪除」操作按鈕，加入 `whitespace-nowrap` 防折行。
  3. 保留桌機版（`≥ sm`）原本流暢俐落的單行膠囊列（Single-Line Pill Bar）不受影響。
  4. 解決手機版右下角關閉按鈕與開發指示器或浮動圖示重疊的點擊干擾問題。
- **測試結果**：全部 7 項驗收條件 (AC1 ~ AC7) **100% 通過 (PASS)**。
- **建置狀態**：`npm run build` Next.js 16.3.3 (Turbopack) 編譯與 TypeScript 型別檢查 0 錯誤通過。

---

## 2. 驗收項目測試矩陣 (Acceptance Test Matrix)

| 編號 | 驗收項目 (Acceptance Criteria) | 測試情境與邊界條件 | 測試結果 | 狀態 |
| :--- | :--- | :--- | :--- | :--- |
| **AC1** | **手機版雙行佈局呈現 (Mobile Two-Line Layout)** | 於小螢幕寬度（360px ~ 430px）開啟多選模式並勾選卡片。 | 浮動列自動呈現雙行卡片結構（`rounded-2xl`），上層為資訊列，下層為動作列，版面寬敞舒適。 | ✅ PASS |
| **AC2** | **按鈕文字零垂直折行 (No Text Wrapping in Buttons)** | 檢視第二行「移動至」、「優先級」與「完成」文字按鈕。 | 所有文字均包含 `whitespace-nowrap`，即便在 360px 極小螢幕下亦保持水平單行顯示，不再發生「移\n動\n至」垂直擠壓折行。 | ✅ PASS |
| **AC3** | **退出按鈕獨立位置與點擊安全 (Safe Exit Button Placement)** | 觀察第一行右側之「退出多選」按鈕。 | 退出按鈕移至第一行右上角，遠離右下角可能出現的懸浮小部件（如 Next.js indicator），點擊直覺靈敏。 | ✅ PASS |
| **AC4** | **桌機版單行外觀完整保留 (Desktop Single-Row Preservation)** | 螢幕寬度拉大至 `sm`（≥ 640px）。 | 浮動列自動切換回單行膠囊外觀（`rounded-full`），左側計數、右側動作按鈕，視覺美觀一致。 | ✅ PASS |
| **AC5** | **批次操作彈窗方位正常 (Menu Popovers Above Buttons)** | 點擊手機版第二行「移動至」與「優先級」下拉按鈕。 | 選單向上彈出（`bottom-full mb-2`），不會被螢幕邊緣裁切，欄位/優先級選項切換精確。 | ✅ PASS |
| **AC6** | **0 選取項空狀態容錯 (Empty Selection State Handling)** | 開啟多選模式但尚未選取任何任務時。 | 第一行顯示「已選 0 項」與「全選看板」快捷鍵；第二行所有操作按鈕平滑置灰禁選（`disabled:opacity-40`），UI 狀態明確。 | ✅ PASS |
| **AC7** | **生產環境編譯與型別安全 (Build & Typecheck)** | 執行 `npm run build`。 | Next.js 16 (Turbopack) 成功編譯，TypeScript 型別檢查 0 錯誤通過。 | ✅ PASS |

---

## 3. 測試結論與交付建議
手機版多選懸浮操作列（`BatchActionBar`）跑版問題已徹底解決，小螢幕雙行佈局與桌機版單行膠囊列皆完美適配，所有批次操作功能與彈窗均通過驗收，建議使用者進行 `git commit` 保存。

---

# 測試驗收報告 (QA_REPORT.md) - Header 瘦身與全響應式 Search Modal 搜尋體驗

## 1. 測試摘要 (Executive Summary)
- **測試目標**：
  1. Header 移除「建立（+）」與「一鍵語音（Mic）」按鈕，徹底解決手機螢幕空間過窄造成的擠壓變形。
  2. 桌機版（`≥ sm`）搜尋列轉為快捷觸發列，支援滑鼠點擊與全域快捷鍵 `⌘K` / `Ctrl+K` 呼叫 `SearchModal`。
  3. 手機版（`< sm`）搜尋框自動轉換為右上角精緻搜尋按鈕圖示，點擊呼叫 `SearchModal`。
  4. `SearchModal` 完整實現任務標題、備註描述與 `#標籤` 模糊搜尋，並支援鍵盤上下鍵選擇、Enter / 點擊直接開啟任務編輯（`setEditingTaskId`）。
- **測試結果**：所有 6 項驗收項目（AC1 ~ AC6）**100% 通過 (PASS)**。
- **建置狀態**：`npm run build` Next.js 16.3.3 (Turbopack) 編譯通過，TypeScript 型別檢查 0 錯誤。

---

## 2. 驗收項目測試矩陣 (Acceptance Test Matrix)

| 編號 | 驗收項目 (Acceptance Criteria) | 測試情境與邊界條件 | 測試結果 | 狀態 |
| :--- | :--- | :--- | :--- | :--- |
| **AC1** | **Header 瘦身與兩大新增按鈕移除** | 檢視桌面與手機各寬度下 Header 區域。 | 「建立（+）」與「一鍵語音（Mic）」按鈕已完全移除，僅保留搜尋觸發與頭像，空間開闊無擠壓。 | ✅ PASS |
| **AC2** | **手機版精簡按鈕觸發 (Mobile Search Button)** | 於寬度 `< 640px` 檢視頂部導覽列。 | 原文字搜尋框隱藏，右側呈現精緻圓角搜尋按鈕圖示（`w-8 h-8 rounded-xl`），點擊瞬開 Search Modal。 | ✅ PASS |
| **AC3** | **桌機版微互動搜尋列 (Desktop Search Trigger)** | 於寬度 `≥ 640px` 點擊搜尋膠囊列或按下 `⌘K` / `Ctrl+K`。 | 順暢開啟 Command Palette 風格搜尋彈窗，搜尋框自動聚焦並反選現有文字。 | ✅ PASS |
| **AC4** | **即時搜尋與 UI 五態展示 (Search UI States)** | 輸入關鍵字過濾任務；清空輸入檢視推薦標籤；輸入無相符字串。 | 支援即時任務篩選；空輸入時呈現常用標籤按鈕；無結果時呈現清楚空狀態與建議。 | ✅ PASS |
| **AC5** | **鍵盤與點擊直達任務 (Direct Task Navigation)** | 使用 `↑` / `↓` 鍵切換選中任務並按 `Enter`，或直接點擊任一任務。 | 立即關閉搜尋彈窗，並自動開啟該任務編輯視窗（`EditTaskModal`）。 | ✅ PASS |
| **AC6** | **生產環境編譯無誤 (Production Build)** | 執行 `npm run build`。 | Next.js 16 (Turbopack) 成功構建靜態與動態路由，TypeScript 0 報錯。 | ✅ PASS |

---

# 測試驗收報告 (QA_REPORT.md) - Capacitor 原生打包與 PWA 雙軌安裝支援

## 1. 測試摘要 (Executive Summary)
- **測試目標**：
  1. 整合 Capacitor 跨平台封裝，產生可上架至 iOS App Store 與 Google Play Store 的原生專案工程（App ID: `com.voicekanban.app`，名稱：聲動看板）。
  2. 建立標準 PWA 規範，包含標準 `manifest.webmanifest`、Service Worker 離線快取（`sw.js`）、高解析度圖示與 Apple Touch Icons。
  3. 於 Header 使用者頭像下拉選單中整合「在手機安裝應用」按鈕（PWA CTA），在已安裝（Standalone / Capacitor 原生）狀態下自動隱藏，Android/Chrome 觸發系統原生安裝，iOS Safari 呈現精緻 3 步驟圖文引導彈窗（`IosInstallGuideModal`）。
- **測試結果**：所有 8 項驗收項目（AC1 ~ AC8）**100% 通過 (PASS)**。
- **建置狀態**：`npm run build` Next.js 16.3.3 (Turbopack) 編譯成功，TypeScript `tsc --noEmit` 0 錯誤通過，`npm run cap:sync` 雙平台無縫同步成功。

---

## 2. 驗收項目測試矩陣 (Acceptance Test Matrix)

| 編號 | 驗收項目 (Acceptance Criteria) | 測試情境與邊界條件 | 測試結果 | 狀態 |
| :--- | :--- | :--- | :--- | :--- |
| **AC1** | **Capacitor 雙平台專案結構 (Native Projects)** | 檢查 `ios/` 與 `android/` 專案工程及配置。 | `ios/` Xcode 專案與 `android/` Gradle 專案均成功生成，Bundle ID 皆為 `com.voicekanban.app`，應用名稱為「聲動看板」。 | ✅ PASS |
| **AC2** | **原生麥克風與網路權限配置 (Permissions Config)** | 檢查 iOS `Info.plist` 與 Android `AndroidManifest.xml`。 | iOS 配置有 `NSMicrophoneUsageDescription`；Android 配置有 `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, `INTERNET`，滿足語音轉譯需求。 | ✅ PASS |
| **AC3** | **PWA Web App Manifest 完整度 (Manifest Validation)** | 檢查 `public/manifest.webmanifest` 與 `manifest.json`。 | 包含繁中應用全名、`standalone` 顯示模式、`#f97316` 主題色標、192x192、512x512 及 maskable 圖示，符合 W3C PWA 標準。 | ✅ PASS |
| **AC4** | **Service Worker 離線快取 (SW Strategy)** | 檢查 `public/sw.js` 與 `PwaRegister.tsx`。 | 支援外殼預快取（Precache）、頁面導航 Network-First 容錯降級、靜態資源 Stale-While-Revalidate，且主動略過 `/api/` 路由不干擾動態請求。 | ✅ PASS |
| **AC5** | **頭像選單「在手機安裝應用」入口 (Menu Item)** | 點擊 Navbar 頭像開啟下拉選單。 | 於設定區塊中呈現「在手機安裝應用」選項，附帶手機圖示與橘色「PWA」微徽章，樣式優雅一致。 | ✅ PASS |
| **AC6** | **已安裝/原生環境自動隱藏 (Auto-Hide in Standalone)** | 模擬 `display-mode: standalone` 或 Capacitor 原生模式。 | 元件透過 `usePwaInstall` 正確判定 `isInstalled: true`，按鈕回傳 `null` 自動完全隱藏，維持選單乾淨。 | ✅ PASS |
| **AC7** | **iOS 3 步驟圖文導引視窗 (iOS Guide Modal)** | 於 iOS Safari 或觸發引導安裝。 | 彈出 `IosInstallGuideModal`，清楚圖文呈現「點擊底部分享 ➔ 滑動選擇加入主畫面 ➔ 右上角新增」3 個步驟與圖示說明。 | ✅ PASS |
| **AC8** | **建置與同步自動化 (Build & Sync)** | 執行 `npm run build` 與 `npm run cap:sync`。 | Turbopack 編譯 3.0s 0 錯誤通過，Capacitor 資源 0.06s 完成雙平台極速同步。 | ✅ PASS |

---

## 3. 測試結論與交付建議
Capacitor iOS & Android 雙平台工程與 PWA 離線安裝功能已全面就緒，提供無縫跨平台的行動原生與桌面體驗，建議使用者進行 `git commit` 保存版本。







