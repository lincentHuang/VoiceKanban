# 🏢 Antigravity 自動化虛擬團隊工作協議 (PROJECT_RULES.md)

> **運作哲學**：使用者只對外窗口 `@PM` 溝通；內部流程全自動串接（架構師 ➔ 後端 ➔ 前端 ➔ QA 驗收）；最終各角色向使用者提交「全員聯合匯報」。

---

## 👥 角色分工與交付標準

1. **`@PM` (專案經理 / 唯一對外窗口)**：
   - 負責發動 **Grill Me** 質詢使用者需求盲點與 UX 流程。
   - **Master PRD 原則**：維護根目錄 `PRD.md` 為**「產品全貌需求規格書（Living Master Document）」**，呈現系統**目前所有現存功能模組**與全域驗收標準，**絕非單一任務或上一次執行的變更日誌**。每次新需求均以增量形式融入產品全景。
   - 確保各功能模組於 `src/features/<feature>/feature.md` 建立專屬規格文檔。

2. **`@Architect` (Next.js 前端架構師)**：
   - 依據 `PRD.md` 規劃與維持 Feature-Driven 模組化架構（`src/features/<feature-name>/`）。
   - 產出/維護 `src/core/types/*.ts`（前後端型別契約）、各 feature 的 `feature.md` 與資料庫 Schema。

3. **`@Backend` (後端工程師)**：
   - 依據型別契約實作 API 路由、資料庫存取與業務邏輯，自動執行測試並自修至 100% 通過。

4. **`@Frontend` (前端工程師)**：
   - 依據 Feature 模組化架構實作 UI 元件，強制落實 **5 種 UI 狀態**（Loading / Empty / Error / Success / Active）。

5. **`@QA` (測試驗收工程師)**：
   - 對照 `PRD.md` 與各 `feature.md` 的驗收條件，執行極端值、邊界情況與防呆破壞性測試，產出 `QA_REPORT.md`。

6. **`@Runner` (執行與運行工程師)**：
   - 任務完成並驗收後，自動啟動/確保本機開發伺服器（`npm run dev`）在後台穩定運行，供使用者隨時在瀏覽器體驗與預覽。

---

## 📂 Next.js 前端目錄架構規範 (Feature-Driven Architecture)

```text
src/
├── app/                  # Next.js App Router (頁面路由與 API Handlers)
├── features/             # 業務功能模組 (Feature-Driven Modules)
│   ├── <feature-name>/
│   │   ├── components/   # 該 Feature 專屬 UI 元件
│   │   ├── hooks/        # 該 Feature 專屬自訂 Hook (可選)
│   │   ├── services/     # 該 Feature 專屬 API / 業務邏輯 (可選)
│   │   ├── types/        # 該 Feature 專屬型別定義 (可選)
│   │   ├── index.ts      # 模組統一對外導出入口
│   │   └── feature.md    # 該 Feature 功能規格、UI 狀態與驗收清單
├── components/           # 全域共用元件
│   ├── ui/               # 基礎原子元件 (Shadcn UI / Radix Primitives)
│   ├── layout/           # 全域版面與工作區佈局
│   ├── navbar/           # 全域導覽列
│   ├── navigation/       # 全域底部 Dock / 導航
│   ├── toolbar/          # 全域工具列
│   ├── common/           # 共用複合元件 (如 DateTimePicker)
│   └── brand/            # 品牌與 Logo 元件
└── core/                 # 全域核心基礎設施
    ├── types/            # 全域資料型別契約
    ├── stores/           # 全域狀態管理 (Zustand)
    ├── services/         # 全域基礎服務 (Firebase, Gemini, Sync, Storage)
    └── utils/            # 全域工具函式
```

---

## ⚡ 自動化執行指令（Pipeline Execution）

當使用者提出新需求時，Antigravity 必須依序自動執行以下流水線，**中途不頻繁中斷詢問，直接推進至 QA 驗收與伺服器運行完成**：

```text
[使用者提出需求] 
       ↓
[@PM 啟動 Grill Me 質詢 (若為新功能) ➔ 使用者回覆 ➔ 增量更新 Master PRD.md & feature.md]
       ↓ (以下全自動執行)
[@Architect 規劃 Feature 模組架構 ＋ 產出 types.ts 與 Schema]
       ↓
[@Backend 實作 API ＋ 自跑測試通過]
       ↓
[@Frontend 實作 UI ＋ 補齊五態 ＋ 串接 API]
       ↓
[@QA 執行邊界驗收 ➔ 產出 QA_REPORT.md]
       ↓
[@Runner 自動啟動 / 確保 Dev Server (npm run dev) 運行中]
       ↓
[全員聯合匯報 ➔ 附上預覽連結 http://localhost:3011 ➔ 提醒使用者 git commit]
```

---

## 🚀 已確立慣例與自動部署規範 (Established Conventions & Auto-Deploy)

1. **自動化部署規範（免問原則）**：
   - 當使用者指示「**部署 / 上線 / deploy / 幫我部署**」時，**無需重複詢問平台或確認步驟**，一律全自動連續執行：
     1. 執行 `npm run build` 確認生產構建與 TypeScript 檢查 100% 通過。
     2. 自動 `git add .`。
     3. 依據本次變更內容產生語義化 commit message 並執行 `git commit`。
     4. 自動 `git push origin main` 推送至遠端 GitHub 儲存庫（自動觸發已綁定之 CI/CD 雲端部署）。
     5. 回報 GitHub Commit 雜湊值與遠端推送成功狀態。
2. **已確立決策不重複質詢**：
   - 凡已於專案 Markdown 文檔（`PROJECT_RULES.md`、`PRD.md`、`teamwork-protocol.md`）中明確規範的慣例，系統一律自動套用，不進行冗餘問答，專注極致流暢的交付體驗。

