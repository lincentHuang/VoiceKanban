# VoiceKanban 手機版長按拖曳與雙向自動滾動規格書 (PRD.md v2.21.0)

> **版本**：v2.21.0 (Mobile DragOverlay Fix & Trello Silk-Smooth Experience)  
> **負責人**：`@PM`  
> **核心目標**：
> 1. **修復長按卡片消失問題 (DragOverlay Isolation)**：徹底修復在 `DragOverlay` 內重疊呼叫 `useSortable` 導致的雙重位移（Double Translation）與 25% 半透明虛線問題。透過 `isOverlay` 隔離屬性，保證懸浮卡片在長按瞬間立體浮起、精準跟隨手指。
> 2. **Trello 等級絲滑懸浮視覺體驗 (Trello-like Floating Visuals)**：
>    - 手機長按 250ms 觸發微震動提示 (`navigator.vibrate(30)`)。
>    - 懸浮卡片呈現 `scale-105` 放大、`rotate-2` 輕微傾斜與 `shadow-2xl` 深度立體光影。
>    - 原位置保留平滑虛線插槽（`drop-slot-placeholder`），跨欄與欄內拖曳插槽即時切換。
> 3. **看板邊緣雙向智慧自動滾動 (Horizontal Auto-Scrolling)**：拖曳卡片靠近螢幕左右邊緣（20% 區域）時，以加速度平滑捲動看板，支援跨多欄位單手流暢操作。

---

## 🎯 核心規格與驗收標準 (AC)

### 1. 手機端長按懸浮卡片保證可見 (DragOverlay Visibility Guarantee)
- **驗收標準 (AC)**：
  - [AC-1.1] 長按 250ms 觸發拖曳時，手指正下方立即浮現完整的實體卡片，100% 不透明、清晰可見，絕不發生卡片消失或飛出螢幕外的異常。
  - [AC-1.2] 懸浮卡片不受 `useSortable` 重複 transform 影響，精準吸附於觸控點中心。
  - [AC-1.3] 觸發拖曳瞬間發出微震動反饋（Haptic Feedback），並禁止系統長按文字選取彈窗。

---

### 2. Trello 級絲滑視覺與插槽互動 (Silky Trello Experience)
- **驗收標準 (AC)**：
  - [AC-2.1] 懸浮卡片具備微傾斜（`rotate-2`）與加深投影（`shadow-2xl ring-2 ring-orange-500/30`），呈現自然懸浮感。
  - [AC-2.2] 欄位中的目標插入位置即時呈現專用虛線佔位方塊（`drop-slot-placeholder`）。
  - [AC-2.3] 放開手指時具備平滑 180ms 歸位動畫（`dropAnimation`），無生硬跳動。

---

### 3. 雙向邊緣自動平滑滾動 (Edge Auto-Scrolling)
- **驗收標準 (AC)**：
  - [AC-3.1] 拖曳卡片至看板左右邊界 20% 範圍內時，看板自動向左或向右平滑滾動。
  - [AC-3.2] 釋放卡片或移開邊緣時立即停止滾動。
