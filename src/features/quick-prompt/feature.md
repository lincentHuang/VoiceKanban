# ⚡ Feature: 快速自然語言指令輸入 (Quick Prompt Feature)

## 1. 模組概述 (Overview & Purpose)
本模組提供使用者在主畫面頂端快速進行文字自然語言速記的輸入管道。結合快捷鍵觸發、快速語音發送、自然語言智能預先分流（Direct Dispatch to Columns / Inbox），讓高頻使用者在不打開複雜表單的情況下秒級建立任務。

---

## 2. 核心功能規格 (Core Capabilities)
1. **極速單行輸入與語意分流 (Fast Prompt & NLP Parsing)**：
   - 支援輸入例如：「明天下午三點 和客戶開會 #work !urgent」
   - 自動萃取日期、優先級（`!urgent` / `!high`）與標籤（`#tag`）。
2. **快捷語音按鈕整合 (Voice Mic Trigger)**：
   - 輸入框內建麥克風快捷圖標，一鍵跳轉進入語音擷取浮層。
3. **即時發送與鍵盤快捷鍵 (Instant Dispatch & Keyboard Navigation)**：
   - 按下 `Enter` 立即建立並清空輸入框，自動定位至收件匣或預設欄位。

---

## 3. 元件架構 (Components Hierarchy)
```text
src/features/quick-prompt/
├── components/
│   └── QuickPromptHero.tsx    # 頂部自然語言快速輸入列與魔法按鈕
├── index.ts                   # 模組統一出口
└── feature.md                 # 功能規格與驗收標準文檔
```

---

## 4. UI 5 種狀態規範 (5 UI States)
- **Idle**：半透明毛玻璃膠囊造型輸入框，顯示「✨ 試試輸入：明天早上 9 點 團隊站會 #work...」。
- **Typing (Active)**：聚焦時呈現外圈光暈，右側送出按鈕高亮。
- **Loading**：按下 AI 智慧魔法棒時呈現旋轉進度提示。
- **Success**：送出後輸入框微縮回彈動畫，任務即時出現在列表中。
- **Empty / Error**：輸入空白時按下送出按鈕無效並輕微震動（Shake feedback）。

---

## 5. 驗收標準 (Acceptance Criteria, AC)
- [x] **AC-PROMPT-1**：輸入文字後按下 Enter 可秒級新增任務至指定目標。
- [x] **AC-PROMPT-2**：支援快速點擊麥克風圖示切換至語音輸入。
