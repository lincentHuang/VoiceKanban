# QA 驗收報告：任務詳情標籤管理極速下拉與介面精簡 (Task Detail Inline Tag Combobox)

## 1. 驗收摘要
- **功能項目**：任務詳情視窗（`EditTaskModal`）標籤管理 input 點擊即展下拉面板，精簡標頭與輸入框下方提示。
- **驗收標準**：對照 `PRD.md` §3.4 與 `src/features/kanban/feature.md` **AC-KANBAN-22**。
- **測試結果**：**100% 通過（10/10 測試情境全數通過）**。
- **TypeScript 構建檢查**：`npm run build` 與 `npx tsc --noEmit` 0 Errors，0 Warnings。
- **UI 行數規範**：所有新增與重構之 `.tsx` 與 `.ts` 檔案均嚴格限制在 ≤ 100 行以內。
- **本機預覽**：開發伺服器穩定運行於 `http://localhost:3011`。

---

## 2. 測試矩陣與邊界值驗證

| 測試編號 | 測試項目 | 測試情境與邊界條件 | 驗收結果 |
| :--- | :--- | :--- | :---: |
| **TC-EDIT-TAG-01** | 點擊/聚焦 Input 展開既有標籤 | 點擊或聚焦標籤輸入框時，下方立即展開目前既有標籤下拉面板，顯示名稱與使用次數 | ✅ 通過 |
| **TC-EDIT-TAG-02** | 既有標籤勾選識別 | 當前任務已擁有的標籤呈現橘底與勾選核取方塊（`[✓]`），未套用則為空框 | ✅ 通過 |
| **TC-EDIT-TAG-03** | 點選標籤即時切換與防失焦 | 點選任何標籤即刻切換選取／取消，輸入框不丟失焦點，支援連續點選多個標籤 | ✅ 通過 |
| **TC-EDIT-TAG-04** | 即時關鍵字搜尋過濾 | 輸入文字時，下拉清單即時過濾符合之標籤（不區分大小寫） | ✅ 通過 |
| **TC-EDIT-TAG-05** | 新建標籤選項提示 | 輸入工作區尚無之標籤名稱時，動態顯示「+ 建立『xxx』」選項按鈕 | ✅ 通過 |
| **TC-EDIT-TAG-06** | Enter 與新增按鈕提交 | 按 Enter 或點擊「新增」或點擊建立選項，皆能立即加入新標籤並清空輸入框 | ✅ 通過 |
| **TC-EDIT-TAG-07** | 中文注音 IME 組字保護 | 繁體中文注音輸入確認字詞時（Enter），阻斷組字送出，杜絕誤送出或重複建立 | ✅ 通過 |
| **TC-EDIT-TAG-08** | 標頭介面精簡 | 移除右上角冗餘的「管理標籤」按鈕，標頭純淨呈現 `🏷️ 標籤管理` | ✅ 通過 |
| **TC-EDIT-TAG-09** | 輸入框下方提示文字移除 | 徹底移除舊版「尚未加上標籤 — 點擊瀏覽既有標籤」冗餘提示文字；僅在有標籤時顯示 Chip | ✅ 通過 |
| **TC-EDIT-TAG-10** | 點擊外圍與 ESC 鍵收合 | 點擊面板外圍或按 ESC 鍵即刻平滑收合下拉面板，不影響其他區塊操作 | ✅ 通過 |

---

## 3. 元件架構與行數稽核 (Line Count Audit)

| 元件檔案路徑 | 行數 | 規範要求 | 狀態 |
| :--- | :---: | :---: | :---: |
| `src/features/kanban/components/edit-task/EditTaskTagsSection.tsx` | 88 | ≤ 100 行 | ✅ 通過 |
| `src/features/kanban/components/edit-task/tags/useEditTaskTags.ts` | 83 | ≤ 100 行 | ✅ 通過 |
| `src/features/kanban/components/edit-task/tags/EditTaskTagDropdown.tsx` | 91 | ≤ 100 行 | ✅ 通過 |
| `src/features/kanban/components/edit-task/tags/EditTaskTagChips.tsx` | 34 | ≤ 100 行 | ✅ 通過 |

---

## 4. UI 5 種狀態審查 (5 UI States Compliance)
1. **Loading**：下拉選單具備 150ms 快速縮放與淡入微動畫（`fade-in-0 zoom-in-95`），無延遲與閃爍。
2. **Empty**：全域無標籤時提示「尚無標籤，輸入文字按 Enter 即可建立」；搜尋無結果時提示「找不到符合的標籤」；任務尚未套用標籤時下方保持純淨空間。
3. **Error**：輸入純空白時新增按鈕自動禁用（`disabled`），防止建立空標籤；已存在的標籤不重複新增。
4. **Success**：標籤點選即刻更新狀態、寫入任務並觸發全域 Store 與雲端即時同步。
5. **Active / Interactive**：輸入框支援點擊展開、ESC/外圍關閉、Hover 柔和高亮，選單具備深淺色毛玻璃質感（`backdrop-blur-2xl`）。

---

## 5. 驗收結論
**PASS 驗收通過**。任務詳情標籤管理 Combobox 下拉與介面精簡已全數完成，所有行數標準與 TypeScript 構建皆 100% 通過。
