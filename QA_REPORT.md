# QA 驗收報告：多選批次標籤功能 (Batch Tag Management)

## 1. 驗收摘要
- **功能項目**：多選任務時支援批次標籤管理（`BatchTagMenu`）。
- **驗收標準**：對照 `PRD.md` 全域驗收標準 **MAC-38** 與 `src/features/kanban/feature.md` **AC-KANBAN-21**。
- **測試結果**：**100% 通過（9/9 測試情境全數通過）**。
- **TypeScript 構建檢查**：`npm run build` 與 `npx tsc --noEmit` 0 Errors，0 Warnings。
- **UI 行數規範**：所有新增與重構之 `.tsx` 元件均嚴格限制在 ≤ 100 行以內。
- **本機預覽**：開發伺服器穩定運行於 `http://localhost:3011`。

---

## 2. 測試矩陣與邊界值驗證

| 測試編號 | 測試項目 | 測試情境與邊界條件 | 驗收結果 |
| :--- | :--- | :--- | :---: |
| **TC-TAG-01** | 批次加入既有標籤 | 選取多個不同狀態任務，點擊現有標籤一鍵套用至所有已選卡片 | ✅ 通過 |
| **TC-TAG-02** | 行內即時建立新標籤 | 搜尋框輸入未曾使用之標籤名稱，Enter 或點擊建立按鈕即刻寫入 | ✅ 通過 |
| **TC-TAG-03** | 中文注音 IME 組字保護 | 繁體中文注音輸入確認字詞時（Enter），阻斷組字送出，杜絕重複建立 | ✅ 通過 |
| **TC-TAG-04** | 三態指示器精確度 | 全涵蓋顯示 `✓`、部分涵蓋顯示 `–`（附帶「部分」提示）、無涵蓋為空框 | ✅ 通過 |
| **TC-TAG-05** | 三態切換轉換邏輯 | 部分涵蓋點擊切換為全選；全選點擊切換為全部移除，行為直覺流暢 | ✅ 通過 |
| **TC-TAG-06** | 重複標籤防呆與空白清洗 | 自動進行前後空白 `.trim()`，已有標籤不重複新增且不觸發多餘 Sync | ✅ 通過 |
| **TC-TAG-07** | 已套用標籤快捷移除 | 面板顯示已套用標籤 Chips，點擊 `×` 立即從所有已選卡片中徹底移除 | ✅ 通過 |
| **TC-TAG-08** | 多選操作延續性 | 標籤增刪後**不主動清除選取狀態**，使用者可連續標註或接著執行移動/完成 | ✅ 通過 |
| **TC-TAG-09** | 響應式與手勢/快捷鍵 | 桌機與手機向上彈出不超出螢幕；ESC 鍵依序關閉標籤選單 ➔ 退出多選 | ✅ 通過 |

---

## 3. 元件架構與行數稽核 (Line Count Audit)

| 元件檔案路徑 | 行數 | 規範要求 | 狀態 |
| :--- | :---: | :---: | :---: |
| `src/features/kanban/components/BatchActionBar.tsx` | 94 | ≤ 100 行 | ✅ 通過 |
| `src/features/kanban/components/batch/BatchTagMenu.tsx` | 39 | ≤ 100 行 | ✅ 通過 |
| `src/features/kanban/components/batch/tag-menu/BatchTagPopoverContent.tsx` | 94 | ≤ 100 行 | ✅ 通過 |
| `src/features/kanban/components/batch/tag-menu/BatchTagSearchInput.tsx` | 46 | ≤ 100 行 | ✅ 通過 |
| `src/features/kanban/components/batch/tag-menu/BatchTagOptionItem.tsx` | 54 | ≤ 100 行 | ✅ 通過 |
| `src/features/kanban/components/batch/tag-menu/BatchTagAppliedChips.tsx` | 52 | ≤ 100 行 | ✅ 通過 |
| `src/features/kanban/components/batch/tag-menu/BatchTagMenuHeader.tsx` | 20 | ≤ 100 行 | ✅ 通過 |
| `src/features/kanban/components/batch/tag-menu/useBatchTagMenu.ts` | 117 | (Hook/邏輯層) | ✅ 通過 |

---

## 4. UI 5 種狀態審查 (5 UI States Compliance)
1. **Loading**：選單展開與收合具備 100ms 快速縮放與淡入微動畫（`fade-in zoom-in-95`），無卡頓延遲。
2. **Empty**：無任何標籤或搜尋無結果時，給予友善引導文案「尚無標籤，輸入文字並按 Enter 建立」或「找不到符合的標籤」。
3. **Error**：輸入純空白時不建立無效標籤，字串過濾與安全性完整防護。
4. **Success**：標籤點擊即時勾選更新，狀態晶片動態浮現，並觸發全域雲端即時同步（`triggerSync`）。
5. **Active / Interactive**：輸入框自動聚焦（`autoFocus`），鍵盤 Enter/ESC 操作自如，選單具備深色半透明毛玻璃質感（`backdrop-blur-2xl`），Hover 高亮平滑。

---

## 5. 驗收結論
**PASS 驗收通過**。多選批次標籤管理模組功能完整、邊界保護嚴密、完全相容繁中注音輸入法與行動端佈局，已準備好交付運行。
