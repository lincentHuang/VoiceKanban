# 🌟 智慧型 AI 任務管理看板 (AI-Powered Kanban) - 產品需求規格書 (Master PRD)

> **文檔屬性**：**產品全貌需求規格書 (Living Master Document)**  
> **維護原則**：本 PRD 為系統**當前所有現存功能模組之全景規格概述**，每次需求變更皆以「增量演進」方式整合至全域架構中，**絕非單次任務的執行紀錄或 Sprint 日誌**。各功能模組之專屬規格、UI 五態與驗收細節另收錄於各 `src/features/<feature>/feature.md`。

---

## 1. 產品願景與全貌概述 (Product Vision & Executive Summary)

本產品是一套專為現代敏捷工作者、個人開發者與高效團隊打造的**「AI 原生智慧任務管理看板（AI-Powered Task Management System）」**。
核心特色包含：
1. **多模態極速輸入**：支援 Web Speech API 語音擷取、Gemini AI 智慧自然語言結構化拆解，以及單行自然語言速記。
2. **極致流暢看板體驗**：支援毫秒級 Base36 Lexorank 排序、跨欄即時預覽插槽（Drop Slot Indicator）與平滑防抖雙向拖曳。
3. **多維度檢視**：提供看板（Kanban）、表格（Table）、日曆（Calendar）與清單（List）四大視圖隨心切換。
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
│   ├── kanban/                 # [Feature 2] 看板核心、卡片、欄位與批次操作
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
│   ├── views/                  # [Feature 6] 多維度視圖 (Table, Calendar, List)
│   │   ├── components/         # TableView, CalendarView, ListView
│   │   ├── index.ts            # 模組統一出口
│   │   └── feature.md          # 多視圖功能全貌規格與 AC
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
│   ├── navigation/             # 全域底部浮動 Dock
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

### 3.2 📋 看板與雙向拖曳引擎 (Kanban & DnD Feature)
- **即時預覽插槽 (Live Drop Slot Indicator)**：跨欄與欄內拖曳時，精準於目標位置展開微光虛線預覽槽。
- **平滑防抖碰撞策略**：結合 `pointerWithin` 與 `closestCenter` 歐氏幾何中心判定，杜絕快速拖曳時跳欄震盪。
- **Lexorank Base36 排序鍵**：毫秒級任意區間卡片插入，避免大量全量更新。
- **欄位管理與 WIP 上限**：自訂欄位名稱、顏色標籤、排序與在製品（WIP）超額警示。
- **多選與批次操作 (Batch Actions)**：支援多選卡片，一鍵批次搬移、變更優先級或刪除。

### 3.3 📥 快速收件匣 (Inbox Feature)
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

### 3.6 📊 多維度檢視切換 (Multi-Views Feature)
- **Kanban Board**：泳道卡片流動檢視。
- **Table View**：結構化資料網格，支援就地修改屬性。
- **Calendar View**：月度/週度時間排程視覺化。
- **List View**：專注直列待辦核對。
- **全域同步篩選**：標籤與關鍵字搜尋在所有視圖即時聯動。

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
- [x] **MAC-2 (看板拖曳穩定與預覽槽)**：跨欄與同欄拖曳時皆能即時呈現預覽插槽，碰撞演算法防抖穩定，Base36 Lexorank 排序正確。
- [x] **MAC-3 (多模態語音與 AI 解析)**：支援語音輸入與 Gemini AI / 本機 NLP 結構化任務解析及多任務拆解。
- [x] **MAC-4 (多維度視圖無縫切換)**：看板、表格、日曆、清單四種視圖資料即時同步，支援篩選與排序。
- [x] **MAC-5 (認證與多端同步)**：支援訪客模式與 Firebase Google/Email 登入綁定，離線優先並同步至雲端。
- [x] **MAC-6 (安全 BYOK 與設定)**：支援本機加密儲存自訂 Gemini API Key，連線測試正常。
- [x] **MAC-7 (編譯與型別無誤)**：`npm run build` 與 TypeScript 型別檢查 100% 通過。

