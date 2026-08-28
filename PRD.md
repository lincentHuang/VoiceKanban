# VoiceKanban 離線語音辨識與半自動雙語學習引擎規格書 (PRD.md v4.0.0)

> **版本**：v4.0.0 (Offline Speech Recognition & Semi-Automatic Language Learning Engine)  
> **負責人**：`@PM`  
> **決策共識 (Grill Me 結論)**：
> 1. **語音辨識核心 (方案 A)**：瀏覽器原生 `Web Speech API (webkitSpeechRecognition)` 搭配智慧雙軌容錯與字元級中英文自動判定，零雲端 AI API 依賴。
> 2. **半自動學習機制 (方案 A+B 混合)**：本地輕量貝氏分類 (Naive Bayes) + 使用者糾錯回饋學習 (Correction Feedback Loop)。使用者每次在預覽卡片確認/微調標籤、看板、優先級，系統即自動強化本地權重庫。
> 3. **中英文分流規則 (方案 A)**：自動判定中英雙語，自動掛載 `#繁中` / `#English` 標籤並執行在地化時間語意剖析（如「明天下午三點」vs "tomorrow 3pm"）。
> 4. **雙模共存 (方案 A)**：支援「純本地離線學習模式」與「Gemini 2.0 多模態推理」，無 API Key 時自動進入離線半自動學習模式。

---

## 🔄 核心資料流程架構 (Core Data Flow Specification)

```mermaid
flowchart TD
    Start([使用者點擊語音輸入]) --> ModeCheck{是否有自訂 API Key 且連線?}
    
    %% 離線/本地學習路徑
    ModeCheck -- 否 / 選擇離線學習模式 --> WebSpeech[Web Speech API 原生即時辨識]
    WebSpeech --> LangClassify[字元級中英語言分類器<br/>Chinese vs English]
    LangClassify --> LocalNLP[本地規則 & 貝氏語意剖析器<br/>NLP / Regex / Bayesian Classifier]
    LocalNLP --> LearnInference[載入本地學習模型 LocalStorage<br/>推論最佳 Board, Tags, Priority, DueDate]
    LearnInference --> PreviewCard[Grill-me Consensus 預覽卡片 5 態呈現]
    
    %% 使用者確認與半自動反饋學習
    PreviewCard -- 使用者微調/確認加入看板 --> FeedbackLoop[半自動學習回饋引擎 Feedback Loop]
    FeedbackLoop --> UpdateModel[更新本地貝氏機率與關鍵詞權重庫<br/>voicekanban_learning_model_v1]
    UpdateModel --> PushTask[推入看板 Task 建立完成 🎉]
    
    %% 雲端 AI 模式
    ModeCheck -- 是 (啟用雲端多模態) --> GeminiAPI[Gemini 2.0 Flash 語音多模態分析]
    GeminiAPI --> PreviewCard
```

---

## 🎯 核心驗收標準 (Acceptance Criteria)

### 1. 離線語音辨識與雙語即時分類 (AC-1)
- **[AC-1.1] 零 API 依賴辨識**：在無 Gemini API Key 或無網路狀態下，點擊錄音即啟動瀏覽器原生 Web Speech API，即時輸出語音辨識逐字稿。
- **[AC-1.2] 中英雙語自動判定**：
  - 中文字元比率 \(\ge 20\%\) 或含繁簡中文 Unicode 區段者分類為 `zh-TW`（中文）。
  - 否則且包含拉丁英文字母者分類為 `en-US`（英文）。
  - 自動於任務標籤掛載對應語系標籤（`#繁中` 或 `#English`）。
- **[AC-1.3] 瀏覽器相容與防呆**：若瀏覽器不支援 Web Speech API，優雅降級為手動輸入並給予友善提示，絕不崩潰。

---

### 2. 本地語意剖析與規則推論 (AC-2)
- **[AC-2.1] 中文時間與優先級萃取**：
  - 支援「今天」、「明天」、「後天」、「下週一/二/三/四/五」、「下午/早上 X 點」自動轉換為 ISO 到期時間。
  - 支援「緊急」、「重要」、「高優先」、「隨便」、「低優先」等關鍵字判定 `high` / `medium` / `low`。
- **[AC-2.2] 英文時間與優先級萃取**：
  - 支援 *today*, *tomorrow*, *next monday*, *at 3pm*, *urgent*, *asap*, *high priority*, *low priority* 等自動轉換。
- **[AC-2.3] 看板自動匹配**：依據口述內容比對現有看板名稱與欄位名稱（如口述「放進工作日常進行中」自動選定對應看板與欄位）。

---

### 3. 半自動學習引擎與回饋機制 (Active Feedback Learning) (AC-3)
- **[AC-3.1] 糾錯回饋學習 (Correction Reinforcement)**：
  - 當使用者在預覽確認介面修改了標題、目標看板、欄位、優先級或自訂標籤，點擊「確認加入」時，系統自動將口述特徵詞彙與使用者的最終修正寫入學習記憶庫。
- **[AC-3.2] 輕量樸素貝氏模型 (Naive Bayes Classifier)**：
  - 本地維護詞彙條件機率矩陣，隨使用次數增加，針對特定詞彙（例如「Bug」自動傾向「工作日常/進行中/高優先」）的預測準確度自動提升。
- **[AC-3.3] 學習模型持久化與透明管理**：
  - 學習權重儲存於 `localStorage`（鍵值 `voicekanban_learning_model_v1`）。
  - 設定面板中提供「已學習詞彙統計」與「重設學習模型」功能。

---

### 4. UI 5 種狀態規範 (AC-4)
- **[AC-4.1] Loading / Listening**：錄音中（波形動態反饋、即時字串滾動、語系辨識中 Badge）。
- **[AC-4.2] Empty**：未接收到聲音時提示「未偵測到清晰語音，請靠近麥克風重試」。
- **[AC-4.3] Error**：麥克風權限被拒絕或瀏覽器不支援時的指引介面。
- **[AC-4.4] Success**：加入成功發射 Confetti 粒子並提示「已記錄學習反饋 ✨」。
- **[AC-4.5] Active / Preview**：預覽卡片提供中英語系切換指示、逐字稿顯示、欄位可即時微調。
