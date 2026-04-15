#!/bin/bash

# build.sh - 前端專案本地建置與打包腳本
set -e

# ===== 設定顏色輸出 =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 設定打包名稱
PACKAGE_NAME="frontend-deploy.tar.gz"
TEMP_DIR="./deploy_temp"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Vue 前端專案建置工具${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 清理舊的建置與暫存
echo -e "${YELLOW}[1/5] 清理舊檔案...${NC}"
rm -rf dist
rm -rf $TEMP_DIR
rm -f $PACKAGE_NAME

# 2. 執行前端建置
echo -e "${YELLOW}[2/5] 正在安裝套件並執行建置 (npm run build)...${NC}"
# 如果伺服器端不跑 build，建議在本地完成
npm install
npm run build

# 檢查 dist 是否成功產生
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ 建置失敗，找不到 dist 目錄${NC}"
    exit 1
fi

# 3. 準備打包目錄
echo -e "${YELLOW}[3/5] 收集部署必要檔案...${NC}"
mkdir -p $TEMP_DIR

# 複製建置成果
cp -r dist $TEMP_DIR/

# 複製部署腳本
FILES_TO_COPY=("deploy.sh" "undeploy.sh" "Makefile")

for FILE in "${FILES_TO_COPY[@]}"; do
    if [ -f "$FILE" ]; then
        cp "$FILE" $TEMP_DIR/
        echo -e "  ✅ 已複製 $FILE"
    else
        echo -e "${RED}  ⚠️  警告：找不到 $FILE${NC}"
    fi
done

# 4. 建立部署說明文件
echo -e "${YELLOW}[4/5] 產生 README...${NC}"
cat > $TEMP_DIR/README.md << EOF
# Vue 專案部署包

## 快速部署步驟
1. 上傳 $PACKAGE_NAME 到伺服器目錄
2. 解壓縮：tar -xzf $PACKAGE_NAME
3. 部署：./deploy.sh (或使用 make deploy)

## 檔案結構
- dist/        : Vue 建置後的靜態檔案
- deploy.sh    : 自動設定 Nginx 與 SSL
- undeploy.sh  : 移除部署並備份
- Makefile     : 快捷指令集
EOF

# 5. 執行壓縮打包
echo -e "${YELLOW}[5/5] 正在打包壓縮檔...${NC}"
tar -czf $PACKAGE_NAME -C $TEMP_DIR .

# 清理暫存
rm -rf $TEMP_DIR

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 打包完成！產出檔案：${YELLOW}$PACKAGE_NAME${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "後續步驟："
echo -e "1. 上傳檔案：${CYAN}scp $PACKAGE_NAME user@server:/path/to/web/${NC}"
echo -e "2. 遠端部署：${CYAN}tar -xzf $PACKAGE_NAME && ./deploy.sh${NC}"