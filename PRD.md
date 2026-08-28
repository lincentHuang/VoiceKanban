# 產品需求規格書 (PRD) - Radix UI 基礎元件庫重構

## 1. 專案背景與目標 (Background & Goals)
目前專案中的彈出選單（如看板欄位操作選單 `ColumnActionMenu`、日期時間挑選器 `DateTimePicker`、使用者選單 `Navbar UserMenu`）採用手動定位與原生 `<select>` 實作，容易在靠近螢幕邊緣或縮放視窗時發生 **彈窗裁切（Clipping）、層級遮擋（Z-index/Overflow 衝突）、以及缺乏無障礙鍵盤導航** 的問題。

**目標**：
1. 引進業界標準無頭元件庫 **Radix UI Primitives** (`@radix-ui/react-popover`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-select`)。
2. 建立標準化、可複用的 `src/components/ui/` 基礎積木層。
3. 全面重構目前看板中的 Popups、Dropdowns、Selects 及 DateTimePicker，解決視窗邊界裁切與彈出定位問題，並支援鍵盤操控 (Esc, Enter, Arrow keys) 與流暢的毛玻璃進入動畫。

---

## 2. 功能範疇與規格 (Scope & Specifications)

### 2.1 基礎 UI 積木層 (`src/components/ui/`)
- `popover.tsx`：封裝 Radix Popover，提供 `Popover`, `PopoverTrigger`, `PopoverContent`，支援 Portal、智慧碰撞偵測（`collisionPadding={8}`）、自訂對齊與動畫。
- `dropdown-menu.tsx`：封裝 Radix DropdownMenu，支援一級選單、二級子選單（Sub-menu）、核取項目（CheckboxItem）、分隔線（Separator）與快捷鍵標籤。
- `select.tsx`：封裝 Radix Select，提供客製化下拉觸發器與彈窗清單（`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup` 等），具備完整的捲軸箭頭與微動畫。

### 2.2 業務元件重構
1. **看板列表動作選單 (`ColumnActionMenu.tsx`)**：
   - 替換為 Radix `DropdownMenu`。
   - 排序依據（Sort By）與移動卡片（Move All Cards）改用 Radix `DropdownMenuSub` / `DropdownMenuSubContent` 二級選單。
   - 顏色挑選器改為內嵌於選單的自訂互動區域。
   - 確保第一欄（最左側）或最後一欄（最右側）開啟時自動靠邊，絕對不被視窗裁切。
2. **日期時間挑選器 (`DateTimePicker.tsx`)**：
   - 替換為 Radix `Popover`。
   - 時間挑選（時/分）改用 Radix `Select`。
   - 保持單日、跨天時段（Range Mode）、全天（All Day）切換邏輯。
3. **導航列使用者選單 (`Navbar.tsx`)**：
   - 替換為 Radix `DropdownMenu`，確保點擊頭像時彈出完整帳號資訊、雲端同步狀態與操作項目。
4. **新增任務彈窗與篩選器 (`AddTaskModal.tsx` & `TableView.tsx`)**：
   - 列表選擇、優先級選擇、狀態選擇改用 Radix `Select`。

---

## 3. 驗收標準 (Acceptance Criteria, AC)

- [ ] **AC1（定位與邊界保證）**：在任何解析度與視窗邊緣（特別是最左欄與最右欄），展開 `ColumnActionMenu` 或 `DateTimePicker` 彈窗時，彈窗內容絕不被螢幕邊緣截斷，`collisionPadding` 至少為 8px。
- [ ] **AC2（鍵盤無障礙支援）**：所有 Radix DropdownMenu 與 Select 均支援 `Tab`、`ArrowUp`、`ArrowDown`、`Enter` 選取以及 `Escape` 關閉，關閉後焦點自動回到 Trigger。
- [ ] **AC3（子選單與二級操作）**：`ColumnActionMenu` 的「排序依據」與「移動這個列表的所有卡片」能流暢滑出二級子選單，點擊選項後正確觸發業務邏輯並自動關閉選單。
- [ ] **AC4（五態支援）**：所有 UI 元件在 Loading / Empty / Error / Success / Active 狀態下均有明確視覺回饋。
- [ ] **AC5（樣式與主題一致性）**：保留現代毛玻璃玻璃擬態（Glassmorphism）、深淺色模式（Dark/Light Theme）自適應與橘色品牌強調色。
- [ ] **AC6（編譯與測試 100% 通過）**：`npm run build` 與 TypeScript 型別檢查無任何錯誤。

---

## 4. 團隊分工流水線
1. **`@Architect`**：定義 UI 元件介面與型別。
2. **`@Backend` / 套件管理**：安裝 `@radix-ui` 必要套件並驗證相依性。
3. **`@Frontend`**：實作 `src/components/ui/` 積木與業務元件對接，落實 5 種狀態。
4. **`@QA`**：進行邊界條件驗證與破壞性測試，產出 `QA_REPORT.md`。
