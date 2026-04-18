# 小紅帽資訊管理後台 (Admin Dashboard)

一個基於 Vue 3 + TypeScript + Vite 建構的現代化電商管理後台系統，提供完整的商品、訂單、用戶、促銷等管理功能。

## 功能特性

### 商品中心
- **產品列表** - 管理商品資訊、SKU、庫存
- **分類管理** - 多層級商品分類與屬性配置
- **品牌列表** - 品牌資料管理
- **屬性管理** - 商品屬性與規格管理

### 銷售中心
- **促銷管理** - 設定各種促銷活動與規則
- **優惠券管理** - 建立與發放優惠券
- **運費規則** - 配置運費計算邏輯

### 訂單中心
- **訂單管理** - 訂單查詢、狀態追蹤、物流管理
- **倉庫位置** - 庫存位置管理

### 其他功能
- **用戶管理** - 顧客資料查詢與管理
- **資源列表** - 圖片與媒體資源管理
- **富文本編輯器** - 整合 WangEditor 用於商品描述編輯

## 技術架構

### 前端技術棧
| 技術 | 版本 | 說明 |
|------|------|------|
| Vue 3 | ^3.5.30 | 漸進式 JavaScript 框架 |
| TypeScript | ~5.9.3 | 型別安全的 JavaScript 超集 |
| Vite | ^8.0.1 | 下一代前端建置工具 |
| Element Plus | ^2.13.6 | 基於 Vue 3 的組件庫 |
| Pinia | ^3.0.4 | Vue 官方推薦的狀態管理 |
| Vue Router | ^4.6.4 | Vue.js 的官方路由管理器 |
| Axios | ^1.14.0 | HTTP 客戶端 |
| Sass | ^1.98.0 | CSS 預處理器 |

### 圖標與組件
- **Remix Icon** - 現代化圖標庫 (`ri-*`)
- **Element Plus Icons** - Element Plus 官方圖標
- **Vue Draggable** - 拖曳排序功能
- **Vue3 Emoji Picker** - 表情符號選擇器

## 專案結構

```
admin/
├── build.sh              # 本地建置打包腳本
├── Makefile              # 伺服器部署指令集
├── deploy.sh             # 伺服器部署腳本
├── undeploy.sh           # 解除部署腳本
├── vite.config.ts        # Vite 配置
├── package.json          # 專案依賴
├── src/
│   ├── components/       # 可復用組件
│   │   └── ShipmentForm.vue    # 物流信息表單
│   ├── composables/    # 組合式函數
│   │   └── usePagination.ts    # 分頁邏輯
│   ├── model/          # 型別定義與介面
│   │   ├── Order.ts
│   │   ├── OrderItem.ts
│   │   ├── Payment.ts
│   │   ├── Shipment.ts
│   │   └── ...
│   ├── router/         # 路由配置
│   ├── services/       # API 服務層
│   │   ├── Order.ts
│   │   ├── Payment.ts
│   │   ├── Shipment.ts
│   │   └── ...
│   ├── stores/         # Pinia 狀態管理
│   └── views/          # 頁面組件
│       ├── HomePage.vue
│       ├── OrdersPage.vue
│       ├── ProductsPage.vue
│       └── ...
└── public/             # 靜態資源
```

## 開發環境設置

### 必要條件
- Node.js 18+ 
- npm 9+

### 安裝步驟

```bash
# 1. 複製專案
git clone <repository-url>
cd admin

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev
```

開發伺服器預設運行於 `http://localhost:5173`

### 建置生產版本

```bash
npm run build
```

建置結果輸出至 `dist/` 目錄。

## 部署方法

本專案採用 **GitHub Actions 自動建置 → 推送到 GHCR → 伺服器拉取運行** 的流程。

### 快速部署流程

#### 1. 發布新版本

在 GitHub 建立 tag 即會自動觸發 workflow：
```bash
# 本地建立 tag 並推送
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions 會自動：
- 建置 Docker image
- 推送到 GHCR (`ghcr.io/supojen/mall-admin:v1.0.0`)
- 標記為 `latest`

#### 2. 伺服器部署

Image 已推送到 GitHub Container Registry，可在伺服器上拉取運行：

```bash
# 拉取並運行
docker pull ghcr.io/supojen/mall-admin:latest
docker run -d -p 8080:80 --name mall-admin ghcr.io/supojen/mall-admin:latest
```

或在 `docker-compose.yml` 中使用：
```yaml
services:
  mall-admin:
    image: ghcr.io/supojen/mall-admin:latest
    container_name: mall-admin
    restart: unless-stopped
    ports:
      - "8080:80"
```

### 本地手動建置（可選）

如需本地建置測試：
```bash
# 建置 Docker image
docker build -t mall-admin:local .

# 本地運行測試
docker run -d -p 8080:80 --name mall-admin mall-admin:local
```

### 部署檔案說明

| 檔案 | 用途 |
|------|------|
| `Dockerfile` | Docker image 建置定義 |
| `.github/workflows/docker-build.yml` | GitHub Actions 自動建置 workflow |

## API 介接

本專案使用 RESTful API 與後端通訊，基礎配置：

- **API 基礎路徑**: `/api/`
- **認證方式**: JWT Token (存儲於 Cookie)
- **請求工具**: Axios (封裝於 `src/services/Request.ts`)

### 主要 API 模組

- `Order.ts` - 訂單相關 API
- `Payment.ts` - 付款記錄 API
- `Shipment.ts` - 物流信息 API
- `Product.ts` - 商品管理 API
- `User.ts` - 用戶管理 API

## 開發規範

### 程式碼風格
- 使用 Vue 3 Composition API (`<script setup>`)
- TypeScript 嚴格型別檢查
- 組件命名使用 PascalCase
- 檔案命名遵循語義化原則

### 狀態管理
- 全域狀態使用 Pinia (`src/stores/`)
- 頁面級狀態使用組合式函數 (`src/composables/`)

### API 請求
- 所有 API 請求統一封裝於 `src/services/`
- 使用統一的錯誤處理與請求攔截

## 貢獻指南

1. Fork 本專案
2. 建立特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權條款

本專案採用 GNU General Public License v3.0 授權。

```
Copyright (C) 2024 小紅帽資訊

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

---

**小紅帽資訊管理後台** - Powered by Vue 3 + TypeScript + Vite
