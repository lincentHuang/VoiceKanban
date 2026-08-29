# 📅 Feature: 行事曆排程視圖系統 (Calendar View System)

## 1. 模組概述 (Overview & Purpose)
本模組提供使用者時間維度的任務視覺化檢視。針對所有具備到期日（`dueDate`）或開始時間（`startDate`）之任務，以月度/週度時間網格呈現排程，幫助使用者清晰掌握過期、今日與即將截止事項。

---

## 2. 核心功能規格 (Core Capabilities)
1. **行事曆排程視覺化 (Calendar Scheduling)**：
   - 按月/週分佈的任務排程日曆，可視化過期（紅）、即將到期（橘）與正常任務。
   - 點擊卡片可直接開啟任務詳細編輯彈窗。
2. **全域過濾與搜尋聯動 (Global Filter & Search Sync)**：
   - 標籤篩選、優先級過濾、搜尋關鍵字在看板與行事曆間即時同步。
3. **精簡雙重視圖架構 (Focused Dual View Architecture)**：
   - 系統專注於「看板（Kanban）」與「行事曆（Calendar）」兩大核心維度，移除不便使用之 Table 與 List 視圖。

---

## 3. 元件架構 (Components Hierarchy)
```text
src/features/views/
├── components/
│   └── CalendarView.tsx       # 行事曆視圖元件 (月度/週度時間排程)
├── index.ts                   # 模組統一出口
└── feature.md                 # 功能規格與驗收標準文檔
```

---

## 4. UI 5 種狀態規範 (5 UI States)
- **Loading**：視圖切換瞬間呈現流暢的 Cross-fade 淡入淡出與骨架預載。
- **Empty**：篩選後若無視圖資料，顯示「未找到符合條件的任務」與「清除篩選條件」按鈕。
- **Error**：視圖渲染異常時展示錯誤回退卡片與重試按鈕。
- **Success**：編輯任務屬性（如修改到期日）後行事曆即時重新排列。
- **Active**：點選特定日期格或卡片時呈現強調微光高亮。

---

## 5. 驗收標準 (Acceptance Criteria, AC)
- [x] **AC-VIEW-1**：底部 Dock 與頂部選單可切換至 Kanban / Calendar 視圖，資料無縫同步。
- [x] **AC-VIEW-2**：行事曆視圖正確根據任務 `dueDate` 渲染在對應日期格子中。

