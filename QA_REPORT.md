# VoiceKanban 同步時間戳記與即時狀態指示 QA 驗收報告 (QA_REPORT.md v3.2.0)

> **驗收日期**：2026-08-28  
> **負責人**：`@QA (測試驗收工程師)`  
> **測試狀態**：✅ **100% 通過 (PASS)**  
> **對應規格**：[PRD.md](./PRD.md) v3.2.0

---

## 📋 測試案例與驗收結果 (Test Execution Matrix)

| 模組 | 驗收標準 (AC) | 測試情境與邊界條件 | 驗收結果 |
| :--- | :--- | :--- | :---: |
| **1. 剛同步完成指示** | [AC-6.1] Just Synced Badge | 1 分鐘內同步完成時，副標題顯示「剛剛（目前為最新版本）」，並亮起「最新」綠色徽章 | ✅ PASS |
| **2. 動態相對時間輪詢** | [AC-6.1 & 6.2] Relative Time | 1~59 分鐘顯示「X 分鐘前」、當日顯示「今天 HH:mm」、跨日顯示「M/D HH:mm」，每 15 秒背景定時自動刷新文字無需手動 F5 | ✅ PASS |
| **3. 精確時間 Tooltip** | [AC-6.3] Full Timestamp | 滑鼠懸浮於同步卡片或副標題時，顯示完整 ISO 格式時間（如 `2026/08/28 10:15:30`） | ✅ PASS |
| **4. 多態狀態矩陣** | [AC-6.4] State Matrix (5 態) | `synced` (雲端已同步 / 最新標籤)、`syncing` (正在同步... / 旋轉圖示)、`offline` (離線模式 / 提示連線後自動上傳)、`error` (同步異常 / 點擊重試) | ✅ PASS |
| **5. 訪客本機狀態適配** | [AC-6.5] Guest Storage State | 訪客模式顯示「本機已存檔」與「訪客本機模式」，清楚區分本機快取與正式雲端同步 | ✅ PASS |
| **6. 登入與資料保留** | [AC-1 & AC-2] Auth & Data Safety | 登入載入雲端、登出 100% 保留 Firestore 資料不刪除、訪客無縫升級綁定 | ✅ PASS |

---

## 🛡️ 靜態建置與型別安全 (Build & Typecheck)
- **Next.js Production Build**：`npm run build`（Turbopack）生產環境建置通過（0 錯誤）。
- **TypeScript 5.7.3 型別檢查**：全站嚴格型別校驗 100% 通過（0 錯誤）。
- **邊界值測試**：0s、10s、59s、60s、2m、45m、2h、跨日、null 邊界測試 100% 通過。
