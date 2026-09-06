# 🔔 Feature 10: 群組協作即時通知中心 (Collaborative Notifications Feature)

## 1. 模組概述 (Overview)
提供多人群組協同看板下的即時動態通知系統。當看板中其他成員進行關鍵操作時，在線與背景工作的成員將即時獲得視覺反饋（Navbar 鈴鐺紅點、即時右上角 Toast 浮動快訊、Web Notification 桌面推播），並能透過通知中心面板完整檢視操作記錄。

## 2. 模組架構與目錄結構 (Directory Structure)
```text
src/features/notifications/
├── components/
│   ├── NotificationBell.tsx            # Navbar 鈴鐺圖示與未讀紅點 Badge
│   ├── NotificationPopover.tsx         # 通知中心下拉面板與過濾器 (UI 5 態)
│   ├── NotificationItemCard.tsx        # 單一動態項目卡片與動作圖示
│   ├── NotificationToastContainer.tsx  # 右上角浮動 Toast 佇列容器
│   └── NotificationToastItem.tsx       # 單一浮動 Toast 快訊卡片
├── services/
│   └── notificationService.ts          # Web Notification API、本地存儲與訊息格式化
├── types/
│   └── index.ts                        # NotificationItem, ActivityPayload 型別定義
├── index.ts                            # 模組統一出口
└── feature.md                          # 規格與 AC 驗收標準文檔
```

## 3. 核心功能與業務邏輯 (Core Features & Logic)
1. **多維度即時通知**：
   - 頂部 Navbar 鈴鐺（`NotificationBell`）動態顯示未讀數紅點徽章。
   - 點擊展開通知中心面板（`NotificationPopover`），支援「全部標為已讀」、「一鍵清空所有通知」與「桌面推播授權切換」。
   - 右上角 4 秒自動淡出之浮動 Toast 卡片（`NotificationToastContainer`），附操作者頭像與活動說明。
2. **5 類關鍵協同事件廣播**：
   - `task_created`：新增任務
   - `task_moved`：移動任務狀態欄位
   - `task_completed` / `task_uncompleted`：完成或取消完成任務
   - `task_deleted`：刪除任務
   - `member_joined`：新成員加入協作看板
3. **操作者自身過濾原則 (Self-Action Exclusion)**：
   - 自身所做的操作絕對不對自己發送通知，確保無干擾專注工作體驗。
4. **Web Notification 桌面系統推播**：
   - 當頁面處於背景（`document.hidden`）或切換至其他分頁時，透過 Web Notification API 發送原生系統橫幅，點擊可直接切換聚焦回應用視窗。
5. **資料持久化與點擊高亮聚焦**：
   - 本機 LocalStorage 保存最新 50 筆通知紀錄。
   - 點擊通知中心內的任務動態，自動定位至該任務所屬看板並開啟/聚焦任務。

## 4. UI 5 種狀態 (UI 5 States)
- **Loading**：通知載入時提供骨架屏動畫。
- **Empty**：無通知時顯示 🔕「目前沒有任何協作動態」引導文案。
- **Error**：網路中斷或讀取失敗時顯示友善錯誤提示。
- **Success**：一鍵全部標為已讀或清空時即時切換完成狀態。
- **Active**：未讀通知具備專屬微光與背景色標記，點擊項目具備縮放反饋。

## 5. 模組驗收標準 (Feature Acceptance Criteria)
- [x] **FAC-NOTIF-1**：多人協作看板中，成員 A 操作卡片（新增/移動/完成/刪除），成員 B 介面能即時收到右上角 Toast 與鈴鐺未讀紅點更新。
- [x] **FAC-NOTIF-2**：成員 A 本身不會收到自己產生的操作通知。
- [x] **FAC-NOTIF-3**：通知中心支援「全部標為已讀」、「一鍵清空」與「開啟/關閉桌面推播」。
- [x] **FAC-NOTIF-4**：Web Notification 桌面推播在獲得授權且視窗位於背景時正常觸發。
- [x] **FAC-NOTIF-5**：全域 TypeScript 型別檢查無誤，符合 Next.js Feature-Driven 架構規範。
