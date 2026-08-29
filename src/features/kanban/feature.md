# 📋 Feature: 看板與任務管理核心 (Kanban & Task Management)

## 1. 模組概述 (Overview & Purpose)
看板與任務管理是本系統的核心工作區。支援雙向卡片拖曳排序（DnD）、狀態列欄位拖曳重排（Column Reordering via Header Drag / Long Press）、最右側行內極速新增欄位、Lexorank 毫秒級高併發排序鍵、即時插入槽預覽（Drop Slot Placeholder Indicator）、自訂多欄位與 WIP 上限、多選批次操作，以及全功能的任務 CRUD 與詳細編輯彈窗。

---

## 2. 核心功能規格 (Core Capabilities)
1. **狀態列欄位拖曳重排 (Column DnD Reorder)**：
   - 支援抓住欄位 Header（或長按 200ms）進行水平平滑拖曳排序，即時預覽換位並持久化順序。
2. **最右側行內極速新增欄位 (Inline Column Creation)**：
   - 看板橫向末端提供「+ 新增欄位」卡片，行內輸入名稱 Enter 立即建立新狀態欄位。
3. **雙向卡片拖曳與即時預覽槽 (Bi-directional DnD & Live Slot Indicator)**：
   - 跨欄與同欄拖曳時，精確於目標位置渲染虛線高亮預覽槽（Live Drop Slot），指示落點。
   - 基於 `pointerWithin` 與平滑幾何中心 `closestCenter` 的防抖碰撞偵測演算法，完美分離 Column 與 Task 拖曳。
4. **Lexorank 排序引擎 (Lexorank Engine)**：
   - 任務排序鍵符合 Base36 字元規格，支援任意卡片間隙快速插入與重排。
5. **欄位管理與全欄位色彩 (Column Management & Full-Column Styling)**：
   - 支援新增、重命名、變更全欄位柔和淺色主題（包含清新淺綠、溫暖淺黃、晨曦淺橘、恬靜淺紫、柔霧淺藍、浪漫淺粉、冰晶淺青、嫩芽草綠、奶茶燕麥、質感冷灰等淺色調）。
   - 欄位顏色全面套用於整個欄位容器背景與邊框，移除單一線條，呈現精緻層次與卡片對比度。
   - 支援刪除欄位與設定 WIP (Work-In-Progress) 數量上限，超過時呈現視覺警示。
6. **任務全屬性 CRUD (Task CRUD & Modals)**：
   - `AddTaskModal`：快速新增任務（標題、描述、優先級、到期日、標籤、預估時間）。
   - `EditTaskModal`：完整編輯器（含 Markdown 筆記、子任務清單 Checklist、色彩封面 Cover、附件、優先級標籤）。
7. **多選與批次操作 (Batch Selection & Action Bar)**：
   - 支援勾選多張卡片，底部浮動 `BatchActionBar` 提供批次移動欄位、批次變更優先級、批次完成與批次刪除。

---

## 3. 元件架構 (Components Hierarchy)
```text
src/features/kanban/
├── components/
│   ├── BoardCanvasContainer.tsx   # 看板主畫布容器 (支援視圖切換與篩選)
│   ├── KanbanContainer.tsx        # 看板欄位橫向滾動與欄位 Sortable 容器 (含最右側新增欄位)
│   ├── KanbanColumn.tsx           # 單一欄位容器 (包含欄位標頭拖曳把手、全欄位色彩背景、卡片列表、預覽槽)
│   ├── TaskCard.tsx               # 單一任務卡片 (支援優先級、標籤、封面、子任務進度、到期狀態)
│   ├── AddTaskModal.tsx           # 新增任務彈窗
│   ├── EditTaskModal.tsx          # 編輯任務彈窗 (完整屬性編輯)
│   ├── BatchActionBar.tsx         # 多選批次操作懸浮列
│   ├── ColumnActionMenu.tsx       # 欄位下拉選單 (淺色選色器、排序、清除、編輯)
│   └── ColumnManagerModal.tsx     # 欄位管理與自訂彈窗
├── index.ts                       # 模組統一出口
└── feature.md                     # 功能規格與驗收標準文檔
```

---

## 4. UI 5 種狀態規範 (5 UI States)
- **Loading**：看板資料初始載入或同步時呈現骨架屏（Skeleton Loader）。
- **Empty**：欄位無任務時顯示簡潔的 Empty State 虛線區域與「點擊新增任務」提示。
- **Error**：操作失敗時 Toast 提示並自動還原樂觀更新（Optimistic Rollback）。
- **Success**：任務建立、批次操作、欄位新增或重排完成時給予震動反饋或微動畫提示。
- **Active**：卡片或欄位拖曳中呈現 3D 浮空 `DragOverlay`，目標位置呈現高亮與預覽插槽。

---

## 5. 驗收標準 (Acceptance Criteria, AC)
- [x] **AC-KANBAN-1**：狀態列欄位支援 Header 拖曳與長按橫向重排，順序即時更新並持久化至 store 與雲端。
- [x] **AC-KANBAN-2**：看板最右側具備行內「+ 新增欄位」功能，可快速自訂名稱、圖示與顏色。
- [x] **AC-KANBAN-3**：跨欄與同欄拖曳卡片時即時顯示預覽插槽，放開後精確插入目標索引。
- [x] **AC-KANBAN-4**：快速揮動拖曳卡片不發生欄位亂跳或閃爍（防抖碰撞策略）。
- [x] **AC-KANBAN-5**：支援自訂欄位名稱、顏色、順序與 WIP 上限警示。
- [x] **AC-KANBAN-6**：任務詳細編輯彈窗完整支援 Markdown 編輯、Checklist、標籤與附件。
- [x] **AC-KANBAN-7**：多選批次操作列功能（批次移動/刪除/改優先級）正常運作。
- [x] **AC-KANBAN-8**：欄位顏色套用於整個欄位容器背景與邊框，提供全新柔和淺色選項與高對比勾選識別。

