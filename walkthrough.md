# Walkthrough: 全站 React 元件極致模組化重構 (≤ 100 行規範)

本專案已完成全站 React UI 元件的模組化拆分，確保 `src/` 目錄下的所有 `.tsx` 檔案均在 100 行以內。

## 1. 重構成果統計
- **總 TSX 檔案數量**：160+ 個
- **> 100 行的檔案數**：**0 個** (100% 符合規範)
- **TypeScript 型別檢查**：`npm run build` 通過 (0 Errors)
- **開發伺服器**：`http://localhost:3011`

---

## 2. 核心模組拆分架構

### A. 看板核心 (Kanban Core)
- **`EditTaskModal.tsx` (99 行)** ➔ `edit-task/`
  - `EditTaskHeader.tsx`, `EditTaskTitleSection.tsx`, `EditTaskDueDatePicker.tsx`, `EditTaskPriorityStatus.tsx`, `EditTaskCoverPickerModal.tsx`, `EditTaskChecklistSection.tsx`, `EditTaskAttachmentsSection.tsx`, `EditTaskFooter.tsx`, `useEditTaskModal.ts`
- **`TaskCard.tsx` (79 行)** ➔ `task-card/`
  - `TaskCardCover.tsx`, `TaskCardHeader.tsx`, `TaskCardTags.tsx`, `TaskCardBadges.tsx`, `TaskCardSubtasksAccordion.tsx`, `TaskCardRowVariant.tsx`
- **`KanbanColumn.tsx` (72 行)** ➔ `column/`
  - `KanbanColumnHeader.tsx`, `KanbanColumnTaskList.tsx`, `KanbanColumnFooter.tsx`
- **`KanbanContainer.tsx` (75 行)** ➔ `kanban-container/`
  - `BoardViewArea.tsx`, `EmptyBoardPlaceholder.tsx`
- **`BoardCanvasContainer.tsx` (59 行)** ➔ `board-canvas/`
  - `CanvasEmptyState.tsx`, `CanvasColumnList.tsx`
- **`ColumnManagerModal.tsx` (97 行)** ➔ `column-manager/`
  - `ColumnManagerHeader.tsx`, `ColumnManagerDndList.tsx`, `SortableColumnRow.tsx`, `ColumnAddRow.tsx`, `useColumnManager.ts`
- **`SortableChecklistItem.tsx` (79 行)** ➔ `checklist/`
  - `ChecklistInlineEditor.tsx`, `ChecklistItemView.tsx`
- **`ColumnIconPicker.tsx` (70 行)** ➔ `icon-picker/`
  - `emojiData.ts`, `EmojiGrid.tsx`, `IconPickerTrigger.tsx`
- **`BatchActionBar.tsx` (75 行)** ➔ `batch/`
  - `BatchActionLeftInfo.tsx`, `BatchActionStatusSelect.tsx`, `BatchActionDeleteButton.tsx`

### B. 視圖模組 (Views)
- **`TableView.tsx` (68 行)** ➔ `table/`
  - `TableHeaderRow.tsx`, `TableRowItem.tsx` (99 行), `TableRowColumnSelect.tsx`, `TableRowDueDate.tsx`, `TableRowChecklist.tsx`, `TableRowTags.tsx`, `useTableViewModel.ts`
- **`ListView.tsx` (29 行)** ➔ `list/`
  - `ListTaskRow.tsx`, `ListColumnCard.tsx`, `useListViewModel.ts`
- **`CalendarView.tsx` (84 行)** ➔ `calendar/`
  - `CalendarHeaderControls.tsx`, `CalendarDayCell.tsx`, `CalendarDayTaskItem.tsx`, `useCalendarViewModel.ts`

### C. 編輯器與語音 (Editor & Voice)
- **`MarkdownEditor.tsx` (79 行)** ➔ `editor/components/`
  - `EditorHeader.tsx`, `EditorToolbar.tsx`, `MarkdownPreview.tsx`, `useMarkdownEditor.ts`, `markdownBlocks.tsx`
- **`VoiceCaptureOverlay.tsx` (78 行)** ➔ `voice/components/`
  - `VoiceRecordingView.tsx`, `VoiceProcessingView.tsx`, `VoicePreviewForm.tsx`, `VoicePreviewActions.tsx`, `VoiceErrorView.tsx`, `useVoiceCapture.ts`

### D. 導覽、認證與通用 UI (Nav, Auth, Layout & UI)
- **`Navbar.tsx` (75 行)** ➔ `navbar/sections/`
  - `NavbarBrand.tsx`, `NavbarBoardSelect.tsx`, `NavbarActions.tsx`, `NavbarSearchInput.tsx`, `NavbarMenuItems.tsx`, `NavbarSyncStatusCard.tsx`
- **`AuthModal.tsx` (70 行)** & **`AuthLandingScreen.tsx` (55 行)** ➔ `auth/components/`
- **`JoinBoardModal.tsx` (75 行)** & **`ShareBoardModal.tsx` (62 行)** ➔ `collaboration/components/`
- **`SettingsModal.tsx` (91 行)** ➔ `settings/components/`
- **`SidebarInbox.tsx` (98 行)** ➔ `inbox/components/`
- **`QuickPromptHero.tsx` (68 行)** ➔ `quick-prompt/components/hero/`
- **`WorkspaceSplitter.tsx` (45 行)** & **`UnifiedDnDWorkspace.tsx` (60 行)** ➔ `layout/`
- **`BottomDock.tsx` (55 行)** ➔ `navigation/`
- **`page.tsx` (48 行)** ➔ `AppModals.tsx`, `useAppInit.ts`
- **`dropdown-menu.tsx` (88 行)**, **`select.tsx` (78 行)**, **`dialog.tsx` (62 行)** ➔ `ui/`

---

## 3. 驗證結果
- 執行 `find src -name "*.tsx" | xargs wc -l | sort -nr | awk '$1 > 100'` 輸出為 0。
- 執行 `npm run build` 成功建置生產版本，無型別錯誤。
