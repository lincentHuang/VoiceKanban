# 🎙️ Feature: AI 語音擷取與自然語言解析 (Voice & AI Extraction)

## 1. 模組概述 (Overview & Purpose)
本模組提供智慧型多模態語音擷取體驗。使用者透過語音輸入日常瑣事、會議記錄或多個待辦，系統結合 Web Speech API 即時語音辨識、即時聲波視覺化（Audio Visualizer）與 Google Gemini 2.5 Flash / Pro 模型進行結構化萃取（包含標題、描述、到期時間、優先級、目標欄位、標籤與子任務清單）。在無網路或無 API Key 時具備本機 Local NLP 備援解析引擎。

---

## 2. 核心功能規格 (Core Capabilities)
1. **即時語音錄製與聲波視覺化 (Voice Recording & Audio Waveform)**：
   - 點擊右下角懸浮按鈕 `VoiceFAB` 即可啟動錄音。
   - `AudioVisualizer` 透過 Web Audio API 即時分析麥克風頻譜，渲染動態脈衝聲波。
2. **多語言支援與自動偵測 (Multi-language Support)**：
   - 支援繁體中文（zh-TW）、英文（en-US）、日文（ja-JP）等多語系切換與自動語言偵測。
3. **Gemini AI / 本機 NLP 結構化任務解析 (AI Structured Extraction)**：
   - 聚焦精確萃取**任務標題 (`title`)** 與 **目標欄位 (`targetColumnId`)**，以及可選之到期時間與優先級。
   - **簡潔直覺建立**：語音新增卡片時**不額外於說明欄位（`description`）填充逐字稿備註**，保持卡片說明純淨。
   - 支援辨識欄位關鍵字（進行中、待辦清單、已完成、等待/卡關、收件夾及自訂欄位名稱），自動分流對應欄位。
4. **多任務自動拆解 (Multi-task Auto Splitting)**：
   - 當使用者一口氣說出多件事（例如：「明天下午開會，順便記得買牛奶還有寄發票」），AI 自動辨識並拆解成多張獨立任務卡片。
5. **本機 Local NLP 備援解析 (Offline / Fallback Local Parser)**：
   - 在無 API Key 或離線時，本機正規表達式與日期分析器自動解析關鍵字與時間。
6. **智慧回饋學習引擎 (Learning Engine)**：
   - 使用者在彈窗手動調整 AI 推斷的欄位或優先級時，學習引擎記錄偏好，提升下次辨識準確度。

---

## 3. 元件架構 (Components Hierarchy)
```text
src/features/voice/
├── components/
│   ├── VoiceFAB.tsx             # 懸浮語音快捷圓形按鈕 (支援快捷鍵與波紋特效)
│   ├── VoiceCaptureOverlay.tsx  # 語音錄製、文字編輯、AI 解析與確認預覽全螢幕/浮層
│   └── AudioVisualizer.tsx      # Web Audio API 聲波波形動態視覺化 Canvas
├── index.ts                     # 模組統一出口
└── feature.md                   # 功能規格與驗收標準文檔
```

---

## 4. UI 5 種狀態規範 (5 UI States)
- **Idle**：`VoiceFAB` 靜態懸浮，帶有麥克風圖標與微漸層。
- **Recording (Active)**：彈窗開啟，麥克風呼吸跳動，`AudioVisualizer` 聲波隨音量即時跳動，即時顯示語音辨識文字。
- **Processing (Loading)**：錄音結束，AI 正在分析語意，顯示晶亮紫光進度條與「AI 正在結構化您的任務...」旋轉動畫。
- **Preview (Success)**：AI 提取完成，以卡片形式呈現提取的標題、時間、優先級、標籤，允許使用者就地微調。
- **Error**：麥克風權限被拒絕、語音空白或 API 解析超時時，顯示清楚錯誤提示並切換至手動輸入模式。

---

## 5. 驗收標準 (Acceptance Criteria, AC)
- [x] **AC-VOICE-1**：麥克風權限授權正常，錄音期間聲波視覺化隨音量即時跳動。
- [x] **AC-VOICE-2**：支援自然語言時間萃取（例如「明天早上 9 點」、「後天」），轉換為正確 ISO 時間。
- [x] **AC-VOICE-3**：支援長句多任務自動拆分成多張任務卡片。
- [x] **AC-VOICE-4**：離線或無 API Key 時無縫降級為 Local NLP 解析，流程不中斷。
- [x] **AC-VOICE-5**：**即時動態欄位適配 (Dynamic Board Column Adaptation)**：
  - 語音辨識預覽視窗自動取得當前選定看板之所有自訂與預設欄位（含圖示與名稱），不再受限於靜態預設欄位。
  - 當特定欄位點擊語音按鈕觸發時，若語音口述未指定其他欄位，精準優先指向該欄位；若口述明確提及特定欄位名稱則智慧精確分流。
- [x] **AC-VOICE-6**：**預覽介面換行排版與手機端按鈕防擠壓優化 (Layout Line Break & Mobile Anti-Squish Action Buttons)**：
  - 「優先等級」與「到期時間」分行獨立排列（各佔一行），消除水平擠壓。
  - 手機小螢幕下，「重新錄音」與「捨棄」自動轉換為簡約圖示按鈕（Icon Buttons），防範文字折行跑版。
  - 建立確認按鈕精簡為「✓ 確認」，視覺簡潔俐落。
- [x] **AC-VOICE-7**：**極簡俐落語音彈窗與文字敘述輕量化 (Clean & Minimalist Voice Modal)**：
  - 彈窗頂部固定標題為「語音輸入」，移除「離線半自動學習 (零 API 依賴)」與「語系切換器」等不必要之視覺干擾。
  - 預覽狀態移除多餘技術提示（「✨ 本地半自動模型已套用」、「✨ 已透過純前端 Web Speech...」等），口述逐字稿與任務設定呈現乾淨清晰。
