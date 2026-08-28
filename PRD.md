# VoiceKanban 雲端資料庫串接與多端 OAuth/Email 跨裝置同步規格書 (PRD.md v3.0.0)

> **版本**：v3.0.0 (Cloud Database & Multi-Auth Cross-Device Sync)  
> **負責人**：`@PM`  
> **決策共識 (Grill Me 結論)**：
> 1. **資料庫與認證技術選型 (Q1-A)**：Firebase Ecosystem (Firebase Auth + Cloud Firestore)。支援即時監聽、離線快取與跨裝置毫秒級雙向同步。
> 2. **認證模式 (Q2-A)**：支援 **Google OAuth**、**Email/Password 註冊登入**，並保留 **訪客模式 (Guest Mode)** 免登入即用體驗。
> 3. **資料合併策略 (Q3-A)**：**自動無縫遷移合併 (Auto-Merge & Claim)**。當訪客在本地建立卡片後登入，系統自動將本地看板與卡片合併上傳至該帳號的雲端 Firestore，確保資料不丟失。
> 4. **雙軌架構容錯 (Q4-A)**：**雙軌自適應架構 (Dual-Engine Mode)**。在未設定 Firebase 金鑰或離線時自動啟用 Safe Local Fallback，填入金鑰後無縫切換真實雲端與 OAuth。

---

## 🎯 核心規格與驗收標準 (AC)

### 1. 認證系統與多登入渠道 (AC-1)
- **[AC-1.1] Google OAuth 登入**：支援 Google 帳號一鍵登入 (`signInWithPopup`)，取得使用者名稱、Email、頭像 (`avatarUrl`) 與唯一 UID。
- **[AC-1.2] Email 密碼 / 註冊與登入**：
  - 支援 Email + 密碼註冊 (`createUserWithEmailAndPassword`) 與登入 (`signInWithEmailAndPassword`)。
  - 當帳號不存在時引導註冊，密碼防呆驗證（至少 6 字元、格式防呆、錯誤訊息友善中文化）。
- **[AC-1.3] 訪客模式 (Guest Mode)**：支援免註冊立即體驗，本地資料安全存取。
- **[AC-1.4] 帳號狀態持久化與監聽**：透過 `onAuthStateChanged` 即時監聽登入狀態改變，刷新頁面自動維持 Session。
- **[AC-1.5] 登出機制**：登出後重設會話，清理快取狀態並恢復安全訪客環境。

---

### 2. 雲端 Firestore 資料庫與跨裝置即時同步 (AC-2)
- **[AC-2.1] 用戶專屬資料隔離 (User-Scoped Firestore Path)**：
  - 路徑架構：`users/{userId}/boards` 及 `users/{userId}/tasks`，確保跨用戶資料完全隔離。
- **[AC-2.2] 跨裝置即時雙向監聽 (Real-time Snapshot Listener)**：
  - 登入用戶在裝置 A 新增/修改/刪除/拖曳卡片時，裝置 B 透過 Firestore `onSnapshot` 即時同步更新畫布，無需手動重新整理。
- **[AC-2.3] 離線快取與網路恢復 (Offline Persistence)**：
  - 支援離線操作（Offline），斷網時寫入本地快取，連網後自動背景同步至雲端 Firestore。
- **[AC-2.4] 同步狀態即時指示 (Sync Indicator)**：
  - Navbar 清楚指示 4 種同步狀態：`synced`（已同步）、`syncing`（同步中）、`offline`（離線中）、`error`（同步異常）。

---

### 3. 訪客資料無縫合併遷移 (AC-3)
- **[AC-3.1] Auto-Merge 策略**：當使用者由訪客切換登入至 Google / Email 帳號時，系統自動掃描本地新增之看板與任務，合併寫入雲端 Firestore。
- **[AC-3.2] 衝突解決**：以用戶最新操作為準（`updatedAt` 比較），雲端既有任務與本地任務進行 union 整併，避免覆蓋既有跨裝置資料。

---

### 4. 雙軌架構容錯與配置導引 (AC-4)
- **[AC-4.1] Dual-Engine 模式**：未設定 `NEXT_PUBLIC_FIREBASE_*` 環境變數時，自動降級為 Safe Mock Engine，並在 UI 上給予配置提示，絕不報錯崩潰。
- **[AC-4.2] 設定指引與 .env.example**：提供清楚完整的環境變數範本與設置說明。

---

### 5. UI 元件與 5 種狀態規範 (AC-5)
- **[AC-5.1] Loading 載入狀態**：登入驗證中、資料庫初次拉取時呈現骨架屏或 Spinner 動畫。
- **[AC-5.2] Empty 空狀態**：新註冊用戶無卡片時呈現親和的空看板導引。
- **[AC-5.3] Error 錯誤狀態**：密碼錯誤、網路中斷或 OAuth 彈窗關閉等提供精確提示。
- **[AC-5.4] Success 成功狀態**：登入成功 Toast、同步成功綠色徽章。
- **[AC-5.5] Active 互動狀態**：支援 Tab 切換「登入 / 註冊」、Google/Email 一鍵觸發。
