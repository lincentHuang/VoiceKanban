# 👥 Feature: 多人即時協同編輯與邀請機制 (Collaboration Feature)

## 1. 模組概述 (Overview & Purpose)
本模組負責智慧任務看板的多人即時協同編輯（Real-Time Multiplayer Collaboration）、看板共享邀請機制（6 碼短代碼與專屬邀請連結）、訪客免登入極速加入、三級權限控制（Owner / Editor / Viewer）以及跨裝置即時狀態同步與協作者頭像呈現。

---

## 2. 核心功能規格 (Core Capabilities)
1. **看板專屬 6 碼邀請代碼與分享連結 (Invite Code & Share Link)**：
   - 建立者（Owner）點擊「邀請協作」按鈕，系統為看板生成專屬 6 碼代碼（如 `VK-8X4B`）與邀請連結。
   - 一鍵複製邀請代碼或完整 URL，使用者可快速傳送給團隊夥伴。
2. **極速加入看板 (Join Board Flow)**：
   - 支援在看板選單點擊「輸入代碼加入看板」開啟 `JoinBoardModal`。
   - 支援 URL 查詢參數 `?invite=CODE`，打開網頁時自動彈出加入確認窗並預填邀請碼。
3. **訪客免登入極速協同 (Guest Collaboration with Nickname)**：
   - 未登入之訪客點擊加入時，僅需輸入「協作者暱稱」，系統即自動分配匿名協作者 ID 與可愛頭像秒級加入，登入時自動關聯歷史協作紀錄。
4. **三級角色權限模型 (Three-Tier Role & Permission Control)**：
   - **擁有者 (Owner)**：擁有看板最高權限，可管理成員、切換他人角色（Editor ↔ Viewer）、移出成員及更名/刪除看板。
   - **編輯者 (Editor，受邀預設)**：可新增、修改、刪除、拖曳任務卡片，以及維護狀態欄位。
   - **檢視者 (Viewer / 唯讀)**：僅能檢視看板與卡片內容，系統自動禁用新增、編輯與拖曳操作，並於頂部常態標示「👁️ 唯讀模式」。
5. **雙軌即時同步引擎 (Dual-Engine Real-Time Sync)**：
   - 在線環境透過 Firebase Firestore `shared_boards` 集合與 `onSnapshot` 監聽達成秒級雙向同步。
   - 瀏覽器跨分頁環境透過 `BroadcastChannel` 實現 0 延遲即時同步，單機多分頁測試立即可見。
6. **協作者頭像堆疊與在線反饋 (Collaborator Avatars & Active State)**：
   - 看板頂部直觀展示協作者頭像堆疊，標註角色徽章（👑 Owner, ✏️ Editor, 👁️ Viewer）。
   - 點擊頭像或「+ 邀請」按鈕可直達管理彈窗。

---

## 3. 元件與架構 (Components & Architecture)
```text
src/features/collaboration/
├── components/
│   ├── ShareBoardModal.tsx       # 邀請成員、複製連結與成員權限管理彈窗 (UI 5 態)
│   ├── JoinBoardModal.tsx        # 輸入 6 碼代碼/暱稱加入協作看板彈窗 (UI 5 態)
│   ├── CollaboratorAvatars.tsx   # 看板頂部協作者頭像堆疊與快速邀請入口
│   └── ReadOnlyBanner.tsx        # 檢視者模式提示條
├── services/
│   └── collaborationService.ts   # 邀請碼管理、成員異動、Firestore 與 BroadcastChannel 雙軌同步
├── types/
│   └── index.ts                  # 協作專屬型別定義
├── index.ts                      # 模組統一對外導出入口
└── feature.md                    # 該 Feature 功能規格與驗收標準
```

---

## 4. UI 5 種狀態規範 (5 UI States)
- **Loading**：
  - 生成邀請代碼、加入看板或變更成員權限時，顯示微光 Spinner 與停用操作按鈕防重複提交。
- **Empty**：
  - 看板尚未有其他協作者時，呈現「尚無其他成員，分享上方連結邀請好友！」引導卡片。
- **Error**：
  - 邀請代碼不存在、過期、網路失敗或已被移出時，呈現鮮明紅色 Alert 提示與重試按鈕。
- **Success**：
  - 複製邀請碼或連結成功時觸發 Toast 提示；成功加入看板後播放微動畫並自動切換至該看板。
- **Active / Interactive**：
  - 角色切換下拉選單展開、成員卡片懸停高亮、頭像 Tooltip 顯示名稱與權限徽章。

---

## 5. 驗收標準 (Acceptance Criteria, AC)
- [x] **AC-COL-1 (邀請代碼與連結生成)**：點擊邀請按鈕能自動生成唯一的 6 碼短代碼與完整加入網址，並具備一鍵複製功能。
- [x] **AC-COL-2 (代碼與連結加入流程)**：輸入正確代碼可成功加入看板；URL 帶有 `?invite=...` 時自動開啟加入彈窗並預填代碼。
- [x] **AC-COL-3 (訪客暱稱極速協同)**：未登入訪客填入暱稱即可秒級加入看板並正常協同編輯。
- [x] **AC-COL-4 (角色權限約束與唯讀限制)**：Owner 可修改他人角色或移出成員；Viewer 身分無法拖曳卡片或新增任務，並顯示唯讀提示條。
- [x] **AC-COL-5 (雙軌即時同步與頭像堆疊)**：看板頂部正確展示成員頭像與角色，多人/多分頁變更卡片或欄位時秒級即時同步。
