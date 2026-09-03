# 🌟 智慧型 AI 任務管理看板 (AI-Powered Kanban) - 產品需求規格書 (Master PRD)

> **文檔屬性**：**產品全貌需求規格書 (Living Master Document)**  
> **維護原則**：本 PRD 為系統**當前所有現存功能模組之全景規格概述**，每次需求變更皆以「增量演進」方式整合至全域架構中，**絕非單次任務的執行紀錄或 Sprint 日誌**。各功能模組之專屬規格、UI 五態與驗收細節另收錄於各 `src/features/<feature>/feature.md`。

---

## 1. 產品願景與全貌概述 (Product Vision & Executive Summary)

本產品是一套專為現代敏捷工作者、個人開發者與高效團隊打造的**「AI 原生智慧任務管理看板（AI-Powered Task Management System）」**。
核心特色包含：
1. **多模態極速輸入**：支援 Web Speech API 語音擷取、Gemini AI 智慧自然語言結構化拆解，以及單行自然語言速記。
2. **極致流暢看板體驗**：支援毫秒級 Base36 Lexorank 排序、跨欄即時預覽插槽（Drop Slot Indicator）與平滑防抖雙向拖曳。
3. **雙維度核心檢視**：提供看板（Kanban）與行事曆（Calendar）雙視圖隨心切換。
4. **Local-First & 雲端雙軌同步**：支援訪客本機離線優先使用，並可一鍵升級綁定 Google / Email 帳號無縫同步至 Firestore。
5. **BYOK 隱私安全**：支援自帶 Google Gemini API Key（BYOK），採客戶端 AES 加密保障個人隱私。

---

## 2. 系統架構與前端目錄規範 (System Architecture & Folder Structure)

本專案採用 **Next.js Feature-Driven (垂直切片模組化)** 前端架構：

```text
src/
├── app/                        # Next.js App Router (頁面路由與 API Handlers)
│   ├── api/voice/extract/      # Gemini AI 語音結構化解析 API
│   ├── api/user/key/           # BYOK API Key 加密儲存/檢驗 API
│   ├── page.tsx                # 主應用入口
│   └── globals.css             # 全域 Tailwind CSS 與主題變數
├── features/                   # 業務功能模組 (Feature Modules)
│   ├── auth/                   # [Feature 1] 使用者認證與會話管理
│   │   ├── components/         # AuthLandingScreen, AuthModal, BindAccountModal
│   │   ├── index.ts            # 模組統一出口
│   │   └── feature.md          # 認證功能全貌規格與 AC
│   ├── kanban/                 # [Feature 2] 看板核心、卡片、狀態列拖曳、右側新增欄位與批次操作
│   │   ├── components/         # BoardCanvasContainer, KanbanContainer, KanbanColumn, TaskCard, Add/Edit Modal...
│   │   ├── index.ts            # 模組統一出口
│   │   └── feature.md          # 看板功能全貌規格與 AC
│   ├── inbox/                  # [Feature 3] 快速收件匣與工作區分割
│   │   ├── components/         # SidebarInbox
│   │   ├── index.ts            # 模組統一出口
│   │   └── feature.md          # 收件匣功能全貌規格與 AC
│   ├── voice/                  # [Feature 4] AI 語音擷取與自然語言解析
│   │   ├── components/         # VoiceFAB, VoiceCaptureOverlay, AudioVisualizer
│   │   ├── index.ts            # 模組統一出口
│   │   └── feature.md          # 語音功能全貌規格與 AC
│   ├── quick-prompt/           # [Feature 5] 頂部自然語言快速速記
│   │   ├── components/         # QuickPromptHero
│   │   ├── index.ts            # 模組統一出口
│   │   └── feature.md          # 速記功能全貌規格與 AC
│   ├── views/                  # [Feature 6] 行事曆視圖 (Calendar View)
│   │   ├── components/         # CalendarView
│   │   ├── index.ts            # 模組統一出口
│   │   └── feature.md          # 行事曆視圖全貌規格與 AC
│   ├── settings/               # [Feature 7] 使用者設定與 BYOK 金鑰加密
│   │   ├── components/         # SettingsModal
│   │   ├── index.ts            # 模組統一出口
│   │   └── feature.md          # 設定功能全貌規格與 AC
│   └── editor/                 # [Feature 8] Markdown 任務筆記編輯器
│       ├── components/         # MarkdownEditor
│       ├── index.ts            # 模組統一出口
│       └── feature.md          # 編輯器功能全貌規格與 AC
├── components/                 # 全域共用 UI 元件
│   ├── ui/                     # 基礎原子元件 (Dialog, Dropdown, Select, Popover...)
│   ├── layout/                 # 全域版面 (UnifiedDnDWorkspace, WorkspaceSplitter)
│   ├── navbar/                 # 全域頂部導覽列
│   ├── navigation/             # 全域底部浮動 Dock (精簡收件匣/看板/行事曆)
│   ├── toolbar/                # 全域子工具列
│   ├── common/                 # 全域共用複合元件 (DateTimePicker)
│   └── brand/                  # 品牌 Logo
└── core/                       # 全域核心底層
    ├── types/                  # 全域資料型別契約 (task, voice, auth, user, ui)
    ├── stores/                 # Zustand 全域狀態中心 (useKanbanStore)
    ├── services/               # 雲端與本機服務 (firebase, gemini, syncService, learningEngine...)
    └── utils/                  # 工具函式 (lexorank, dateUtils, crypto, cn)
```

---

## 3. 全域核心功能模組矩陣 (Master Feature Matrix)

### 3.1 🔐 使用者認證與資料漫遊 (Auth Feature)
- **訪客模式 (Guest First)**：無需註冊直接上手，資料持久化於 LocalStorage。
- **多渠道登入 (Multi-Provider)**：支援 Google OAuth 與 Email 密碼登入。
- **無縫帳號綁定 (Seamless Account Binding)**：訪客建立之資料可隨時綁定至正式雲端帳號，資料零遺失。

### 3.2 📋 看板、狀態列拖曳與雙向拖曳引擎 (Kanban & DnD Feature)
- **狀態列欄位拖曳重排 (Column DnD Reorder)**：支援抓住欄位 Header（或長按 200ms）進行水平平滑拖曳排序，即時預覽換位並持久化順序。
- **狀態流程管理視窗拖曳排序與 Popover 圖示選擇**：在 `ColumnManagerModal` 中支援按住 `⋮⋮` 垂直拖曳（Drag & Drop）直覺調整順序；圖示選擇器採用小巧 Popover 彈窗取代傳統下拉選單，並支援「無圖示 (純文字)」選項。
- **已完成任務底部折疊收合 (Collapsible Completed Tasks at Column Bottom)**：各狀態欄位內的已完成任務（`completed: true`）自動沉底排列至最下方，預設收合為「已完成任務 (N)」精緻折疊條；點擊可流暢展開/收合查看，展開後支援卡片全功能查看與正常拖曳排序。
- **最右側行內極速新增欄位 (Inline Column Creation)**：看板橫向末端提供「+ 新增欄位」卡片，行內輸入名稱 Enter 立即建立新狀態欄位。
- **卡片即時預覽插槽與幽靈佔位 (Live Drop Slot & Ghost Card Placeholder)**：
  - 拖曳卡片時，原始欄位保持本體幽靈佔位（Ghost Placeholder，`opacity-35`），徹底杜絕欄位高度瞬間塌陷所導致的跳動與版面位移。
  - 目標切入位置以**簡約素雅灰色塊（Subtle Gray Drop Block）**呈現清晰插槽，高度適中（`h-12`），取代過粗線條或過大方塊。
  - 目標欄位維持常態優雅底色與邊框，不出現干擾性橘色高亮外框。
  - **跨欄拖曳極速頂部定位**：由其他欄位或側邊收件匣拖入新欄位時，預覽插槽與落點直接固定為該欄位最頂端第一個（Index 0），確保視覺位置一致且免除跨欄位移錯置。
- **精準中線切入與平滑防抖碰撞策略**：同欄排序結合 `pointerWithin` 與卡片垂直中線（Midpoint Thresholding）幾何判定，拖至最頂端、兩張卡片縫隙或最底端皆能 100% 精準切入，杜絕快速拖曳時跳欄震盪，並完美分離 Column 與 Task 拖曳。
- **Lexorank Base36 排序鍵**：毫秒級任意區間卡片插入，避免大量全量更新。
- **欄位管理、全欄位柔和色彩與 WIP 上限**：支援自訂欄位名稱、柔和淺色系全欄位主題色調（取代單一線條，呈現精緻底色與邊框）、排序與在製品（WIP）超額警示。
- **多選與批次操作 (Batch Actions & Mobile Responsive Bar)**：
  - 支援多選卡片，一鍵批次搬移欄位、變更優先級、完成與刪除。
  - **響應式兩行佈局 (Mobile Two-Line Layout)**：於手機小螢幕下（`< sm`），底部浮動 `BatchActionBar` 自動切換為雙行卡片佈局（第一行：選取計數與退出多選按鈕；第二行：移動至、優先級、未完成、完成與刪除動作列），徹底杜絕按鈕壓縮換行跑版，桌機寬螢幕（`≥ sm`）則維持俐落單行膠囊列。
- **手機版看板磁力滑動置中與邊緣懸停磁吸切換 (Mobile Scroll Snap & Edge Magnet Drag Navigation)**：
  - 手機版（小螢幕）瀏覽時，看板欄位具備 CSS磁力吸附（`snap-x snap-mandatory`），滑動時各狀態欄位自動於螢幕中央吸附置中（`snap-center`），並以 `84vw` 寬度提供鄰近欄位露邊預覽。
  - 拖曳動線無縫優化：卡片拖曳期間取消連續性左右橫向滾動（防止拖曳過程畫面晃動或微飄），**完全由「拖曳至右側/左側邊緣懸停約 1 秒（800ms）」精準觸發畫面直接平滑磁吸切換至下一個/上一個欄位**，並搭配即時邊緣微光指引。

---

## 3.3 📥 快速收件匣 (Inbox Feature)
- **側邊可收合收件匣**：支援 WorkspaceSplitter 滑鼠拖曳即時調整寬度（240px ~ 480px）。
- **雙向自由拖曳**：可從收件匣拖曳卡片至看板任意位置，或將看板卡片暫存回收件匣。
- **單行極速新增**：支援鍵盤 Enter 即時加入待辦。

### 3.4 🎙️ AI 語音擷取與智慧解析 (Voice & AI Extraction)
- **即時錄音與聲波視覺化**：Web Speech API 結合 Web Audio API 動態頻譜波形。
- **Gemini 結構化萃取**：自動推斷任務名稱、時間（相對日期轉 ISO）、優先級、目標欄位、標籤與子步驟。
- **多任務自動拆解**：一句話講述多項事務自動分割為多張獨立卡片。
- **本機 Local NLP 備援**：離線或無 API Key 時無縫降級本機正規分析。
- **回饋學習引擎 (Learning Engine)**：根據使用者手動修正行為學習欄位分配偏好。

### 3.5 ⚡ 快速自然語言指令輸入 (Quick Prompt Feature)
- **頂部/Hero 自然語言速記**：支援文字直接輸入如「後天下午 3 點 提交報告 #work !urgent」，秒級建立。
- **一鍵切換語音**：輸入框直通語音浮層。

### 3.6 📊 雙重視圖切換 (Views Feature)
- **Kanban Board**：泳道卡片流動檢視，支援欄位拖曳排序與行內新增欄位。
- **Calendar View**：月度/週度時間排程視覺化。
- **全域同步篩選**：標籤與關鍵字搜尋在看板與行事曆即時聯動。
- **精簡架構**：已徹底移除不便使用之 Table View 與 List View，專注極致看板與日曆體驗。

### 3.7 ⚙️ 設定中心與 BYOK 加密 (Settings & Security)
- **BYOK (Bring Your Own Key)**：支援使用者填入自訂 Google Gemini API Key，採本機 AES 加密存儲。
- **AI 模型切換**：可選擇 Gemini 2.5 Flash / Pro 及預設辨識語系。
- **外觀偏好**：深色模式 (Dark)、淺色模式 (Light)、系統自動跟隨。

### 3.8 📝 Markdown 任務筆記與子任務待辦清單 (Markdown Notes & Checklists)
- **極簡內嵌式說明排版 (Clean Inline Layout)**：
  - 移除冗餘的多層卡片白底容器與「說明內容預覽」次標題列，視覺自然融入任務詳情彈窗中。
  - 將「編輯說明」功能按鈕整合置於「說明 (Markdown & 圖片)」標題列的最右端，編輯模式下切換為「取消」與「完成」按鈕。
- **超長內容漸層收合與展開 (Gradient Fade Collapse & Expand)**：
  - 當渲染後的說明 Markdown 內容高度超過 500px 時，自動啟用漸層漸隱到底部透明遮罩，並提供寬版「展開完整說明內容 / 收合說明內容」按鈕切換。
- **雙模切換與即時儲存防護 (Edit/Preview & Safe Persistence)**：
  - 支援即時編輯（Write）與渲染預覽（Preview），修正狀態閉包覆蓋問題，確保點擊「完成」或使用快捷鍵時即時持久化更新至 Store 與資料庫。
  - **智慧圖片壓縮與超額防護**：上傳或貼上圖片時自動調用 Canvas 進行高畫質 WebP/JPEG 壓縮，解決瀏覽器 localStorage 容量上限（5MB QuotaExceededError）與 Firestore 單檔大小限制問題。
- **工具列支援**：粗體、斜體、刪除線、清單、代碼、標題、圖片上傳一鍵插入。
- **子任務待辦清單 (Checklists)**：
  - **長按 500ms 拖曳上下移動與排序 (500ms Long Press Reorder)**：極簡純淨視覺，無需多餘上下箭頭或把手符號，手指或滑鼠直接長按子任務 500ms 即可啟用平滑垂直拖曳排序，放開即更新位置並持久化。
  - **常態短按防誤觸**：小於 500ms 的短按即時切換完成狀態勾選或雙擊編輯，互不干擾。
  - **進度百分比條 (Progress Bar)**：即時連動已完成子任務數量與完成率百分比。
  - **行內快速編輯與刪除**：支援點擊鉛筆或雙擊修改項目名稱，Enter 儲存、Escape 取消。


### 3.9 🔍 響應式搜尋與 Search Modal (Search Feature)
- **Header 瘦身與空間專注**：全面移除頂部 Header 上的「建立（+）」與「一鍵語音（Mic）」按鈕，使 Header 回歸純粹的導覽與搜尋功能。
- **全響應式搜尋觸發體驗**：
  - **桌機版（`≥ sm`）**：搜尋列設計為微互動膠囊列觸發器（含 `⌘K` 快捷鍵提示），點擊或鍵盤輸入瞬開 Search Modal。
  - **手機版（`< sm`）**：搜尋列轉為右上角精緻搜尋按鈕圖示，徹底消除小螢幕空間不足導致輸入框被擠壓變形的問題。
- **Command Palette 風格 Search Modal**：
  - 自動聚焦搜尋輸入框、支援即時關鍵字模糊過濾（任務標題、內文描述、標籤）。
  - 嚴格落實 UI 5 態（引導空狀態、無相符結果狀態、即時結果清單、鍵盤選取高亮態）。
  - 任務卡片結果直觀呈現所屬欄位色標、標籤、截止日與星號，點擊可直接開啟任務詳情編輯（`setEditingTaskId`）或一鍵在看板中套用篩選。

### 3.10 📱 行動端封裝、Capacitor App 與 PWA (Mobile App & PWA Feature)
- **Capacitor 跨平台雙平台原生封裝 (iOS & Android Native Container)**：
  - 應用識別碼 (App ID / Bundle ID)：`com.voicekanban.app`，中文應用顯示名稱：**「聲動看板」**。
  - 混合容錯雙軌架構：建立完整 `capacitor.config.ts`，支援本地靜態包裝與生產伺服器 API 容錯代理，解決 Next.js Route Handlers（語音辨識、BYOK 驗證）於原生端運行之需要。
  - 原生權限與設備適配：配置 iOS `Info.plist`（`NSMicrophoneUsageDescription`）與 Android `AndroidManifest.xml`（`RECORD_AUDIO`, `INTERNET`），確保語音輸入無縫啟用；適配行動裝置 Safe Area Insets（動態島與底部 Home Bar 避讓）。
- **全規格 Progressive Web App (PWA) 支援**：
  - 標準 Web App Manifest（`manifest.webmanifest`）：包含繁中完整名稱、短名稱、主題色標（`#f97316` 橘色與白底）、192x192 / 512x512 高解析度圖示與 Maskable 圖示，支援 `standalone` 獨立全螢幕運行模式。
  - 輕量強健 Service Worker 快取（`public/sw.js`）：離線快取關鍵資源、網路優先降級策略，提供斷網狀態下的平滑快取展示。
  - 完整 iOS Web App Meta Tags：支援 `apple-mobile-web-app-capable`、`apple-mobile-web-app-status-bar-style`、動態主題色與 Apple Touch Icons。
- **頭像設定選單整合「在手機安裝應用」按鈕 (Install PWA Call-to-Action)**：
  - **位置與入口**：位於頂部 Navbar 點擊使用者頭像後的下拉選單（設定區塊），提供直觀的「在手機安裝應用」選項（手機圖示與 PWA 標籤）。
  - **智慧環境狀態偵測 (自動隱藏)**：當偵測到使用者已在獨立 PWA 模式（`display-mode: standalone`）或 Capacitor 原生 App 容器內執行時，自動隱藏該按鈕，維持選單純淨。
  - **雙軌平台安裝體驗 (Dual-Platform Flow)**：
    - **Android / 桌面 Chrome / Edge**：攔截並保存 `beforeinstallprompt` 事件，點擊按鈕直接觸發系統原生「安裝應用程式」視窗。
    - **iOS Safari**：針對 Safari 無法自動觸發安裝之系統限制，點擊後彈出精緻 3 步驟圖文導引彈窗（`IosInstallGuideModal`），圖示化指引使用者點擊底部「分享 ⎋」➔ 滑動點擊「加入主畫面 ➕」➔ 右上角「新增」。

### 3.11 🚀 展開與聚合工作流 (Expand & Aggregate Feature)
- **任務卡片展開為獨立狀態欄位 (Expand Task to Column)**：
  - **觸發入口**：任務詳細編輯視窗 (`EditTaskModal`) 頂部動作列，提供「🚀 展開為狀態欄位」專屬按鈕。
  - **轉換機制**：
    - 主任務標題無縫升級為當前看板之全新狀態欄位（Column）。
    - 任務內含之 Checklist 子任務逐條提取並轉化為該欄位底下的獨立任務卡片，並保留各自已完成/未完成（`completed`）勾選狀態與順序。
    - 若無子任務，則自動生成該名稱的空欄位，供使用者後續填充。
    - 原主任務自看板中安全升級除役，並關閉編輯視窗，即時觸發雲端與本地同步。
- **狀態欄位聚合為單一任務卡片 (Aggregate Column to Task)**：
  - **觸發入口**：看板各狀態欄位 Header 之「更多選單 `···`」(`ColumnActionMenu`)，提供「📦 聚合為單一任務卡片（移至收件匣）」選項。
  - **轉換機制**：
    - 該狀態欄位名稱轉化為新任務卡片標題。
    - 欄位內的所有任務卡片依序轉化為新卡片內之 Checklist 子任務清單（保留其完成狀態）。
    - **深層資料零遺失 (Deep Data Preservation)**：若原欄位內之各卡片含有標籤、到期日、內文描述或多層資訊，系統自動彙整為 Markdown 結構化備註附加至新任務描述中。
    - 聚合生成之任務卡片自動移入 **收件匣 (Inbox)**，並即時自動滑開收件匣側邊欄以供檢視。
    - 原看板欄位及其內部所有卡片安全清除除役，順暢釋放看板空間。

### 3.12 📴 Local-First 離線模式與 PWA 離線作業 (Offline Mode & Resilient Sync)
- **Local-First 零延遲離線作業**：
  - 離線時（無網路或手動啟用離線模式）完全開放卡片之建立、編輯、刪除、跨欄拖曳、子清單排序、搜尋與視圖切換，所有操作立即持久化於 LocalStorage，零延遲不卡頓。
  - **離線變更佇列（Pending Sync Queue）**：離線進行之任何狀態變更自動計入未同步隊列，確保變更紀錄不遺失。
- **斷網偵測與全域視覺反饋 (Offline Indicator & Dynamic Banner)**：
  - **頂部 Navbar 離線徽章**：當斷網時，Navbar 顯示精緻的「離線中」狀態膠囊，並動態呈現「待同步 N 筆變更」。
  - **柔和頂部離線提示橫幅 (OfflineBanner)**：斷網瞬間於頂部滑出優雅提示列（顯示「目前為離線工作模式，所有修改已暫存本機，連線後將自動同步」），支援一鍵手動重試或關閉；連線恢復時 Toast 提示「已恢復連線，雲端資料同步完成」。
- **自動連線偵測與背景批次同步 (Auto Reconnect & Sync Engine)**：
  - 自動監聽瀏覽器 `online` / `offline` 事件。當網路恢復時，自動無縫批次觸發雲端同步（Last-Write-Wins 與欄位合併），更新完成後清空待同步佇列。
- **離線 AI 與文字速記降級策略 (Offline Local NLP Fallback)**：
  - 離線時文字速記自動轉由 **本機 Local NLP 正則解析器** 處理，辨識時間、優先級與標籤，秒級建立結構化任務並標註「⚡ 離線本機解析」；語音辨識不可用時提供友善文字輸入引導。
- **設定中心「離線工作模式」開關 (Manual Offline Toggle in Settings)**：
  - 在「系統設定」與使用者選單中提供手動「離線工作模式」開關，方便使用者在連線環境下亦可主動啟用無干擾純本機離線作業或進行離線測試。
- **PWA Service Worker 強健離線快取 (Enhanced PWA Service Worker)**：
  - 加強 `public/sw.js`：預先快取核心外殼資源、應用靜態檔案 (`/_next/static/`) 與離線頁面；對 HTML 導覽實施 Network-First 降級 Cache 策略，靜態檔案 Stale-While-Revalidate，確保在完全斷網環境下重新整理網頁仍可 100% 完整載入應用。

---

## 4. UI 5 種狀態處理規範 (5 UI States Standard)

系統所有前端 UI 元件必須嚴格遵守以下 5 種狀態規範：
1. **Loading**：請求或運算中提供骨架屏（Skeleton）或平滑 Spinner，防止重複觸發。
2. **Empty**：無資料時呈現引導性插圖、空狀態文案與一鍵新增按鈕。
3. **Error**：異常時提供明確中文錯誤提示、重試機制與樂觀更新回滾（Optimistic Rollback）。
4. **Success**：操作完成時給予震動、Toast 通知或微動畫確認反饋。
5. **Active / Interactive**：選取、聚焦、拖曳中提供高亮邊框、微光與陰影景深。

---

## 5. 全域驗收標準 (Master Acceptance Criteria, Master AC)

- [x] **MAC-1 (全模組 Feature-Driven 結構清晰)**：前端遵循 `src/features/<feature>/` 模組化規範，每個模組均具備專屬 `feature.md` 與獨立出口 `index.ts`。
- [x] **MAC-2 (看板卡片與狀態列拖曳穩定)**：支援卡片跨欄與欄內拖曳（含即時預覽插槽）以及狀態列 Header 長按/拖曳橫向排序，順序即時持久化。
- [x] **MAC-3 (最右側行內新增欄位)**：看板橫向末端提供「+ 新增欄位」行內卡片，輸入名稱 Enter 即刻建立。
- [x] **MAC-4 (檢視精簡與 Dock 淨化)**：精簡為看板與行事曆雙視圖，底部 Dock 僅保留收件匣、看板、行事曆，移除欄位設定按鈕。
- [x] **MAC-5 (多模態語音與 AI 解析)**：支援語音輸入與 Gemini AI / 本機 NLP 結構化任務解析及多任務拆解。
- [x] **MAC-6 (認證與多端同步)**：支援訪客模式與 Firebase Google/Email 登入綁定，離線優先並同步至雲端。
- [x] **MAC-7 (安全 BYOK 與設定)**：支援本機加密儲存自訂 Gemini API Key，連線測試正常。
- [x] **MAC-8 (已完成任務底部折疊收合)**：各狀態欄位內的已完成任務自動沉底並預設折疊收合，點擊平滑展開查看與支援拖曳。
- [x] **MAC-9 (編譯與型別無誤)**：`npm run build` 與 TypeScript 型別檢查 100% 通過。
- [x] **MAC-10 (手機版看板磁力置中與拖曳邊緣切換)**：手機版左右滑動具備磁力吸附自動置中（`snap-center`），卡片拖曳期間不卡頓且懸停邊緣約 1 秒自動磁吸平滑切換至下一欄/上一欄。
- [x] **MAC-11 (看板卡片上下動態像素切入判定與邊界免空白空間)**：拖曳卡片至目標卡片上下邊緣動態像素/百分比閥值時精確判定插入點，頂部卡片上緣必定切入最上方（Index 0），底部卡片下緣必定切入最下方（Index Max），無需預留空白即可流暢插入。
- [x] **MAC-12 (Header 瘦身與全響應式 Search Modal 搜尋體驗)**：Header 成功移除「建立」與「一鍵語音」按鈕；桌機版點擊搜尋框或按 `⌘K` 開啟 Search Modal；手機版自動轉為右上角按鈕圖示開啟 Modal，輸入框不被擠壓，搜尋支援即時任務過濾與直接開啟編輯。
- [x] **MAC-13 (Capacitor 跨平台雙平台專案與設定)**：整合 `@capacitor/core`、`@capacitor/cli`、`@capacitor/ios` 與 `@capacitor/android`，完成 `capacitor.config.ts`（App ID: `com.voicekanban.app`，名稱: 聲動看板），生成標準 `ios/` 與 `android/` 專案工程，配置麥克風權限與雙平台建置指令。
- [x] **MAC-14 (PWA 標準支援與 Service Worker 離線快取)**：具備合法 `manifest.webmanifest`、各尺寸高解析度圖示、全螢幕獨立模式、iOS Safe Area Insets、以及 `public/sw.js` 資源快取與自動註冊。
- [x] **MAC-15 (頭像選單 PWA 安裝按鈕與雙軌引導體驗)**：在 Navbar 頭像下拉選單中提供「在手機安裝應用」選項；若處於 Standalone/原生 App 模式則自動隱藏；Android/Chrome 觸發系統安裝視窗，iOS Safari 彈出 3 步驟圖文導引視窗（`IosInstallGuideModal`），符合 UI 5 態規範。
- [x] **MAC-16 (子任務待辦清單極簡長按 500ms 拖曳移動排序)**：任務編輯視窗中的子任務清單維持無多餘符號與箭頭的純淨外觀，長按 500ms 即可啟用平滑垂直拖曳排序，短按快速切換勾選完成，資料即時持久化與雲端同步。
- [x] **MAC-17 (任務卡片與狀態欄位雙向展開與聚合工作流)**：任務詳細視窗支援一鍵將卡片與其子清單「展開」為獨立看板欄位；欄位 Header 選單支援一鍵將整個欄位「聚合」為單一任務卡片並安全收納至收件匣（Inbox），且完整保留原卡片深層屬性與子任務勾選狀態。
- [x] **MAC-18 (全功能 Local-First 離線模式與 PWA 斷網快取)**：支援在斷網與手動離線模式下自由進行所有卡片 CRUD、拖曳排序、筆記與子清單編輯；具備頂部 Navbar 離線膠囊徽章與滑入式柔和提示橫幅；變更計入離線佇列，連線後自動重試同步至雲端；PWA Service Worker 支援離線快取與導覽降級，斷網下重新整理應用仍可 100% 完整存取。


