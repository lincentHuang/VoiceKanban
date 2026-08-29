# ⚙️ Feature: 使用者設定與 BYOK API 金鑰加密 (Settings & BYOK Security)

## 1. 模組概述 (Overview & Purpose)
本模組負責系統偏好設定、AI 模型切換、主題配置（深色/淺色/跟隨系統）以及自帶金鑰（Bring Your Own Key, BYOK）安全加密管理。使用者可在此配置自己的 Google Gemini API Key，系統採用客戶端 AES 加密，絕不以明文外流，保障隱私安全。

---

## 2. 核心功能規格 (Core Capabilities)
1. **BYOK 自帶 Gemini API Key 管理**：
   - 支援填入自訂 Google Gemini API Key。
   - 支援 API Key 有效性連線驗證（Test Connection）。
   - 提供金鑰抹除（Clear Key）與本機加密儲存保護。
2. **AI 模型與推論參數選擇 (Model Selection)**：
   - 支援切換 Gemini 2.5 Flash（極速推薦）、Gemini 2.5 Pro（深度解析）等模型。
   - 支援切換語音辨識預設語言（繁體中文、英文、日文、自動）。
3. **外觀與主題偏好 (Appearance & Theme)**：
   - 支援 Light / Dark / System 自動切換，採用現代流光毛玻璃風格。
4. **帳號管理與雲端備份狀態 (Account Status & Data Sync)**：
   - 顯示當前登入者資訊、已同步任務數量、手動強制雲端同步按鈕。

---

## 3. 元件架構 (Components Hierarchy)
```text
src/features/settings/
├── components/
│   └── SettingsModal.tsx      # 設定中心對話框 (包含 AI、帳號、外觀、資料分頁)
├── index.ts                   # 模組統一出口
└── feature.md                 # 功能規格與驗收標準文檔
```

---

## 4. UI 5 種狀態規範 (5 UI States)
- **Normal**：展示當前設定值與分頁標籤。
- **Testing (Loading)**：點擊「測試金鑰連線」時呈現 Spinner 與狀態檢驗中。
- **Valid (Success)**：金鑰驗證成功顯示綠色 Check 徽章「連線正常，模型可用」。
- **Invalid (Error)**：金鑰無效或配額超限時顯示紅色警告與 Google AI Studio 申請指引。
- **Empty**：未輸入金鑰時提示使用預設共用配額或本機 NLP 解析引擎。

---

## 5. 驗收標準 (Acceptance Criteria, AC)
- [x] **AC-SET-1**：使用者輸入 API Key 點擊儲存後，金鑰被加密保存於本地。
- [x] **AC-SET-2**：提供金鑰有效性測試按鈕，即時反饋連線狀態。
- [x] **AC-SET-3**：主題切換與語言偏好設定即時生效。
