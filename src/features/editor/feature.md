# 📝 Feature: Markdown 任務筆記編輯器 (Markdown Editor Feature)

## 1. 模組概述 (Overview & Purpose)
本模組提供富文字與 Markdown 格式的任務筆記編輯體驗。讓使用者在任務詳細編輯彈窗中，能夠自由編寫具有標題、粗體、斜體、有序/無序列表、代碼塊、引言與待辦核取方塊（Checklist）的長篇筆記，並提供即時預覽切換。

---

## 2. 核心功能規格 (Core Capabilities)
1. **即時編輯與預覽切換 (Edit & Preview Mode)**：
   - 支援「編輯模式（Write）」與「渲染預覽（Preview）」即時切換。
2. **快捷格式工具列 (Formatting Toolbar)**：
   - 提供粗體（B）、斜體（I）、刪除線（S）、標題（H）、清單（List）、表格（Table）、連結（Link）、代碼（Code）、圖片上傳（Image）等一鍵插入工具。
3. **語法高亮與精緻排版 (Typography & Highlighting)**：
   - 採用 GitHub Flavored Markdown (GFM) 區塊解析架構，支援多行代碼區塊、待辦方塊、水平分隔線（`<hr>`）與 GFM 表格。
   - 表格支援表頭、儲存格水平對齊（左/中/右）、斑馬紋交錯背景、懸停高亮、儲存格內樣式渲染與手機端橫向自適應滾動（`overflow-x-auto`）。

---

## 3. 元件架構 (Components Hierarchy)
```text
src/features/editor/
├── components/
│   └── MarkdownEditor.tsx     # Markdown 雙模編輯器元件 (含區塊解析引擎、工具列與預覽切換)
├── index.ts                   # 模組統一出口
└── feature.md                 # 功能規格與驗收標準文檔
```

---

## 4. UI 5 種狀態規範 (5 UI States)
- **Empty**：筆記為空時顯示優雅的 Placeholder「在此處輸入任務詳細筆記，支援 Markdown...」。
- **Editing (Active)**：輸入焦點時呈現細緻邊框微光。
- **Previewing**：預覽模式下唯讀渲染精美 HTML 排版（含完整表格、清單與分隔線）。
- **Loading**：圖片上傳與大型筆記解析時無卡頓渲染。
- **Error**：非標準字元或解析異常時降級為純文字安全顯示，不產生白屏奔潰。

---

## 5. 驗收標準 (Acceptance Criteria, AC)
- [x] **AC-EDIT-1**：Markdown 工具列按鈕能正確將語法標記插入游標所在處。
- [x] **AC-EDIT-2**：切換至預覽模式時，標題、粗體、列表等樣式正確渲染。
- [x] **AC-EDIT-3**：支援 GFM 標準表格渲染（含表頭、格線、欄位對齊、行內樣式解析與手機端橫向滾動），徹底修復表格失效問題。
- [x] **AC-EDIT-4**：水平分隔線（`---` / `***` / `___`）與多行代碼區塊正確解析並轉換為對應語義標籤，不退化為純文字。
- [x] **AC-EDIT-5**：工具列提供表格一鍵插入按鈕，快速建立標準 Markdown 表格結構。

