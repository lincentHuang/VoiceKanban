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
- **卡片即時預覽插槽 (Live Drop Slot Indicator)**：跨欄與欄內拖曳卡片時，精準於目標位置展開微光虛線預覽槽。
- **平滑防抖碰撞策略**：結合 `pointerWithin` 與 `closestCenter` 歐氏幾何中心判定，杜絕快速拖曳時跳欄震盪，並完美分離 Column 與 Task 拖曳。
- **Lexorank Base36 排序鍵**：毫秒級任意區間卡片插入，避免大量全量更新。
- **欄位管理、全欄位柔和色彩與 WIP 上限**：支援自訂欄位名稱、柔和淺色系全欄位主題色調（取代單一線條，呈現精緻底色與邊框）、排序與在製品（WIP）超額警示。
- **多選與批次操作 (Batch Actions)**：支援多選卡片，一鍵批次搬移、變更優先級或刪除。
- **手機版看板磁力滑動置中與邊緣懸停磁吸切換 (Mobile Scroll Snap & Edge Magnet Drag Navigation)**：
  - 手機版（小螢幕）瀏覽時，看板欄位具備 CSS 磁力吸附（`snap-x snap-mandatory`），滑動時各狀態欄位自動於螢幕中央吸附置中（`snap-center`），並以 `84vw` 寬度提供鄰近欄位露邊預覽。
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

### 3.8 📝 Markdown 任務筆記與清單 (Markdown Notes & Checklists)
- **雙模切換**：支援即時編輯（Write）與渲染預覽（Preview）。
- **工具列支援**：粗體、斜體、清單、程式碼區塊、標題一鍵插入。
- **子任務清單 (Checklists)**：支援進度條（Progress Bar）即時連動完成率。

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

