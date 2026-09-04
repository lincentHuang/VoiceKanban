# 📥 Feature: 快速收件匣 (Sidebar Inbox Feature)

## 1. 模組概述 (Overview & Purpose)
快速收件匣是任務的「暫存與收集站（Inbox Staging Area）」。讓使用者隨手記錄的待辦、語音擷取的未歸類事項能先統一集中在左側側邊欄，使用者可隨時將其拖曳至主看板各欄位，亦可透過可拖曳寬度分割器（Workspace Splitter）自訂收件匣佔比。

---

## 2. 核心功能規格 (Core Capabilities)
1. **獨立收件匣側邊欄 (Collapsible & Resizable Sidebar)**：
   - 支援展開/收合開關（可透過底部 Dock 或側邊按鈕切換）。
   - 支援滑鼠拖曳邊界即時調整收件匣寬度（240px ~ 480px）。
2. **與看板雙向無縫拖曳 (Bi-directional Drag & Drop)**：
   - 卡片可直接從收件匣拖曳至主看板任意欄位的指定位置。
   - 亦可將看板上的卡片拖曳回收件匣進行暫存。
3. **快速就地新增 (Quick In-place Creation)**：
   - 收件匣頂部提供快速單行輸入框，支援 Enter 即時建立任務。
4. **收件匣任務管理 (Inbox Management)**：
   - 顯示收件匣待辦數量計數徽章（Badge Counter）。
   - 支援搜尋過濾與排序（建立時間、到期日、優先級）。

---

## 3. 元件架構 (Components Hierarchy)
```text
src/features/inbox/
├── components/
│   └── SidebarInbox.tsx       # 側邊收件匣主元件 (含收合、搜尋、任務清單與快捷新增)
├── index.ts                   # 模組統一出口
└── feature.md                 # 功能規格與驗收標準文檔
```

---

## 4. UI 5 種狀態規範 (5 UI States)
- **Loading**：側邊欄載入中顯示精美骨架列表。
- **Empty**：收件匣無任務時顯示「收件匣已清空，好棒！」與舒適插圖。
- **Error**：新增失敗時於輸入框下方顯示紅色警告文字。
- **Success**：任務拖曳至看板或完成時，提供平滑淡出過渡動畫。
- **Active**：拖曳項目進入收件匣時，收件匣呈現邊框微光接收高亮狀態。

---

## 5. 驗收標準 (Acceptance Criteria, AC)
- [x] **AC-INBOX-1**：收件匣可自由收合與調整寬度，狀態被記錄。
- [x] **AC-INBOX-2**：收件匣內任務可雙向拖曳至主看板任何欄位，順序與位置正確無誤。
- [x] **AC-INBOX-3**：支援快速輸入並即時建立任務至收件匣頂部。
- [x] **AC-INBOX-4**：手機版（< sm）收件匣內層容器全寬自適應（w-full min-w-0），各尺寸螢幕（320px ~ 639px）皆 100% 貼合外層卡片，標頭、輸入框、待辦卡片與捲軸均勻延展，右側徹底消除不明空白。
