# 🌟 聲動看板 (Voice Kanban) - 產品需求規格書 (Master PRD)

> **文檔屬性**：**產品全貌需求規格書 (Living Master Document)**  
> **維護原則**：本 PRD 為系統**當前所有現存功能模組之全景規格概述**，每次需求變更皆以「增量演進」方式整合至全域架構中，**絕非單次任務的執行紀錄或 Sprint 日誌**。各功能模組之專屬規格、UI 五態與驗收細節另收錄於各 `src/features/<feature>/feature.md`。  
> **最後同步**：2026-09-16（依據 `main` 分支現況全面校正）

---

## 1. 產品願景與全貌概述 (Product Vision & Executive Summary)

聲動看板是一套**以家庭／小團體共用為核心的 AI 原生任務看板**。產品存在的理由是**降低「把家裡的事情記下來」的門檻**：成員的技術熟練度不一，因此任何需要學習成本的操作都會直接讓人放棄記錄。所有功能取捨的判準是「**這會讓家人更願意、還是更不願意打開它**」，而非「對進階使用者是否夠強大」。

核心特色：
1. **零門檻記錄**：語音口述、貼上連結、單行輸入 Enter，三種最低摩擦的入口。
2. **多人共用看板**：6 碼邀請碼、免註冊訪客協作、即時同步與通知中心——這是產品的主軸而非附加功能。
3. **社群內容收藏**：把 IG / YouTube / Threads 的連結一鍵存成有縮圖的卡片。
4. **極致流暢看板體驗**：Base36 Lexorank 排序、跨欄即時預覽插槽與平滑防抖雙向拖曳。
5. **Local-First & 雲端雙軌同步**：訪客本機離線優先使用，可一鍵升級綁定 Google / Email 帳號同步至 Firestore。
6. **零營運成本與 BYOK 隱私安全**：雲端 AI 解析一律使用使用者自帶的 Google Gemini API Key（BYOK），伺服器端**不提供共用金鑰**；R2 上傳與外部抓取皆有帳號驗證與配額上限，確保營運者不承擔使用者的用量成本。
7. **PWA 優先**：以 PWA 提供手機／桌面安裝體驗，**不維護原生 App 封裝**，開發資源集中在啟動速度與流暢度。

---

## 2. 系統架構與前端目錄規範 (System Architecture & Folder Structure)

本專案採用 **Next.js 16 (App Router) + Feature-Driven（垂直切片模組化）** 前端架構，狀態集中於單一 Zustand Store：

```text
src/
├── app/                            # Next.js App Router (頁面路由與 API Handlers)
│   ├── api/voice/extract/          # 語音／逐字稿結構化解析 (Gemini BYOK + 本機 NLP)
│   ├── api/user/key/               # BYOK API Key 驗證與加密儲存 (含 IP 速率限制)
│   ├── api/upload/                 # Cloudflare R2 檔案上傳 (需登入 + 每日配額)
│   ├── api/link/preview/           # 連結預覽爬取 (oEmbed / Open Graph + SSRF 防護)
│   ├── api/link/thumbnail/         # IG / Threads 縮圖轉存 R2 (需登入 + 配額)
│   ├── layout.tsx / page.tsx       # 應用外殼與主入口
│   └── globals.css                 # 全域 Tailwind CSS 與主題變數
├── features/                       # 業務功能模組 (Feature Modules)
│   ├── auth/                       # [F1] 認證、訪客模式與帳號綁定
│   ├── kanban/                     # [F2] 看板核心、卡片詳情、欄位管理、批次操作
│   ├── inbox/                      # [F3] 快速收件匣側邊欄
│   ├── voice/                      # [F4] AI 語音擷取與解析
│   ├── views/                      # [F5] 行事曆視圖
│   ├── search/                     # [F6] Command Palette 搜尋
│   ├── editor/                     # [F7] Markdown 說明編輯器與 GFM 渲染
│   ├── settings/                   # [F8] 設定中心與 BYOK 金鑰
│   ├── collaboration/              # [F9] 多人即時協同與邀請機制
│   ├── notifications/              # [F10] 協作通知中心與桌面推播
│   ├── offline/                    # [F11] 離線偵測、橫幅與待同步佇列
│   ├── pwa-mobile/                 # [F12] PWA 安裝引導與 Service Worker 註冊
│   └── bookmarks/                  # [F13] 社群內容收藏與連結展開
│       （各模組皆具備 components/ · 視需要 hooks/ services/ types/utils/ · index.ts · feature.md）
├── components/                     # 全域共用 UI 元件
│   ├── ui/                         # 基礎原子元件 (Radix: Dialog, Dropdown, Select, Popover, Input...)
│   ├── layout/                     # 全域版面 (UnifiedDnDWorkspace, AppModals, dnd/)
│   ├── navbar/                     # 全域頂部導覽列與使用者選單
│   ├── navigation/                 # 底部浮動 Dock (收件匣／看板／行事曆)
│   ├── common/                     # 複合元件 (DateTimePicker, TagPicker, UserAvatar)
│   └── brand/                      # 品牌 Logo
└── core/                           # 全域核心底層
    ├── hooks/                      # useAppInit, useClickOutside, useEscapeKey
    ├── types/                      # 全域型別契約 (task, voice, auth, user)
    ├── stores/                     # Zustand 狀態中心 (useKanbanStore)
    ├── services/                   # firebase, authService, syncService, gemini, localNlpParser,
    │                               # webSpeechService, audioRecorderService, r2Storage,
    │                               # verifyIdToken, guestUser, mockData
    └── utils/                      # lexorank, dateUtils, crypto, rateLimit, authToken,
                                    # chineseConvert, imageUtils, uploadUtils, calendar, cn
```

**已退場的架構元素**（曾出現於舊版 PRD，現已自程式碼移除）：
- `features/quick-prompt/`（頂部自然語言速記 Hero）：入口收斂為語音 FAB、欄位內行內新增與收件匣單行輸入。
- `core/services/learningEngine.ts`（語音欄位偏好學習引擎）。
- `components/toolbar/`（全域子工具列）與 `WorkspaceSplitter`（收件匣寬度分割器，現為固定 320px）。
- `android/` 與 `ios/` Capacitor 原生工程與 `capacitor.config.ts`（詳見 §3.12）。
- Table View 與 List View 兩種檢視模式。

---

## 3. 全域核心功能模組矩陣 (Master Feature Matrix)

### 3.1 🔐 使用者認證與資料漫遊 (Auth Feature)
- **訪客模式 (Guest First)**：無需註冊直接上手，資料持久化於 LocalStorage。
- **多渠道登入 (Multi-Provider)**：支援 Google OAuth 與 Email 密碼登入（Firebase Auth）。
- **無縫帳號綁定 (Seamless Account Binding)**：訪客建立之資料可隨時綁定至正式雲端帳號，資料零遺失；綁定後既有協作看板身分自動延續。

### 3.2 📋 看板、狀態列拖曳與雙向拖曳引擎 (Kanban & DnD Feature)
- **狀態列欄位拖曳重排 (Column DnD Reorder)**：抓住欄位 Header（或長按 200ms）水平平滑拖曳排序，即時預覽換位並持久化。
- **已完成任務底部折疊收合**：各欄位內 `completed: true` 的任務自動沉底，預設收合為「已完成任務 (N)」折疊條，展開後支援全功能查看與拖曳排序。
- **最右側行內極速新增欄位 (Inline Column Creation)**：看板橫向末端提供「+ 新增欄位」卡片，行內輸入名稱 Enter 立即建立。
- **卡片即時預覽插槽與幽靈佔位**：
  - 拖曳時原欄位保留幽靈佔位（`opacity-35`），杜絕欄位高度塌陷造成的跳動。
  - 目標插槽以簡約灰色塊（`h-12`）呈現，目標欄位維持常態底色不加干擾性高亮外框。
  - **跨欄拖曳極速頂部定位**：由其他欄位或收件匣拖入時，落點固定為最頂端（Index 0）。
- **精準中線切入與平滑防抖碰撞策略**：`pointerWithin` 結合卡片垂直中線判定，最頂端、卡片縫隙與最底端皆能精準切入，並完美分離 Column 與 Task 拖曳。
- **Lexorank Base36 排序鍵**：毫秒級任意區間插入，避免大量全量更新。
- **欄位柔和色彩與行內編輯**：
  - 十色粉彩欄位主題（含舊版飽和色自動映射），於欄位選單內以色票即時套用。
  - **標頭就地行內編輯**：懸停顯示鉛筆，點擊／雙擊標題切換為輸入框，Enter 或 Blur 儲存、Escape 還原、空白防呆復原；**所有輸入皆內建中文 IME 組字保護**（`isComposing` / `Process` 防重複送出）。
  - **圖示 Popover 極速更換**：點擊欄位圖示展開 Emoji Popover，支援「無圖示（純文字）」；名稱與圖示修改互不覆蓋。
  - **嚴格手勢防衝突隔離**：輸入框與圖示按鈕阻斷指標事件冒泡，打字與框選 100% 不觸發 DnD。
- **欄位動作選單 (`ColumnActionMenu`)**：新增卡片、重新命名列表、欄位色票、**排序依據（到期日／優先等級／卡片名稱）**、**移動這個列表的所有卡片至指定欄位**、封存這個列表、看板管理、📦 聚合為單一任務卡（移至收件匣）。
- **多選與批次操作 (Batch Actions)**：多選卡片後一鍵批次搬移欄位、變更優先級、標記完成／未完成與刪除；手機小螢幕（`< sm`）底部 `BatchActionBar` 自動切換為雙行卡片佈局，桌機維持單行膠囊列。
- **桌機版看板滑鼠拖曳平移 (Drag-to-Scroll Panning)**：於空白畫布按住左鍵 1:1 水平平移並帶慣性滑行；自動識別互動元素避免衝突；`cursor-grab` / `cursor-grabbing` 動態游標；微移（< 3px）判定為點擊。
- **多看板切換與安全刪除防呆**：`BoardSwitcherMenu` 提供切換、新增、編輯（✏️）與刪除（🗑️）；刪除時彈出確認視窗並提示任務數量，**最後一個看板不可刪除**；刪除當前看板時自動平滑切換至第一個剩餘看板並級聯清理任務。
- **手機端底部安全避讓**：看板主畫布與收件匣內容區統一配置 `pb-[calc(54px+env(safe-area-inset-bottom,0px))]`，確保卡片、折疊條與新增按鈕完整露出於 BottomDock 與語音 FAB 之上。

### 3.3 🗂️ 看板管理中心 (Board Manager Modal)
單一 `BoardManagerModal` 以四個分頁整合所有看板層級設定（取代舊版獨立的 `ColumnManagerModal` 與 `EditBoardModal`）：
- **欄位流程 (Columns)**：按住 `⋮⋮` 垂直拖曳調整欄位順序、行內改名、Popover 圖示選擇（含無圖示）、新增與刪除欄位。
- **一般設定 (General)**：看板名稱、Emoji 圖示與描述。
- **共享協作 (Sharing)**：開啟共享、檢視邀請碼與成員清單、角色調整（詳見 §3.15）。
- **背景外觀 (Appearance)**：套用 `BOARD_BACKGROUND_PRESETS` 看板畫布漸層背景（極光紫、深海藍、暮色橘、森林綠、極夜黑、糖果粉等），色票即時預覽並持久化於 `Board.background`。

### 3.4 🗃️ 任務詳情卡 (Task Detail Modal)
單張卡片承載的完整資訊結構（`Task` 型別契約）與其編輯介面：
- **頂部動作列**：完成切換、⭐ 重要標記、移動卡片（Popover 選擇看板／欄位）、封面設定、🚀 展開為狀態欄位、🗑️ 刪除（含防呆確認 Modal）、關閉。
- **封面 (Cover)**：支援純色／漸層（日落暖陽、極光青綠、深邃海洋、霓虹魅紫）或自訂上傳圖片，並可選擇顯示比例 `banner (16:9)` / `1:1` / `3:4` / `9:16` / `bar (極簡飾條)`；卡片列表同步呈現封面。
- **標籤選擇器 (`TagPicker`)**：Notion 風格 Popover，一個搜尋框同時完成「過濾既有標籤」與「建立新標籤」，右側顯示每個標籤的使用卡數，避免家庭成員各自打出同義標籤。
- **子任務待辦清單 (Checklist)**：長按 500ms 啟用平滑垂直拖曳排序（無多餘箭頭或把手），短按切換勾選、雙擊行內改名；即時進度百分比條。
- **附件檔案 (Attachments)**：介面允許單檔至 25MB；已登入帳號優先直傳 Cloudflare R2（伺服器端單檔上限 5MB、每日 20 次／50MB 配額），訪客、超額或超過 5MB 時自動降級為本機壓縮 Base64，流程不中斷。圖片可一鍵「插入到說明」，支援下載與刪除，上傳期間顯示旋轉 Loading。
- **留言與活動紀錄 (Comments & Activity)**：`TaskActivity` 時間軸，可在卡片內撰寫評論或進度筆記，家庭成員之間以此對同一件事補充狀況。
- **建立者身份 (Task Creator)**：`createdBy` 於共享看板的卡片上顯示頭像與名稱（去正規化儲存，成員離開看板或以訪客身分加入時仍可正確顯示）。
- **手機 Bottom Sheet**：手機版（`< sm`）以底部抽屜呈現（88vh~92vh）並支援下拉關閉手勢，桌機維持置中彈窗（詳見 §3.14）。

### 3.5 📥 快速收件匣 (Inbox Feature)
- **固定側邊欄與滑順展開收合**：桌機固定寬度 320px，300ms `ease-in-out` 寬度／透明度過渡，內層固定寬度包裝容器避免動畫期間折行；Header 右側 `<ChevronLeft>` 收合按鈕與底部 Dock「收件匣」雙向聯動。
- **手機版全寬自適應**：手機（`< sm`）覆蓋卡片採 `inset-2.5` 滿版，內層 `w-full min-w-0`，標頭、輸入框與卡片 100% 貼合寬度。
- **雙向自由拖曳**：可從收件匣拖曳卡片至看板任意位置（落點固定首位），或將看板卡片暫存回收件匣。
- **單行極速新增**：鍵盤 Enter 即時加入待辦（內建 IME 組字保護）；貼上單一網址時自動展開為含縮圖的連結卡片（詳見 §3.18）。
- **收件匣多選列**：支援全選與批次操作。

### 3.6 🎙️ AI 語音擷取與智慧解析 (Voice & AI Extraction)
- **極簡俐落語音彈窗**：頂部統一標題「語音輸入」，移除語系切換與技術提示框，預覽僅保留逐字稿與任務微調欄位（看板、欄位、優先級、到期時間、標籤）。
- **雙軌辨識管線**：
  - **Web Speech API 即時辨識**：瀏覽器原生辨識即時上字幕，`AudioVisualizer` 以 Web Audio API 繪製動態頻譜。辨識結果**自動以 OpenCC 轉為繁體中文（zh-TW）**，修正部分瀏覽器／OS 語音引擎回傳簡體字的問題。
  - **音訊上傳雲端解析**：無法使用 Web Speech 時由 `audioRecorderService` 錄音並上傳（單檔上限 10MB，每分鐘 10 次）交由 Gemini 直接聽打與結構化。
- **BYOK 強制原則（零營運成本）**：雲端音訊解析**一律使用呼叫者自己的 Gemini API Key**，伺服器端刻意不設共用金鑰備援——公開部署上的共用金鑰會由營運者買單並可被任意壓榨。未填金鑰時回傳 `API_KEY_REQUIRED` 並引導至設定頁。
- **純淨標題與欄位精準辨識**：聚焦提取任務標題（`title`）與目標欄位（`targetColumnId`），建立卡片時**不於說明欄位備註逐字稿**。
- **全方位欄位關鍵字與自訂欄位支援**：動態取得當前看板所有欄位（含自訂），並自標題中智慧剔除「放進進行中」、「移至待辦」等動作贅詞。
- **本機 Local NLP 備援**：離線、無金鑰或直接送出逐字稿時，由 `localNlpParser` 以正則解析時間、優先級與標籤，流程不中斷。
- **欄位定向啟動**：由特定欄位的語音按鈕觸發時，若口述未指定欄位則精準落在該欄位。

### 3.7 📊 雙重視圖切換 (Views Feature)
- **Kanban Board**：泳道卡片流動檢視，支援欄位拖曳排序與行內新增欄位。
- **Calendar View**：月度／週度時間排程視覺化（以 `dynamic()` 延遲載入，不佔用看板首屏成本）。
- **全域同步篩選**：標籤與關鍵字搜尋在看板與行事曆即時聯動。
- **精簡架構**：已徹底移除 Table View 與 List View，專注看板與行事曆雙視圖；底部 Dock 僅保留收件匣／看板／行事曆三個入口。

### 3.8 ⚙️ 設定中心與 BYOK 加密 (Settings & Security)
- **BYOK 分頁 (API)**：填入自訂 Google Gemini API Key，採本機 AES 加密儲存；提供連線測試（每 IP 每小時 5 次上限）與金鑰抹除。
- **AI 模型切換**：`gemini-3.6-flash`（推薦，免費方案可用）與 `gemini-3.1-pro-preview`（深度語義，需付費方案）。
- **離線分頁 (Offline)**：手動「離線工作模式」開關與待同步狀態（詳見 §3.13）。
- **深淺色主題**：全站以 Tailwind `darkMode: "class"` 撰寫完整深／淺色樣式，跟隨系統環境呈現。

### 3.9 📝 Markdown 任務筆記與 GFM 渲染 (Markdown Notes)
- **極簡內嵌式排版**：說明區自然融入任務詳情彈窗，「編輯說明」按鈕置於標題列最右端，編輯模式切換為「取消 / 完成」。
- **超長內容漸層收合**：渲染高度超過 500px 時自動漸隱並提供「展開完整說明內容 / 收合」按鈕。
- **雙模切換與即時儲存防護**：Write / Preview 雙模，修正狀態閉包覆蓋問題，確保「完成」與快捷鍵即時持久化。
- **智慧圖片壓縮與 R2 上傳**：貼上或上傳圖片自動經 Canvas 壓縮為 WebP/JPEG，優先直傳 R2，未設定時降級本機壓縮 Base64，避免 localStorage 5MB 與 Firestore 單檔上限。
- **完整 GFM 支援**：表格（含 `:---` / `:---:` / `---:` 對齊、隔行底色、懸停高亮、橫向滾動與深色適配）、水平分隔線（`---` / `***` / `___`）、Fenced Code Blocks（含語言標籤）、多層級清單與 `- [ ]` / `- [x]` 核取方塊。
- **工具列**：粗體、斜體、刪除線、清單、表格、代碼、標題、圖片上傳一鍵插入。

### 3.10 🔍 響應式搜尋與 Search Modal (Search Feature)
- **Header 瘦身**：頂部 Header 回歸純導覽與搜尋，不再放置「建立」與「一鍵語音」按鈕。
- **全響應式觸發**：桌機（`≥ sm`）為含 `⌘K` 提示的膠囊觸發器；手機（`< sm`）收斂為右上角搜尋圖示按鈕。
- **Command Palette 風格**：自動聚焦、即時模糊過濾（標題、內文、標籤）、快捷標籤列、鍵盤選取高亮，並嚴格落實 UI 5 態。
- **結果直達**：結果卡片顯示所屬欄位色標、標籤、截止日與星號，點擊直接開啟任務詳情（`setEditingTaskId`）或套用看板篩選。

### 3.11 🚀 展開與聚合工作流 (Expand & Aggregate Feature)
- **任務展開為狀態欄位**：任務詳情頂部「🚀 展開為狀態欄位」將主任務標題升級為新欄位，Checklist 子任務逐條轉為該欄位下的獨立卡片並保留完成狀態與順序；無子任務時建立空欄位；原主任務除役並即時同步。
- **欄位聚合為單一卡片**：欄位選單「📦 聚合為單一任務卡（移至收件匣）」將欄位名稱轉為新卡片標題、欄位內卡片依序轉為 Checklist；原卡片的標籤、到期日與內文自動彙整為 Markdown 備註附加於說明（深層資料零遺失）；新卡片落入收件匣並自動滑開側邊欄，原欄位安全清除。

### 3.12 📱 PWA 安裝與跨平台體驗 (PWA & Install Feature)
- **PWA 優先策略（原生封裝已退場）**：專案**不再維護 Capacitor iOS / Android 原生工程**（`android/`、`ios/`、`capacitor.config.ts` 與相關相依套件皆已移除）。經評估 PWA 已足以滿足家庭使用情境，資源改投入啟動速度與流暢度（詳見 §3.19）。
- **完整 Web App Manifest**：`manifest.webmanifest` 含繁中名稱「聲動看板」、主題色 `#f97316`、192/512 高解析與 Maskable 圖示、`standalone` 全螢幕模式、`portrait-primary` 與 Web Share Target 宣告。
- **Service Worker 離線快取**：`public/sw.js` 預先快取應用外殼與 `/_next/static/`，HTML 導覽採 Network-First 降級 Cache、靜態檔案 Stale-While-Revalidate，斷網重新整理仍可完整載入。
- **雙軌安裝入口與智慧隱藏**：
  - 桌機 Navbar 顯示「💻 安裝電腦版」膠囊按鈕；頭像選單動態適配（桌機「安裝為電腦桌面應用」／手機「在手機安裝應用」）。
  - 偵測到已於 `display-mode: standalone` 執行時自動隱藏所有安裝入口。
  - **Chrome / Edge / Brave / Android**：攔截 `beforeinstallprompt`，點擊直接觸發系統安裝視窗。
  - **macOS Safari (Sonoma 14+)**：彈出 `DesktopInstallGuideModal` 指引「檔案 ➔ 加入 Dock...」。
  - **iOS Safari**：彈出 `IosInstallGuideModal` 三步驟圖文導引（分享 ⎋ ➔ 加入主畫面 ➕）。
- **行動裝置適配**：全域 Safe Area Insets（動態島與底部 Home Bar 避讓）、`100dvh` 與 `overscroll-behavior: none` 防橡皮筋。

### 3.13 📴 Local-First 離線模式 (Offline Mode & Resilient Sync)
- **零延遲離線作業**：離線時完整開放建立、編輯、刪除、跨欄拖曳、子清單排序、搜尋與視圖切換，立即持久化於 LocalStorage。
- **離線變更佇列**：離線期間的變更計入 `pendingOfflineChanges`，確保紀錄不遺失。
- **斷網視覺反饋**：Navbar「離線中」徽章顯示「待同步 N 筆變更」；頂部 `OfflineBanner` 滑出提示並支援手動重試或關閉；恢復連線時 Toast 提示同步完成。
- **自動重連與背景批次同步**：監聽 `online` / `offline` 事件，恢復時自動批次同步。
- **同步合併策略**：雲端寫入採**合併（merge）而非盲目覆蓋**，同步進行中於本機新增或修改的卡片不會被較舊的雲端快照蓋掉；刪除以墓碑（tombstone）紀錄，避免已刪卡片被雲端合併復活，且同步期間新增的墓碑不會被提前清除。
- **離線 AI 降級**：離線時文字與語音改由本機 NLP 正則解析，標註「⚡ 離線本機解析」。
- **手動離線開關**：設定中心「離線工作模式」分頁供主動啟用純本機作業或測試。

### 3.14 📱 手機端原生手勢體驗 (Mobile Gestures & Navigation)
- **任務詳情 Bottom Sheet**：手機版（`< sm`）點擊卡片由底部滑出抽屜（88vh~92vh），頂部拖曳握柄；按住握柄或內容位於最頂端（`scrollTop === 0`）向下拉動時抽屜跟隨手指，超過 100px 或快速下滑放開即彈性關閉，未達閥值平滑回彈。
- **收件匣 ↔ 看板雙向滑動切換**：收件匣向左滑（`ΔX < -60px`）進入看板；看板位於最左側第一欄（`scrollLeft === 0`）向右滑（`ΔX > 70px`）回到收件匣；以 `|ΔX| > |ΔY| * 1.5` 向量判定防誤觸，拖曳卡片時讓渡手勢通道。
- **拖曳磁力邊界滑動**：拖曳卡片至螢幕左右邊緣（< 50px）啟動階梯吸附滾動與邊緣微光／震動回饋；於第一欄拖至最左邊界時磁吸切換至收件匣，支援跨視圖暫存。

### 3.15 👥 多人即時協同編輯與邀請機制 (Multiplayer Collaborative Kanban)
- **6 碼短代碼與一鍵邀請連結**：Owner 於工具列點擊「邀請協作」開啟 `ShareBoardModal`，系統生成專屬 6 碼代碼（如 `VK-8X4B`）與邀請連結（`?invite=VK-8X4B`）；應用啟動時自動解析該參數並開啟加入視窗。
- **免強制登入極速協作**：未登入者僅需填寫「協作者暱稱」即可加入（自動配發隨機頭像與訪客協作者 ID），日後登入 Google / Email 時無縫綁定所有協作看板。
- **三級角色權限模型**：
  - **擁有者 (Owner)**：管理成員、升降級角色、移出成員、刪除／更名看板。
  - **編輯者 (Editor，受邀預設)**：新增、修改、刪除、拖曳卡片與增減排序欄位。
  - **檢視者 (Viewer)**：僅瀏覽、篩選與查看詳情，系統自動隱藏新增按鈕、停用拖曳，頂部常設「👁️ 唯讀模式」徽章。
- **即時同步與成員頭像**：線上監聽 Firestore `shared_boards`，同瀏覽器跨分頁以 `BroadcastChannel` 零延遲同步；頂部 `CollaboratorAvatars` 呈現成員頭像堆疊與身分徽章（👑 / ✏️ / 👁️）。
- **不可猜測的共享 ID**：共享看板文件以隨機 `shareId` 存放而非本機可預測的 `board-work` 類 id，避免跨使用者碰撞與互相覆寫。
- **最後寫入生效 (Last-Write-Wins)**：卡片變更採樂觀更新配合 `updatedAt` 時間戳裁決。

### 3.16 🔔 群組協作即時通知中心 (Collaborative Notifications)
- **Navbar 鈴鐺與未讀徽章**：`NotificationBell` 即時顯示未讀計數紅點。
- **通知中心下拉面板**：`NotificationPopover` 支援「全部／未讀」分頁過濾、全部標為已讀、一鍵清空與瀏覽器桌面推播開關。
- **即時浮動快訊**：他人操作時右上角滑出 4 秒自動淡出的浮動卡片，顯示操作者頭像、動作與影響卡片。
- **協同事件涵蓋**：➕ 新增任務、🔄 移動欄位、✅ 完成／取消完成、🗑️ 刪除任務、👥 新成員加入，皆格式化為可讀中文動態。
- **自我過濾原則**：強制過濾使用者自身操作，只接收同看板其他成員的動態。
- **Web Notification 桌面推播**：授權後於分頁背景時發送原生系統通知，點擊自動聚焦回應用。
- **雙軌持久化與跳轉**：本機 LocalStorage（保留最新 50 筆）與 Firestore 同步，點擊通知自動定位看板並短暫高亮該卡片。

### 3.17 🔖 社群內容收藏看板 (Bookmarks Feature)
- **手機一鍵收藏 IG / YouTube / Threads**：
  - **Android**：Manifest 宣告 Web Share Target（`GET /`，參數 `share_title` / `share_text` / `share_url`），安裝後出現在各 App 分享選單；IG 與 Threads 將連結置於 `text`，故以 `extractFirstUrl()` 自三個欄位擷取第一個 http(s) 連結，讀取後立即 `history.replaceState` 清除參數。
  - **iOS**：主畫面 Web App 無法成為分享目標，改以「複製連結 → 收藏看板『貼上連結』」完成；剪貼簿無連結時提供手動輸入框。
  - 未登入時分享內容暫存 `sessionStorage`（`vk_pending_share`），登入後自動接續開啟儲存面板。
- **專屬「收藏」看板**：以 `Board.kind = "collection"`（而非固定 id）辨識，預設欄位 ▶️ YouTube / 📸 Instagram / 🧵 Threads / 🔗 其他連結，依平台自動分流；新帳號預設建立，既有使用者可從看板切換選單建立或於首次分享時自動建立。
- **連結預覽 API (`GET /api/link/preview`)**：YouTube 走 oEmbed 並使用長效縮圖（`i.ytimg.com/vi/<id>/hqdefault.jpg`）；IG / Threads / 一般網頁解析 Open Graph 取得貼文文字、作者與縮圖。安全與成本防護：僅允許 http(s)、拒絕 localhost 與私有網段、逐跳重新驗證轉址、6 秒逾時、HTML 最多讀取 800KB、每 IP 每分鐘 15 次／每小時 120 次，結果 CDN 快取 1 天。
- **儲存面板 (`ShareSaveSheet`)**：手機底部抽屜、桌機置中視窗；可編輯標題與備註，偵測重複收藏並提示（忽略 `igsh`、`si`、`utm_*` 等追蹤參數）。
- **卡片呈現**：`Task.link` 卡片顯示縮圖封面（使用者自訂封面優先）、平台徽章、作者與「開啟原文」；縮圖失效時顯示平台漸層底圖；已看內容可勾選完成並沿用「已完成 (N)」折疊。
- **標題貼連結自動展開**：任何卡片標題只輸入一個網址時，`enrichTaskFromLink` 自動抓取預覽換成真正標題並寫入 `Task.link`；讀取期間顯示「讀取連結內容…」，失敗或離線時保留網址標題但仍寫入連結；使用者於讀取期間自行改標題時不覆蓋。
- **詳細內容格式 (`buildLinkDescription`)**：依序為 ① 圖片 ② 標題（內容未重複時）③ 內容（YouTube 完整影片說明／IG 貼文文字／Threads 串文／網頁 og:description，上限 4000 字）④ 📝 使用者備註；連結本身不放入說明，由頂部預覽卡「開啟原文」提供。
- **縮圖轉存 R2 (`POST /api/link/thumbnail`)**：IG / Threads 縮圖為數日即過期的簽章網址，儲存後自動複製至 R2 並替換卡片與說明中的圖片網址；僅接受 Meta CDN 網域、5MB 上限、不跟隨轉址、需登入並受每分鐘／每日配額限制；R2 未設定時保留原網址。

### 3.18 🛡️ 安全、隱私與零成本防濫用 (Security, Privacy & Cost Control)
營運原則：**這個專案必須能在零營運成本下持續運作**，因此所有會產生外部帳單的路徑都必須有身分驗證與配額上限。
- **Firebase ID Token 驗證**：`/api/upload` 與 `/api/link/thumbnail` 要求 `Authorization: Bearer <idToken>`，由 `verifyIdToken` 驗證後才執行；匿名／訪客呼叫一律拒絕，前端自動降級為本機儲存。
- **相依套件零負擔的速率限制 (`core/utils/rateLimit`)**：純記憶體桶計數（無 Redis、無資料庫寫入）：
  - `/api/user/key`：每 IP 每小時 5 次金鑰測試（避免淪為免費的失竊金鑰驗證機）。
  - `/api/voice/extract`：音訊每分鐘 10 次、單檔 10MB。
  - `/api/link/preview`：每 IP 每分鐘 15 次、每小時 120 次。
  - `/api/upload`：每帳號每日 20 次／50MB、單檔 5MB、瞬時 5 次；僅允許 image/ audio/ video/ 與 PDF、純文字、CSV。
  - `/api/link/thumbnail`：每帳號瞬時與每日雙層配額。
- **SSRF 與路徑防護**：連結抓取拒絕非 http(s)、localhost 與私有網段並逐跳驗證轉址；上傳資料夾名稱經 `sanitizeFolder` 清洗，杜絕路徑跳脫。
- **BYOK 與金鑰保護**：伺服器端不保存共用 Gemini 金鑰；使用者金鑰採客戶端 AES 加密儲存，金鑰長度上限 200 字元。
- **Firestore 安全規則 (`firestore.rules`)**：
  - `users/{userId}` 嚴格私有，僅本人可讀寫。
  - `shared_boards/{boardId}` 以去正規化的 `memberIds` 判定成員（規則無法檢視陣列內物件欄位）；建立者為 Owner，成員可更新，**加入者僅能透過 `isJoiningSelf()` 這條窄路把自己加入成員清單**，不得改動看板內容或移除他人；因看板 id 即為秘密，故共享文件置於隨機 `shareId` 之下。
  - `invite_codes/{code}` 僅 Owner 可改動。
  - 結尾預設 deny，任何日後新增的集合預設關閉而非世界可讀。

### 3.19 ⚡ 啟動速度與效能 (Performance & Cold Start)
啟動速度被視為比新增功能更高優先的產品品質項目（打得開才會有人記錄）。
- **全部 Modal 延遲載入**：`AppModals` 以 `dynamic({ ssr: false })` 個別載入十餘個彈窗，且**僅在開啟時掛載**——`dynamic()` 元件一掛載就會抓取其 chunk，若無條件渲染只會把成本往後挪而非移除。
- **避開 barrel 匯入**：延遲載入一律指向具體檔案而非 feature barrel，避免整個 feature（卡片、欄位、服務）被拖進 lazy chunk。
- **主要視圖按需載入**：`AuthLandingScreen`、`BatchActionBar`、`NotificationToastContainer` 與 `CalendarView` 皆為動態載入，不佔用看板首屏成本。
- **LocalStorage 容錯**：`safeLocalStorage` 於 QuotaExceededError 時自動清理舊版本 key 後重試，避免寫入失敗導致資料遺失或阻塞。

---

## 4. UI 5 種狀態處理規範 (5 UI States Standard)

系統所有前端 UI 元件必須嚴格遵守以下 5 種狀態規範：
1. **Loading**：請求或運算中提供骨架屏（Skeleton）或平滑 Spinner，防止重複觸發。
2. **Empty**：無資料時呈現引導性插圖、空狀態文案與一鍵新增按鈕。
3. **Error**：異常時提供明確中文錯誤提示、重試機制與樂觀更新回滾（Optimistic Rollback）。
4. **Success**：操作完成時給予震動、Toast 通知或微動畫確認反饋。
5. **Active / Interactive**：選取、聚焦、拖曳中提供高亮邊框、微光與陰影景深。

**輸入法通則（全域強制）**：本產品主要使用者以注音輸入法輸入繁體中文，任何監聽 `Enter` / `Escape` 的文字輸入框或 textarea，處理常式**必須**以 `if (e.nativeEvent.isComposing || e.key === "Process") return;` 起手，否則組字確認的 Enter 會造成文字重複送出。

---

## 5. 全域驗收標準 (Master Acceptance Criteria, Master AC)

- [x] **MAC-1 (全模組 Feature-Driven 結構清晰)**：前端遵循 `src/features/<feature>/` 模組化規範，每個模組均具備專屬 `feature.md` 與獨立出口 `index.ts`。
- [x] **MAC-2 (看板卡片與狀態列拖曳穩定)**：支援卡片跨欄與欄內拖曳（含即時預覽插槽）以及狀態列 Header 長按/拖曳橫向排序，順序即時持久化。
- [x] **MAC-3 (最右側行內新增欄位)**：看板橫向末端提供「+ 新增欄位」行內卡片，輸入名稱 Enter 即刻建立。
- [x] **MAC-4 (檢視精簡與 Dock 淨化)**：精簡為看板與行事曆雙視圖，底部 Dock 僅保留收件匣、看板、行事曆。
- [x] **MAC-5 (多模態語音與 AI 解析)**：支援語音輸入與 Gemini AI / 本機 NLP 結構化任務解析及多任務拆解。
- [x] **MAC-6 (認證與多端同步)**：支援訪客模式與 Firebase Google/Email 登入綁定，離線優先並同步至雲端。
- [x] **MAC-7 (安全 BYOK 與設定)**：支援本機加密儲存自訂 Gemini API Key，連線測試正常。
- [x] **MAC-8 (已完成任務底部折疊收合)**：各狀態欄位內的已完成任務自動沉底並預設折疊收合，點擊平滑展開查看與支援拖曳。
- [x] **MAC-9 (編譯與型別無誤)**：`npm run build` 與 TypeScript 型別檢查 100% 通過。
- [x] **MAC-10 (手機版看板磁力置中與拖曳邊緣切換)**：手機版左右滑動具備磁力吸附自動置中（`snap-center`），卡片拖曳期間不卡頓且懸停邊緣自動磁吸平滑切換欄位。
- [x] **MAC-11 (看板卡片上下動態像素切入判定)**：拖曳至目標卡片上下邊緣時精確判定插入點，頂部必定切入 Index 0、底部必定切入 Index Max，無需預留空白。
- [x] **MAC-12 (Header 瘦身與全響應式 Search Modal)**：Header 移除「建立」與「一鍵語音」；桌機點擊搜尋框或 `⌘K` 開啟 Search Modal，手機轉為右上角圖示按鈕，支援即時過濾與直接開啟編輯。
- [~] **MAC-13 (Capacitor 原生封裝) — 已退場 (Retired)**：經產品決策評估，PWA 已足以支撐家庭使用情境，`android/`、`ios/` 工程與 Capacitor 相依套件已自專案移除，改以 §3.12 的 PWA 安裝體驗取代。此條保留作為歷史決策紀錄，不再列為驗收項目。
- [x] **MAC-14 (PWA 標準支援與 Service Worker 離線快取)**：具備合法 `manifest.webmanifest`、各尺寸高解析度圖示、全螢幕獨立模式、iOS Safe Area Insets、以及 `public/sw.js` 資源快取與自動註冊。
- [x] **MAC-15 (安裝入口與雙軌引導體驗)**：頭像選單提供安裝選項；Standalone 模式自動隱藏；Android/Chrome 觸發系統安裝視窗，iOS Safari 彈出 3 步驟圖文導引（`IosInstallGuideModal`）。
- [x] **MAC-16 (子任務長按 500ms 拖曳排序)**：子任務清單維持無多餘符號的純淨外觀，長按 500ms 啟用垂直拖曳排序，短按快速勾選，資料即時持久化與雲端同步。
- [x] **MAC-17 (任務與欄位雙向展開與聚合)**：任務詳情可一鍵「展開」為欄位；欄位選單可一鍵「聚合」為單一卡片並收納至收件匣，完整保留深層屬性與勾選狀態。
- [x] **MAC-19 (手機版 Modal 100dvh 安全視窗)**：全域採用 `100dvh` 與 `overflow: hidden; overscroll-behavior: none;`，所有 Modal 限制於 `max-h-[calc(100dvh-2rem)]` 內並以 `flex-1 overflow-y-auto` 獨立捲動，消除不明滾動區與橡皮筋彈跳。
- [x] **MAC-20 (手機端 Bottom Sheet 與手勢滑動切換)**：任務詳情於手機以 Bottom Sheet 開啟並支援下拉關閉；收件匣與看板雙向滑動切換具向量防誤觸；拖曳支援邊界磁力滑動與最左邊界磁吸至收件匣。
- [x] **MAC-21 (桌機版看板滑鼠拖曳平移)**：桌機可於空白區域按住左鍵平移畫布並具慣性滑行，與 DnD／點擊完美隔離，游標自動切換 `cursor-grab` / `cursor-grabbing`。
- [x] **MAC-22 (Cloudflare R2 雲端物件儲存)**：`/api/upload` 以 AWS S3 SDK 上傳至 R2；前端 `uploadFile` 具 R2 直傳與本地壓縮 Base64 雙軌降級；附件、封面與 Markdown 貼圖全面接入並具 Loading 反饋。
- [x] **MAC-23 (任務安全刪除防呆與雲端徹底抹除)**：任務詳情常設刪除圖示與防呆確認 Modal；同步層以刪除墓碑確保 Firestore 徹底清除，杜絕刪除後被雲端合併復活。
- [x] **MAC-24 (語音目標欄位動態適配與手機防擠壓)**：語音預覽自動取得當前看板所有自訂欄位；優先等級與到期時間分行排列；手機版「重新錄音／捨棄」轉為圖示按鈕，確認按鈕精簡為「✓ 確認」。
- [x] **MAC-25 (卡片防誤刪原則與確認 Modal 一致性)**：卡片本體不暴露未確認刪除按鈕，刪除收斂為「詳情頁刪除」與「批次選取刪除」兩條路徑，桌機與手機確認 Modal 行為 100% 一致。
- [x] **MAC-26 (Markdown GFM 表格與區塊渲染)**：完整支援 GFM 表格（含對齊、斑馬紋、橫向滾動、深色適配）、水平分隔線、Fenced Code Blocks 與待辦方塊；工具列提供一鍵插入表格。
- [x] **MAC-27 (手機端底部 Dock 安全避讓)**：看板主視圖與收件匣底部統一 `pb-[calc(54px+env(safe-area-inset-bottom,0px))]`，卡片、折疊條與按鈕 100% 露出於 Dock 與語音 FAB 之上。
- [x] **MAC-28 (多人即時協同、邀請代碼與權限管理)**：支援 6 碼邀請碼與 `?invite=` 自動開窗、訪客免註冊暱稱加入、三級角色權限與 Viewer 唯讀限制、Firestore 與 BroadcastChannel 雙軌同步及協作者頭像堆疊。
- [x] **MAC-29 (協作通知中心與他人動態推播)**：`NotificationBell` 未讀紅點、`NotificationPopover` 全部／未讀分頁與清空、4 秒浮動 Toast、全事件廣播與嚴格自我過濾。
- [x] **MAC-30 (電腦桌面獨立應用與跨瀏覽器安裝)**：Navbar「💻 安裝電腦版」按鈕；Chrome/Edge 原生 prompt 與 macOS Safari「加入 Dock」導引；Standalone 模式自動隱藏安裝入口。
- [ ] **MAC-31 (社群內容收藏看板與手機分享收藏)**：功能已實作完成，待 QA 依 `src/features/bookmarks/feature.md` AC-BOOKMARK-1~8 實機驗收。
  - Android 安裝 PWA 後可從 IG / YouTube / Threads 系統分享選單直接存入「收藏」看板；iOS 以「貼上連結」完成收藏。
  - 收藏卡片依平台自動分欄，顯示縮圖、平台徽章、作者與開啟原文按鈕，並同步至雲端。
  - 預覽失敗、離線或私人帳號時仍可儲存連結；重複收藏時提示。
  - 標題只貼一個網址時自動展開為真實標題與縮圖；IG / Threads 縮圖自動轉存 R2 避免數日後失效。
- [x] **MAC-32 (看板管理中心四分頁整合)**：`BoardManagerModal` 以「欄位流程／一般設定／共享協作／背景外觀」四分頁整合所有看板層級設定，欄位支援 `⋮⋮` 拖曳排序、行內改名與 Popover 圖示選擇，背景可套用漸層預設並持久化於 `Board.background`。
- [x] **MAC-33 (任務詳情資訊完整度：封面／附件／留言／標籤)**：任務詳情支援純色與漸層封面、五種顯示比例與自訂圖片上傳；附件可上傳並插入說明，R2 與本機 Base64 雙軌降級；留言與活動紀錄時間軸可新增評論；`TagPicker` 以單一搜尋框同時完成過濾與新建標籤並顯示使用次數。
- [x] **MAC-34 (API 身分驗證與零成本防濫用配額)**：`/api/upload` 與 `/api/link/thumbnail` 強制 Firebase ID Token 驗證；`/api/user/key`、`/api/voice/extract`、`/api/link/preview` 具 IP 或帳號層級速率限制；雲端語音解析一律使用使用者自帶金鑰，伺服器端不提供共用金鑰備援。
- [x] **MAC-35 (Firestore 安全規則最小權限)**：`users/*` 嚴格私有；`shared_boards/*` 以 `memberIds` 判定成員且加入者僅能透過窄路把自己加入成員清單；共享文件置於隨機 `shareId`；規則結尾預設 deny。
- [x] **MAC-36 (啟動速度與程式碼分割)**：全部彈窗以 `dynamic({ ssr: false })` 延遲載入且僅於開啟時掛載，延遲載入指向具體檔案而非 feature barrel；`CalendarView`、`AuthLandingScreen`、`BatchActionBar` 與 `NotificationToastContainer` 皆按需載入，首屏不含未使用的功能程式碼。
- [x] **MAC-37 (繁體中文輸入法全域相容)**：所有處理 `Enter` / `Escape` 的文字輸入元件皆以 `isComposing` / `Process` 判定跳過 IME 組字事件，注音輸入確認候選字時不會造成文字重複送出；Web Speech 辨識結果統一以 OpenCC 正規化為繁體中文（zh-TW）。
