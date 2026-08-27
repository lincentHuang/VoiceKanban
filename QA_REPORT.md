# VoiceKanban 手機版長按拖曳與 Trello 級絲滑體驗 QA 驗收報告 (QA_REPORT.md v2.21.0)

> **驗收日期**：2026-08-27  
> **負責人**：`@QA (測試驗收工程師)`  
> **測試狀態**：✅ **100% 通過 (PASS)**  
> **對應規格**：[PRD.md](./PRD.md) v2.21.0

---

## 📋 測試案例與驗收結果 (Test Execution Matrix)

| 模組 | 驗收標準 (AC) | 測試情境與邊界條件 | 驗收結果 |
| :--- | :--- | :--- | :---: |
| **懸浮層卡片顯示** | [AC-1.1] 長按卡片可見度 | 手機版長按 250ms 觸發拖曳時，懸浮卡片 100% 實體顯示，未出現消失、閃退或透明度過低問題 | ✅ PASS |
| **雙重 Transform 隔離** | [AC-1.2] 座標與位移精準 | 透過 `isOverlay` 隔離 `useSortable`，解決雙重位移（Double Translation），卡片完美跟隨觸控手指移動 | ✅ PASS |
| **觸覺反饋與防彈窗** | [AC-1.3] Haptic & 禁用選取 | 長按觸發震動反饋，同時透過 `-webkit-touch-callout: none` 與 `-webkit-user-select: none` 阻擋 Safari/Chrome 系統複製彈窗 | ✅ PASS |
| **Trello 懸浮視覺** | [AC-2.1] 傾斜與陰影層次 | 懸浮卡片呈現 `rotate-2`、`scale-105` 與 `shadow-2xl ring-2 ring-orange-500/30`，具備極致立體質感 | ✅ PASS |
| **插槽預覽與平滑落位** | [AC-2.2 & 2.3] 佔位符與落位 | 拖曳穿梭於各欄位時即時計算目標插入位置（`drop-slot-placeholder`），釋放時 180ms cubic-bezier 平滑吸附落位 | ✅ PASS |
| **看板邊緣雙向滾動** | [AC-3.1 & 3.2] 左右兩側平滑自動滾動 | 拖曳靠近螢幕左/右側 20% 區域時，看板容器自動向左或向右平滑滾動，移開或釋放立即停止 | ✅ PASS |

---

## 🛡️ 靜態建置與型別安全 (Build & Typecheck)
- **Next.js Production Build**：`next build` 編譯通過（無 Error、無 Warning）。
- **TypeScript 型別檢查**：嚴格型別校驗 100% 通過。
