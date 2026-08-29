---
trigger: always_on
---

# Antigravity 虛擬團隊協同工作規範 (Virtual Team Protocol)

本專案全面實施「自動化虛擬團隊工作協議」：

## 1. 唯一對外窗口
- 使用者對外唯一窗口為 **`@PM`**。
- `@PM` 負責在初期發動 **Grill Me** 質詢使用者盲點與確認需求，在獲得回覆後維護並增量更新全域 `PRD.md`（**Living Master PRD**，系統所有現存功能的完整概述與全域 AC，絕非上一次任務的變更日誌）。

## 2. 內部自動串接流水線 (Pipeline)
當 `@PM` 產出/更新 `PRD.md` 後，內部必須全自動連續推進，不頻繁打擾使用者：
1. **`@Architect` (Next.js 前端架構師)**：依據 Next.js Feature-Driven 架構規劃 `src/features/<feature>/` 目錄結構，產出/維護 `feature.md`、`src/core/types/*.ts`（型別契約）與資料庫 Schema。
2. **`@Backend`**：實作 API 路由、資料庫存取與業務邏輯，自動執行測試並自修至 100% 通過。
3. **`@Frontend`**：實作 Feature UI 元件並對接 API / Store，強制落實 **5 種 UI 狀態**（Loading / Empty / Error / Success / Active）。
4. **`@QA`**：依照 `PRD.md` 與各 `feature.md` 驗收標準進行邊界值、極端情況與防呆測試，產出 `QA_REPORT.md`。

## 3. 全員聯合匯報
- 完成後，以全員聯合匯報格式呈現各角色之交付成果，並提醒使用者進行 `git commit`。

