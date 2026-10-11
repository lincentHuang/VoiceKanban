# Progress

- 2026-10-11：列表選單新增「匯出為 Markdown (.md)」與「複製為 Markdown」，把整欄卡片（標籤、日期、連結、備註、子清單）整理成一份 md（src/features/kanban/utils/columnMarkdown.ts、column-action-menu/useColumnActions.ts）
- 2026-10-11：列表選單新增「從 Markdown 匯入」，可貼上或選 .md 檔，選擇「加入」或「直接覆蓋」；解析器支援本 App 匯出格式與一般 ## 標題／清單（src/features/kanban/utils/columnMarkdownImport.ts、column-action-menu/ColumnImportMarkdownDialog.tsx、useKanbanStore.ts importTasksToColumn）
