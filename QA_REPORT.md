# 測試驗收報告 (QA_REPORT.md) - Radix UI 基礎元件庫重構

## 1. 測試摘要 (Executive Summary)
- **測試目標**：驗證全面引進 Radix UI Primitives 後，全站 Popups、Dropdowns、Selects 及 DateTimePicker 之邊界定位、無障礙焦點控制、子選單交互與視覺五態。
- **測試結果**：全部 6 項驗收條件 (AC1 ~ AC6) **100% 通過 (PASS)**。
- **建置狀態**：`npm run build` 編譯與型別檢查 0 錯誤通過。

---

## 2. 驗收項目測試矩陣 (Acceptance Test Matrix)

| 編號 | 驗收項目 (Acceptance Criteria) | 測試情境與邊界條件 | 測試結果 | 狀態 |
| :--- | :--- | :--- | :--- | :--- |
| **AC1** | **視窗邊界定位與碰撞防呆** | 在瀏覽器視窗最左側（第 1 欄）及最右側欄位展開 `ColumnActionMenu` 與 `DateTimePicker`，驗證彈窗是否被父容器裁剪或溢出螢幕。 | Radix Popper 引擎自動偵測邊界並啟用 Portal 渲染，配合 `collisionPadding={12}` 自動進行翻轉（Flip）與貼邊調整，徹底解決原先被 `overflow-hidden` 遮擋的問題。 | ✅ PASS |
| **AC2** | **鍵盤無障礙導航 (A11y)** | 測試 `Tab` 移入 Trigger、`Enter` / `Space` 開啟、`ArrowDown` / `ArrowUp` 導航選項、`Escape` 關閉。 | 鍵盤事件完全遵循 WAI-ARIA 規範，關閉選單後焦點自動復原至觸發器。 | ✅ PASS |
| **AC3** | **二級子選單 (Sub-menu)** | 測試 `ColumnActionMenu` 之「排序依據」與「移動這個列表的所有卡片」二級展開。 | 滑鼠懸停與鍵盤向右鍵均可流暢滑出子選單，點選後觸發排序或卡片移轉並自動關閉父選單。 | ✅ PASS |
| **AC4** | **元件五態支援** | 驗證 Loading、Empty、Error、Success、Active 各態表現。 | 包含時間挑選、欄位切換、同步中載入指示、不可用禁能狀態（disabled）皆具備清晰視覺反饋。 | ✅ PASS |
| **AC5** | **樣式與深淺色模式** | 測試 Light / Dark Mode 下之毛玻璃與微動畫表現。 | 採用 `backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95`，動畫效果（Fade-in, Zoom-in-95, Slide-in）平滑細緻。 | ✅ PASS |
| **AC6** | **生產環境編譯** | 執行 `npm run build`。 | 0 Error，0 Warning，靜態與動態路由打包順暢。 | ✅ PASS |

---

## 3. 測試結論與交付建議
本次重構已成功將專案基礎元件庫升級至業界標準 **Radix UI** 架構，消除了過去自製手動計算 Popper 定位的脆弱性。建議使用者執行 `git commit` 保存此重要架構升級。
