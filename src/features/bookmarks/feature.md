# 🔖 Feature: 社群內容收藏 (Bookmarks / 收藏看板)

## 1. 模組概述 (Overview & Purpose)
讓使用者在手機上把 Instagram、YouTube、Threads（及任何網頁）的內容一鍵存進專屬的「收藏」看板。收藏看板依平台自動分欄，卡片顯示縮圖、平台徽章、作者與「開啟原文」按鈕；已看過的內容可直接勾選完成，沿用看板既有的「已完成 (N)」折疊。

---

## 2. 核心功能規格 (Core Capabilities)
1. **Android 系統分享選單 (Web Share Target)**：
   - `manifest.webmanifest` 宣告 `share_target`（`GET /` 參數 `share_title` / `share_text` / `share_url`），PWA 安裝後出現在 IG / YouTube / Threads 的「分享」選單中。
   - IG 與 Threads 把連結放在 `text` 而非 `url`，因此以 `extractFirstUrl()` 從三個欄位中擷取第一個 http(s) 連結。
   - `useShareIntake` 讀取參數後立即以 `history.replaceState` 清除，避免重新整理時重複開啟。
   - 未登入時分享內容暫存於 `sessionStorage`（`vk_pending_share`），登入後自動開啟儲存面板。
2. **iOS / 全平台剪貼簿貼上 (Paste Link)**：
   - iOS 的主畫面 Web App 無法成為分享目標，改以「分享 → 複製連結」後在收藏看板點擊「貼上連結」。
   - 讀取剪貼簿失敗或內容不含連結時，面板改為手動貼上輸入框。
3. **連結預覽 API (`GET /api/link/preview?url=`)**：
   - YouTube：oEmbed 取得標題與頻道，縮圖固定使用 `i.ytimg.com/vi/<id>/hqdefault.jpg`（長期有效）。
   - Instagram / Threads / 其他：以 Meta 預覽爬蟲 UA 讀取 Open Graph，解析貼文文字、作者與圖片。
   - 安全：僅允許 http(s)、拒絕 localhost 與私有 IP、每次轉址重新驗證、6 秒逾時、HTML 最多讀取 800KB；結果 CDN 快取 1 天。
4. **收藏看板 (`Board.kind = "collection"`)**：
   - 新帳號預設建立；既有使用者可從看板切換選單「🔖 建立「收藏」看板」建立，或第一次分享時自動建立。
   - 預設欄位：▶️ YouTube、📸 Instagram、🧵 Threads、🔗 其他連結，依平台自動分流；欄位被刪除時退回第一個欄位。
   - 以 `kind` 而非固定 id 辨識，刪除後重建會產生新 id，避免被雲端刪除墓碑 (tombstone) 過濾。
5. **儲存面板 (`ShareSaveSheet`)**：手機為底部抽屜、桌機為置中視窗；可編輯標題、加備註，偵測重複收藏並提示。
6. **卡片呈現**：`Task.link` 存在時卡片顯示縮圖封面（使用者自訂封面優先）、平台徽章、作者與開啟原文按鈕；詳細視窗顯示預覽卡。縮圖載入失敗時顯示平台漸層底圖。
7. **標題貼連結自動展開 (Link Title Auto-Expand)**：
   - 任何看板或收件匣新增卡片、或把既有卡片標題改成「只有一個網址」時，`enrichTaskFromLink` 自動抓取預覽：標題換成真正的標題，並寫入 `Task.link`（縮圖封面、平台徽章）。
   - 讀取期間卡片顯示「讀取連結內容…」；讀取失敗或離線時保留網址標題，仍寫入連結（上方預覽卡可開啟原文）。
   - 使用者在讀取期間自行修改標題時，不覆蓋其標題。
   - 登入帳號的雲端同步：同步結果以 `reconcileSyncedTasks` / `reconcileSyncedBoards` 套用，同步進行中本機新增或修改的卡片不會被較舊的結果蓋掉；同步期間新增的刪除墓碑也不會被提前清除。展開時若卡片被舊快照暫時移除，會等待卡片重新出現（最多 15 秒）再寫入，修正「剛完成一張卡後立刻貼網址不會展開」的問題。
8. **詳細內容格式 (`buildLinkDescription`)**：分享收藏與標題展開共用，依序為：
   1. 圖片 `![平台 · 作者](縮圖)`
   2. **標題**（僅在內容未重複標題時加入，IG / Threads 的標題即內文）
   3. 內容：YouTube 影片完整說明、IG 貼文文字、Threads 串文、網頁 og:description（上限 4000 字）
   4. 📝 使用者備註
   連結本身不放入說明：詳細視窗頂部的預覽卡（`EditTaskLinkSection`）已提供「開啟原文」。
   原本已有說明的卡片，連結區塊插在最前面並以分隔線隔開。
9. **縮圖轉存 R2 (`POST /api/link/thumbnail`)**：IG / Threads（`cdninstagram.com`、`fbcdn.net`）縮圖為數日即過期的簽章網址，儲存後自動複製到 R2 並替換卡片與詳細內容中的圖片網址；僅接受 Meta CDN 網域、5MB 上限、不跟隨轉址；R2 未設定時保留原網址。

---

## 3. 模組架構 (Module Architecture)
```text
src/features/bookmarks/
├── components/
│   ├── ShareSaveSheet.tsx          # 儲存到收藏面板 (底部抽屜 / 置中視窗)
│   ├── share-sheet/                # 面板子元件：預覽卡、手動貼上、成功狀態、useShareSaveSheet
│   ├── PasteLinkButton.tsx         # 收藏看板 Header「貼上連結」按鈕
│   ├── LinkThumbnail.tsx           # 縮圖 + 過期時平台漸層備援
│   ├── PlatformBadge.tsx           # 平台徽章
│   ├── TaskCardLinkParts.tsx       # 看板卡片縮圖封面與平台列
│   └── EditTaskLinkSection.tsx     # 任務詳細視窗連結預覽
├── hooks/useShareIntake.ts         # 讀取 Web Share Target 參數 / sessionStorage 暫存
├── services/
│   ├── linkPreviewService.ts       # 呼叫 /api/link/preview
│   └── pendingShareStorage.ts      # 未登入時暫存分享內容
├── utils/linkParser.ts             # 擷取連結、去除追蹤參數、判斷平台
├── constants.ts                    # 收藏看板欄位與平台設定
├── types/index.ts                  # LinkPreview、SharedLinkDraft
└── feature.md
```
相關：`src/app/api/link/preview/route.ts`、`src/core/types/task.ts`（`TaskLink`、`Board.kind`）、`useKanbanStore`（`pendingShare`、`saveLinkToCollection`、`openCollectionBoard`）。

---

## 4. UI 5 種狀態規範 (5 UI States)
- **Loading**：預覽讀取中顯示縮圖與文字骨架；儲存按鈕仍可點擊（僅存連結）。
- **Empty**：分享內容或剪貼簿沒有連結時，顯示手動貼上輸入框與複製連結教學。
- **Error**：預覽失敗（私人帳號、離線、網站阻擋）顯示提示，仍可儲存；手動輸入無效連結時顯示錯誤訊息；縮圖失效顯示平台漸層。
- **Success**：儲存後顯示「已加入收藏 › 欄位」與「查看收藏」按鈕。
- **Active**：重複收藏提示、可編輯標題與備註。

---

## 5. 驗收標準 (Acceptance Criteria, AC)
- [ ] **AC-BOOKMARK-1**：Android 安裝 PWA 後，於 IG / YouTube / Threads 點「分享」可看到「聲動看板」，選擇後開啟儲存面板並帶入正確連結。
- [ ] **AC-BOOKMARK-2**：iOS 複製連結後，在收藏看板點「貼上連結」可開啟儲存面板；剪貼簿無連結時顯示手動輸入框。
- [ ] **AC-BOOKMARK-3**：儲存後卡片出現在收藏看板對應平台欄位，顯示縮圖、平台徽章與作者，並同步至雲端。
- [ ] **AC-BOOKMARK-4**：預覽 API 拒絕非 http(s)、localhost 與私有 IP 連結；預覽失敗時仍可儲存。
- [ ] **AC-BOOKMARK-5**：未登入時收到分享，登入後儲存面板自動出現；關閉或儲存後不再重複出現。
- [ ] **AC-BOOKMARK-6**：同一連結重複收藏時顯示提示；追蹤參數（`igsh`、`si`、`utm_*` 等）不影響重複判斷。
- [ ] **AC-BOOKMARK-7**：卡片標題只輸入一個網址時，自動換成真正標題並顯示縮圖；詳細內容依序為圖片、標題、內容，連結由頂部預覽卡「開啟原文」提供、不重複放入說明。
- [ ] **AC-BOOKMARK-8**：IG / Threads 縮圖儲存後轉存至 R2，數日後卡片與詳細內容圖片仍可正常顯示。
