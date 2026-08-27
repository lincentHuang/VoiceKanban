# VoiceKanban 看板卡片子任務展開與即時完成規格書 (PRD.md v2.23.0)

> **版本**：v2.23.0 (Kanban Card Subtask Inline Expansion & Interactive Completion)  
> **負責人**：`@PM`  
> **決策共識 (Grill Me 結論)**：
> 1. **展開樣式 (Q1-A)**：卡片內嵌平滑向下展開（Accordion/Card Expansion），直接呈現每項子任務項目，並提供展開/收合切換。
> 2. **操作功能 (Q2-B)**：支援瀏覽與即時點擊 Checkbox 完成/取消完成；維持極簡，新增/編輯子任務仍透過詳細編輯彈窗進行。
> 3. **全數完成行為 (Q3-A)**：當子任務全部打勾時，徽章與進度條轉為綠色滿額樣式並觸發微型慶祝彩花（Confetti），母任務維持當前欄位與狀態不自動轉移，由使用者自主控制。
> 4. **適用範圍 (Q4-B)**：主要應用於標準看板直式卡片（TaskCard vertical card variant）。

---

## 🎯 核心規格與驗收標準 (AC)

### 1. 子任務徽章互動與展開切換 (AC-1)
- **[AC-1.1]** 當卡片包含子任務清單（`task.checklist.length > 0`）時，底部子任務徽章（`☑️ X/Y`）具備可點擊互動樣式（Hover 效果、Cursor Pointer、Tooltip 提示「點擊展開/收合子任務」）。
- **[AC-1.2]** 點擊子任務徽章時，觸發子任務列表平滑向下展開，並停止事件冒泡（`stopPropagation`），**絕不誤觸**打開 TaskCard 的編輯彈窗，亦不觸發拖曳（DnD）。
- **[AC-1.3]** 展開後，徽章顯示為 Active 啟用狀態（例如高亮背景與折疊箭頭指示），再次點擊即可平滑收合。

---

### 2. 子任務即時勾選與進度反饋 (AC-2)
- **[AC-2.1]** 展開區域內列出該卡片的所有子任務，每個項目包含：
  - 獨立的勾選按鈕（Checkbox / CheckSquare）
  - 子任務文字（完成時呈現刪除線 `line-through` 與柔和文字色彩）
- **[AC-2.2]** 點擊任何子任務 Checkbox，立即呼叫 `toggleChecklistItem(taskId, itemId)` 更新 Zustand store 及觸發同步。
- **[AC-2.3]** 點擊 Checkbox 時嚴格阻擋事件冒泡（`onPointerDown` 與 `onClick` 皆 `stopPropagation`），防止觸發卡片點擊與拖曳。
- **[AC-2.4]** 當最後一個未完成子任務被勾選為完成時，觸發慶祝彩花效果（`confetti`）並將徽章更新為 `☑️ Y/Y` 全滿綠色樣式。

---

### 3. 五種狀態完整涵蓋 (AC-3)
- **[AC-3.1]** **Active 展開狀態**：流暢過渡顯示子任務清單，具備細緻的邊框與背景層次（支援深色模式 Dark Mode）。
- **[AC-3.2]** **Empty 空狀態**：若卡片沒有子任務，不顯示可展開徽章；展開區不出現多餘空白。
- **[AC-3.3]** **Success 完成狀態**：子任務勾選後即時反映完成進度條與百分比徽章。
- **[AC-3.4]** **Loading / Optimistic 更新狀態**：點擊立即無延遲樂觀更新本地 UI，背景非同步持久化與雲端同步。
- **[AC-3.5]** **Error 防呆狀態**：無效項目或刪除之項目具備安全防護，不造成組件崩潰。

---

### 4. 邊界與無障礙體驗 (AC-4)
- **[AC-4.1]** 多選模式（`isMultiSelectMode`）或卡片拖曳期間，展開狀態正常保持且操作不衝突。
- **[AC-4.2]** 支援鍵盤可聚焦（Accessibility ARIA 標籤與鍵盤 Enter / Space 操作支援）。
