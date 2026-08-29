# 🔐 Feature: 使用者認證與會話管理 (Auth Feature)

## 1. 模組概述 (Overview & Purpose)
本模組負責系統的身份驗證、會話管理、訪客匿名體驗（Guest Mode）以及帳號綁定升級（Account Binding）。確保使用者在未登入時可即時體驗本機儲存與完整看板功能，並隨時無縫綁定至 Firebase 雲端帳號以啟用跨裝置同步。

---

## 2. 核心功能規格 (Core Capabilities)
1. **訪客登入 (Guest / Anonymous Mode)**：一鍵以訪客身份進入系統，資料持久化儲存於 LocalStorage。
2. **多管道登入 (Multi-Provider Authentication)**：
   - Google OAuth 快速一鍵登入。
   - Email / 密碼註冊與登入。
3. **訪客帳號無縫綁定 (Seamless Account Binding)**：
   - 訪客模式下累積的任務與看板，在使用者決定註冊或綁定 Google / Email 時，自動遷移至雲端 Firestore，資料零遺失。
4. **會話持久化與狀態監聽 (Session Persistence)**：
   - 監聽 Firebase Auth 狀態，自動維護 `userSession`（含頭像、DisplayName、Email、Token、Provider 等資訊）。
5. **登出與資料防護 (Logout & Cleanup)**：
   - 登出時提供安全清除本地快取或切換帳號選項。

---

## 3. 元件架構 (Components Hierarchy)
```text
src/features/auth/
├── components/
│   ├── AuthLandingScreen.tsx   # 未認證時的形象引導與登入 Landing 頁
│   ├── AuthModal.tsx           # 快捷登入/註冊彈窗
│   └── BindAccountModal.tsx    # 訪客帳號升級與資料合併綁定彈窗
├── index.ts                    # 模組統一出口
└── feature.md                  # 功能規格與驗收標準文檔
```

---

## 4. UI 5 種狀態規範 (5 UI States)
- **Loading**：Firebase 登入/註冊請求中顯示 Spinner 與 Disable 按鈕，防止重複點擊。
- **Empty**：無使用者頭像時顯示預設使用者 Icon 與 Display Name 縮寫。
- **Error**：密碼錯誤、帳號已被註冊、網路中斷時顯示清晰的中文錯誤 Toast 與 Alert 提示。
- **Success**：登入/綁定成功時觸發歡迎通知並平滑過渡進入看板主畫面。
- **Active**：已認證狀態下 Navbar 顯示使用者頭像、同步狀態指示器與登出下拉選單。

---

## 5. 驗收標準 (Acceptance Criteria, AC)
- [x] **AC-AUTH-1**：訪客點擊「訪客試用」可立即進入主看板，LocalStorage 正常讀寫。
- [x] **AC-AUTH-2**：支援 Google 登入與 Email 密碼登入，登入成功後狀態持久化。
- [x] **AC-AUTH-3**：訪客於右上角點擊「綁定帳號」後，本地資料完整同步至雲端 Firestore。
- [x] **AC-AUTH-4**：登出後狀態切換正確，重新載入不發生狀態死鎖或白屏。
