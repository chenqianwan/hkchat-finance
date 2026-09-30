# HKChat Finance

香港生活金融教育的獨立手機示範站。沿用 HKChat Legal 的品牌、深淺色介面及操作方式，法律站保持獨立。

## 四個體驗

- **財智快打**：三個話題、每局五關、条件变化题及演示 PK。
- **金融大找茬**：三張 AI 生成的銀行／保障／群組場景，每幕三個可點選的細節。
- **金融細字挑戰**：三個基本情境、三個額外模板、五條細字、追問與結果解說。
- **金融防騙局**：三個領域、六個虛構故事、最多五輪、角色專屬問題與自由輸入。

所有體驗均為虛構金融教育材料，沒有金額、付款、模擬資產、收益計算、產品推薦或真實交易功能。引用 HKMA、IFEC 或其他官方教育資料不代表機構認可本示範。

這是靜態示範：AI 圖片已預先生成；情境配對、題目變化與角色回應使用預設內容。PK 使用程式模擬對手，沒有多人連線或即時模型後端。刷新會清除本金融站的進度；一般頁面跳轉可保留進度。

## 預覽與重建

`site/` 是可直接部署的靜態站。各 HTML 已內嵌圖片和執行程式，沒有執行時 CDN 或 API 依賴。

```sh
python3 -m http.server 8765 --directory site
```

重建需要 Python 3 和 Pillow：

```sh
python3 -m pip install Pillow
python3 build.py
```

可編輯來源位於 `work/finance/`；共用與找茬圖片位於 `outputs/`。生成圖片的提示詞保存在 `work/finance/image-prompts.json` 和 `image-hero-prompt.json`。HKChat 標誌沿用原站官方素材，沒有重新繪製。

## 發布

GitHub Actions 從 `main` 分支的 `site/` 發布至 GitHub Pages。本站獨立於 `chenqianwan/hkchat-legal`。

驗證包含四種玩法的全流程、手機 320／390／430 寬度、深淺色、Chromium／WebKit、首頁玩法彈窗、導航、圖片熱點及刷新儲存範圍。WebKit 為瀏覽器引擎測試，並非實體 iPhone 測試。
