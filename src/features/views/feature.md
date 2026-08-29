# 📊 Feature: 多維度檢視切換系統 (Multi-Views System)

## 1. 模組概述 (Overview & Purpose)
本模組提供使用者在不同工作情境下的任務視覺化檢視維度。除預設的看板視圖（Kanban Board）外，亦提供表格視圖（Table View）、行事曆視圖（Calendar View）與列表視圖（List View），滿足專案追蹤、排程規劃與批次檢視的需求。

---

## 2. 核心功能規格 (Core Capabilities)
1. **多重視圖無縫切換 (Seamless View Switching)**：
   - **Kanban Board**：標準欄位泳道拖曳視圖。
   - **Table View**：類似 Notion / Airtable 的表格清單，支援就地編輯欄位（狀態、優先級、到期日、標籤）。
   - **Calendar View**：按月/週分佈的任務排程日曆，可視化過期與近期截止任務。
   - **List View**：簡潔垂直待辦清單，適合專注逐項核對。
2. **全域過濾與搜尋聯動 (Global Filter & Search Sync)**：
   - 標籤篩選、優先級過濾、搜尋關鍵字在所有視圖間即時同步。
3. **底部懸浮 Dock 切換 (Dock Controller)**：
   - 底部膠囊 Dock 隨時一鍵切換當前視圖，具備平滑過渡動畫。

---

## 3. 元件架構 (Components Hierarchy)
```text
src/features/views/
├── components/
│   ├── TableView.tsx          # 表格視圖元件 (結構化行列展示與就地編輯)
│   ├── CalendarView.tsx       # 行事曆視圖元件 (月度/週度時間排程)
│   └── ListView.tsx           # 緊湊待辦清單視圖元件
├── index.ts                   # 模組統一出口
└── feature.md                 # 功能規格與驗收標準文檔
```

---

## 4. UI 5 種狀態規範 (5 UI States)
- **Loading**：視圖切換瞬間呈現流暢的 Cross-fade 淡入淡出與骨架預載。
- **Empty**：篩選後若無視圖資料，顯示「未找到符合條件的任務」與「清除篩選條件」按鈕。
- **Error**：視圖渲染異常時展示錯誤回退卡片與重試按鈕。
- **Success**：就地編輯屬性（如在表格中直接切換優先級）即時生效無延遲。
- **Active**：行事曆選中日期格或表格聚焦行時呈現強調高亮背景。

---

## 5. 驗收標準 (Acceptance Criteria, AC)
- [x] **AC-VIEW-1**：點擊底部 Dock 可切換至 Kanban / Table / Calendar / List 視圖，資料無縫同步。
- [x] **AC-VIEW-2**：表格視圖中支援直接點擊變更狀態與優先級。
- [x] **AC-VIEW-3**：行事曆視圖正確根據任務 `dueDate` 渲染在對應日期格子中。
