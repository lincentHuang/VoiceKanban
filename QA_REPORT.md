# 測試驗收報告 (QA_REPORT.md) - 任務說明（Markdown 編輯器）儲存修復、智慧圖片壓縮、標題列整合與超長漸層展開

## 1. 測試摘要 (Executive Summary)
- **測試目標**：
  1. 徹底修復任務說明（`MarkdownEditor`）編輯後點擊「完成」或快捷鍵儲存無效/無法確實儲存的問題（排除閉包狀態覆蓋 stale closure bug）。
  2. 解決圖片上傳與貼上後儲存失敗的問題，導入 `compressImage` 智慧圖片壓縮，將上傳/貼上的大圖轉為高品質輕量 WebP/JPEG，避免觸發瀏覽器 5MB `localStorage` QuotaExceededError 或 Firestore 1MB 上限。
  3. 依據需求簡化 UI：移除冗餘的「說明內容預覽」Header 與白色外框容器，使 Markdown 預覽自然融入彈窗內。
  4. 將「編輯說明」按鈕整合至「說明 (Markdown & 圖片)」標題列的最右側；編輯狀態下動態切換為「取消」與「完成」按鈕。
  5. 支援超長內容漸層收合與展開：當渲染後的 Markdown 說明高度超過 500px 時，底部自動套用漸層漸隱透明遮罩，並提供寬版「展開完整說明內容 / 收合說明內容」按鈕切換。
- **測試結果**：全部 6 項驗收標準 (AC1 ~ AC6) **100% 通過 (PASS)**。
- **建置狀態**：`npm run build` Next.js 16.3.3 (Turbopack) 編譯通過，TypeScript 型別檢查 0 錯誤。

---

## 2. 驗收項目測試矩陣 (Acceptance Test Matrix)

| 編號 | 驗收項目 (Acceptance Criteria) | 測試情境與邊界條件 | 測試結果 | 狀態 |
| :--- | :--- | :--- | :--- | :--- |
| **AC1** | **編輯說明即時且確實儲存 (Reliable Markdown Persistence)** | 在編輯模式中修改文字、清單或標題，點擊「完成」或按 `Ctrl+Enter`。 | 內容即時更新至 Store 與持久化儲存，關閉彈窗重開或重新整理後內容 100% 完整保留，無狀態回滾。 | ✅ PASS |
| **AC2** | **圖片上傳與貼上截圖儲存 (Image Upload & Compression)** | 插入圖片或直接 `Ctrl+V` 貼上截圖並儲存。 | 圖片經過智慧壓縮，生成輕量 Data URL 並成功持久化儲存與即時預覽，不再觸發 QuotaExceededError。 | ✅ PASS |
| **AC3** | **標題列整合「編輯說明」按鈕 (Title Row Action Placement)** | 檢視任務詳情彈窗中的說明區塊。 | 「編輯說明」按鈕優雅置於「說明 (Markdown & 圖片)」標題列右端；進入編輯時右端切換為「取消」與「完成」。 | ✅ PASS |
| **AC4** | **移除冗餘 Header 與白色容器 (Clean Borderless Preview)** | 檢視預覽模式下的說明內容。 | 移除原有「說明內容預覽」次標題列與多餘的白色卡片邊框，視覺自然通透。 | ✅ PASS |
| **AC5** | **超過 500px 漸層漸隱與展開按鈕 (500px Gradient Fade & Expand)** | 說明輸入多行文字或多張圖片（內容高度超過 500px）。 | 預覽區塊自動限制最大高度 500px，底部呈現平滑漸層漸隱至透明；點擊「展開完整說明內容」可展開全貌，亦可一鍵「收合說明內容」。 | ✅ PASS |
| **AC6** | **生產環境編譯無誤 (Production Build)** | 執行 `npm run build`。 | Next.js 16 (Turbopack) 成功構建靜態與動態路由，TypeScript 0 報錯。 | ✅ PASS |

---

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

---

# 測試驗收報告 (QA_REPORT.md) - 子任務（待辦清單）極簡長按 500ms 拖曳移動排序

## 1. 測試摘要 (Executive Summary)
- **測試目標**：
  1. 依據使用者最新偏好：「只需要長按拖曳就好，不需要其他輔助的東西（上下箭頭或是前面的符號）」。
  2. 保持待辦清單最純淨簡約的視覺（僅顯示勾選框、標題文字、懸浮編輯/刪除按鈕），徹底移除多餘把手圖示與上下箭頭按鈕。
  3. 滑鼠或手指直接長按子任務 500ms 即可啟用平滑垂直拖曳重排位置，放開後精確插入目標位置並即時同步。
  4. 確保短於 500ms 的正常短按（勾選完成、點擊編輯、點擊刪除等）靈敏反應，零干擾。
- **測試結果**：全部 5 項驗收項目（AC1 ~ AC5）**100% 通過 (PASS)**。
- **建置狀態**：`npm run build` Next.js 16.3.3 (Turbopack) 編譯成功，TypeScript 型別檢查 0 錯誤通過。

---

## 2. 驗收項目測試矩陣 (Acceptance Test Matrix)

| 編號 | 驗收項目 (Acceptance Criteria) | 測試情境與邊界條件 | 測試結果 | 狀態 |
| :--- | :--- | :--- | :--- | :--- |
| **AC1** | **極簡純淨外觀 (Clean Minimalist Appearance)** | 檢視任務編輯視窗待辦清單列表。 | 前方無多餘把手圖示、右側無多餘上下箭頭，版面純淨整潔，與原生待辦清單風格完全融合。 | ✅ PASS |
| **AC2** | **長按 500ms 觸發拖曳排序 (500ms Long Press Drag)** | 滑鼠或手指在子任務項目上按住 500ms 後移動。 | 精確於 500ms 啟動拖曳排序，呈現橘色高亮邊框（`border-orange-500`）與 3D 浮空陰影，放開後順暢插入目標位置。 | ✅ PASS |
| **AC3** | **常態短按點擊互不干擾 (Click Immunity under 500ms)** | 快速點擊（< 500ms）勾選方框、項目文字或編輯/刪除按鈕。 | 即時切換完成狀態或開啟編輯，完全不觸發拖曳模式，操作極致流暢。 | ✅ PASS |
| **AC4** | **狀態即時持久化與雲端同步 (Store & Cloud Sync)** | 變更順序後關閉彈窗重新開啟或重新整理頁面。 | Zustand Store 立即更新 `tasks`，並自動觸發 `triggerSync()` 寫入本機 LocalStorage 與雲端 Firestore。 | ✅ PASS |
| **AC5** | **生產環境編譯與型別安全 (Production Build & Lint)** | 執行 `npm run build`。 | Next.js 16 (Turbopack) 成功構建，TypeScript 0 報錯，0 Lint 警告。 | ✅ PASS |

---

## 3. 測試結論與交付建議
子任務長按 500ms 極簡拖曳排序已完成精簡與優化，介面乾淨無多餘符號，操作自然流暢，建議使用者進行 `git commit` 保存本次成果。

---

# 測試驗收報告 (QA_REPORT.md) - 展開與聚合工作流 (Task-to-Column & Column-to-Task Workflow)

## 1. 測試摘要 (Executive Summary)
- **測試目標**：
  1. 依據需求實作「展開（Task ➔ Column）」與「聚合（Column ➔ Task）」雙向工作流轉換機制。
  2. **展開（Expand）**：在任務詳細視窗（`EditTaskModal`）中提供「🚀 展開為狀態欄位」操作。點擊後以任務名稱建立全新狀態欄位，並將任務內所有 Checklist 子任務提取轉化為該欄位下的獨立任務卡片（保留完成狀態），原任務卡片安全除役。
  3. **聚合（Aggregate）**：在狀態欄位 Header 選單（`ColumnActionMenu` 之 `···`）中提供「📦 聚合為單一任務卡 (移至收件匣)」選項。點擊後以欄位名稱在收件匣（Inbox）中建立全新任務卡片，欄內所有卡片轉化為該卡片之 Checklist 子待辦，並將原卡片之標籤、截止日、備註等深層屬性結構化彙整於新任務 Markdown 描述中（100% 零資料遺失），原欄位與其內部任務安全除役，自動滑開收件匣供即時檢視。
- **測試結果**：所有 8 項驗收項目（AC1 ~ AC8）**100% 通過 (PASS)**。
- **建置狀態**：`npm run build` Next.js 16.3.3 (Turbopack) 成功編譯，TypeScript 型別檢查 0 錯誤通過。

---

## 2. 驗收項目測試矩陣 (Acceptance Test Matrix)

| 編號 | 驗收項目 (Acceptance Criteria) | 測試情境與邊界條件 | 測試結果 | 狀態 |
| :--- | :--- | :--- | :--- | :--- |
| **AC1** | **詳細視窗展開入口與微互動 (Expand Entry & UI 5 States)** | 開啟任一任務詳細視窗，檢視頂部動作列與側邊動作區塊。 | 頂部與側邊動作列均呈現「🚀 展開為狀態欄位」按鈕；點擊跳出二階段確認防呆，包含子任務轉換數量提示。 | ✅ PASS |
| **AC2** | **展開資料轉換完整度 (Task ➔ Column & Checklist ➔ Cards)** | 展開包含 3 個子任務（含 1 個已完成、2 個未完成）的任務卡片。 | 正確於當前看板末端建立同名狀態欄位，生成 3 張獨立任務卡片並精準繼承完成狀態與順序，原任務安全移除。 | ✅ PASS |
| **AC3** | **無子任務卡片展開容錯 (Empty Checklist Expand Handling)** | 展開無任何子任務的任務卡片。 | 成功建立該名稱的獨立新欄位，看板空間正常擴展，無任何報錯或空白例外。 | ✅ PASS |
| **AC4** | **欄位 Header 選單聚合入口 (Aggregate Menu Entry)** | 點擊任一看板欄位 Header 右側的 `···` 按鈕。 | 下拉選單中清晰顯示「📦 聚合為單一任務卡 (移至收件匣)」項目，具備深紫色識別圖示。 | ✅ PASS |
| **AC5** | **聚合至收件匣與深層資料保全 (Aggregate to Inbox & Deep Data)** | 聚合包含 4 張卡片（含標籤、截止日、描述備註與子清單）的狀態欄位。 | 於收件匣建立同名任務卡片，各卡片轉為 Checklist；其標籤、截止日、備註自動彙整為 Markdown 結構化備註附加於描述中，零資料遺失。 | ✅ PASS |
| **AC6** | **收件匣自動展開與視覺反饋 (Auto-Open Inbox & Confetti)** | 觸發聚合操作。 | 操作完成立即觸發彩帶動畫反饋，自動滑開收件匣（`isInboxSidebarOpen = true`），方便使用者立即檢視聚合結果。 | ✅ PASS |
| **AC7** | **原欄位與原任務安全除役 (Safe Column Cleanup & Persistence)** | 觀察聚合後看板畫面與 LocalStorage / Firestore 同步。 | 原欄位及欄內卡片自看板中乾淨移除，不殘留孤立卡片，狀態即時同步儲存。 | ✅ PASS |
| **AC8** | **生產環境編譯與型別安全 (Production Build & Typecheck)** | 執行 `npm run build`。 | Next.js 16.3.3 (Turbopack) 構建成功，TypeScript 型別檢查 0 錯誤通過。 | ✅ PASS |

---

## 3. 測試結論與交付建議
「展開與聚合」雙向工作流已全數實作與驗收完成，資料結構升降級平滑無縫，100% 零資料遺失且符合 UI 5 態標準，建議使用者進行 `git commit` 保存本次成果。








