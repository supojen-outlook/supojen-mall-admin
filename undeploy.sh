#!/bin/bash

# undeploy.sh - Vue 專案解除部署腳本

# ===== 設定顏色輸出 =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===== 設定參數 =====
DOMAIN="supojen.com"                                         # 你的網域（預設值）
VUE_PROJECT_DIR="$(pwd)"                                     # Vue 專案目錄（目前位置）
NGINX_PROXY_DIR="$(dirname "$VUE_PROJECT_DIR")/nginx-proxy"  # nginx-proxy 目錄
BACKUP_DIR="backup_vue_$(date +%Y%m%d_%H%M%S)"               # 備份目錄名稱
# =========================================

# 顯示標題
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Vue 專案解除部署工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}警告：這將移除網頁檔案與 Nginx 設定${NC}"
echo -e "${YELLOW}網域:${NC} $DOMAIN"
echo -e "${YELLOW}Nginx Proxy 目錄:${NC} $NGINX_PROXY_DIR"
echo -e "${BLUE}========================================${NC}\n"

# ===== 確認 domain name =====
confirm_domain() {
    echo -e "${YELLOW}[確認] 請確認要移除的網域...${NC}"
    while true; do
        echo -e "目前的目標網域為: ${GREEN}$DOMAIN${NC}"
        read -p "是否正確？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then break;
        elif [[ $REPLY =~ ^[Nn]$ ]]; then
            read -p "請輸入正確的網域: " NEW_DOMAIN
            [ -n "$NEW_DOMAIN" ] && DOMAIN="$NEW_DOMAIN" || echo -e "${RED}❌ 不能為空${NC}"
        fi
    done
}

# ===== 最終確認 =====
final_confirmation() {
    echo -e "${RED}⚠️  危險操作警告 ⚠️${NC}"
    echo -e "操作項目："
    echo -e "  1. 移除 Nginx 設定檔 ($DOMAIN.conf)"
    echo -e "  2. 移除靜態網頁檔案 ($NGINX_PROXY_DIR/www/$DOMAIN)"
    echo -e "  3. 自動備份現有內容至 $BACKUP_DIR"
    echo ""
    read -p "確定要繼續嗎？(y/N) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && echo -e "${YELLOW}操作取消${NC}" && exit 0
}

# 備份現有部署
backup_files() {
    echo -e "${YELLOW}[1/4] 正在備份現有部署...${NC}"
    mkdir -p "$BACKUP_DIR"
    
    # 備份 Nginx 設定
    if [ -f "$NGINX_PROXY_DIR/nginx/conf.d/$DOMAIN.conf" ]; then
        cp "$NGINX_PROXY_DIR/nginx/conf.d/$DOMAIN.conf" "$BACKUP_DIR/"
        echo -e "  ✅ 已備份 Nginx 設定"
    fi
    
    # 備份網頁檔案
    if [ -d "$NGINX_PROXY_DIR/www/$DOMAIN" ]; then
        cp -r "$NGINX_PROXY_DIR/www/$DOMAIN" "$BACKUP_DIR/www_content"
        echo -e "  ✅ 已備份網頁內容"
    fi
    echo -e "${GREEN}✅ 備份完成於: $BACKUP_DIR/${NC}\n"
}

# 移除 Nginx 設定
remove_nginx_config() {
    echo -e "${YELLOW}[2/4] 移除 Nginx 設定檔...${NC}"
    CONFIG_FILE="$NGINX_PROXY_DIR/nginx/conf.d/$DOMAIN.conf"
    
    if [ -f "$CONFIG_FILE" ]; then
        rm -f "$CONFIG_FILE"
        echo -e "${GREEN}✅ 已移除 $CONFIG_FILE${NC}"
    else
        echo -e "${YELLOW}⚠️  找不到設定檔，略過${NC}"
    fi
}

# 移除網頁檔案
remove_www_files() {
    echo -e "${YELLOW}[3/4] 移除網頁檔案...${NC}"
    TARGET_DIR="$NGINX_PROXY_DIR/www/$DOMAIN"
    
    if [ -d "$TARGET_DIR" ]; then
        rm -rf "$TARGET_DIR"
        echo -e "${GREEN}✅ 已移除目錄 $TARGET_DIR${NC}"
    else
        echo -e "${YELLOW}⚠️  找不到網頁目錄，略過${NC}"
    fi
}

# 重新載入 Nginx
reload_nginx() {
    echo -e "${YELLOW}[4/4] 重新載入 Nginx 以套用變更...${NC}"
    
    if docker ps | grep -q nginx-proxy; then
        if docker exec nginx-proxy nginx -t > /dev/null 2>&1; then
            docker exec nginx-proxy nginx -s reload
            echo -e "${GREEN}✅ Nginx 已重新載入${NC}"
        else
            echo -e "${RED}❌ Nginx 設定測試失敗，請檢查其餘設定檔！${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Nginx 容器未運行，無需重新載入${NC}"
    fi
}

# 顯示摘要
show_summary() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${GREEN}✅ Vue 專案解除部署完成！${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${YELLOW}注意：${NC}SSL 憑證已保留在 nginx-proxy/certbot 目錄中。"
    echo -e "若要完全刪除憑證，請手動執行："
    echo -e "  rm -rf $NGINX_PROXY_DIR/certbot/letsencrypt/live/$DOMAIN/"
    echo -e "${BLUE}========================================${NC}"
}

# ===== 主程式 =====
main() {
    confirm_domain
    final_confirmation
    backup_files
    remove_nginx_config
    remove_www_files
    reload_nginx
    show_summary
}

main