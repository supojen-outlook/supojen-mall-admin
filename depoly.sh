#!/bin/bash

# deploy.sh - Vue 專案部署到 nginx-proxy (Docker 版本)

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
# =========================================

# 顯示標題
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Vue 專案部署工具 (Docker 版本)${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}預設網域:${NC} $DOMAIN"
echo -e "${YELLOW}Vue 專案:${NC} $VUE_PROJECT_DIR"
echo -e "${YELLOW}Nginx Proxy:${NC} $NGINX_PROXY_DIR"
echo -e "${BLUE}========================================${NC}\n"

# ===== 確認 domain name =====
confirm_domain() {
    echo -e "${YELLOW}[確認] 請確認網域設定...${NC}"
    
    while true; do
        echo -e "目前的網域為: ${GREEN}$DOMAIN${NC}"
        read -p "這個網域是否正確？(y/n) " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}✅ 網域確認: $DOMAIN${NC}\n"
            break
        elif [[ $REPLY =~ ^[Nn]$ ]]; then
            read -p "請輸入正確的網域: " NEW_DOMAIN
            if [ -n "$NEW_DOMAIN" ]; then
                DOMAIN="$NEW_DOMAIN"
                echo -e "${GREEN}✅ 網域已更新為: $DOMAIN${NC}\n"
                break
            else
                echo -e "${RED}❌ 網域不能為空，請重新輸入${NC}"
            fi
        else
            echo -e "${RED}❌ 請輸入 y 或 n${NC}"
        fi
    done
}

# 檢查必要目錄
check_directories() {
    echo -e "${YELLOW}[1/5] 檢查目錄結構...${NC}"
    
    if [ ! -d "$VUE_PROJECT_DIR" ]; then
        echo -e "${RED}❌ Vue 專案目錄不存在: $VUE_PROJECT_DIR${NC}"
        exit 1
    fi
    
    if [ ! -d "$VUE_PROJECT_DIR/dist" ]; then
        echo -e "${RED}❌ dist 目錄不存在！${NC}"
        echo -e "請先在本機執行 npm run build，然後用 rsync 上傳 dist 目錄"
        echo -e "指令: rsync -avz ./dist/ ubuntu@backup:~/pig/dist/"
        exit 1
    fi
    
    if [ ! -d "$NGINX_PROXY_DIR" ]; then
        echo -e "${RED}❌ nginx-proxy 目錄不存在: $NGINX_PROXY_DIR${NC}"
        exit 1
    fi
    
    # 檢查 Makefile 是否存在
    if [ ! -f "$NGINX_PROXY_DIR/Makefile" ]; then
        echo -e "${RED}❌ nginx-proxy/Makefile 不存在${NC}"
        exit 1
    fi
    
    # 檢查 Docker 容器是否在運行
    if ! docker ps | grep -q nginx-proxy; then
        echo -e "${YELLOW}⚠️  Nginx 容器未運行，嘗試啟動...${NC}"
        cd "$NGINX_PROXY_DIR" && docker compose up -d
        sleep 3
    fi
    
    echo -e "${GREEN}✅ 目錄檢查通過${NC}"
    echo -e "  Vue 專案: $VUE_PROJECT_DIR"
    echo -e "  Nginx Proxy: $NGINX_PROXY_DIR"
    echo -e "  目標目錄: $NGINX_PROXY_DIR/www/$DOMAIN\n"
}

# 檢查 dist 目錄
check_dist() {
    echo -e "${YELLOW}[2/5] 檢查 dist 目錄...${NC}"
    
    cd "$VUE_PROJECT_DIR"
    
    if [ ! -d "dist" ]; then
        echo -e "${RED}❌ dist 目錄不存在！${NC}"
        exit 1
    fi
    
    FILE_COUNT=$(find dist -type f 2>/dev/null | wc -l)
    if [ "$FILE_COUNT" -eq 0 ]; then
        echo -e "${RED}❌ dist 目錄是空的${NC}"
        exit 1
    fi
    
    BUILD_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}✅ dist 目錄檢查通過${NC}"
    echo -e "  檔案大小: $BUILD_SIZE"
    echo -e "  檔案數量: $FILE_COUNT 個檔案\n"
}

# 複製檔案到 nginx-proxy/www
copy_files() {
    echo -e "${YELLOW}[3/5] 複製檔案到 nginx-proxy/www/${DOMAIN}...${NC}"
    
    TARGET_DIR="$NGINX_PROXY_DIR/www/$DOMAIN"
    
    # 確保 www 目錄存在
    mkdir -p "$NGINX_PROXY_DIR/www"
    
    # 清除舊檔案
    if [ -d "$TARGET_DIR" ]; then
        echo -e "清除舊檔案..."
        rm -rf "$TARGET_DIR"
    fi
    
    # 建立目標目錄並複製新檔案
    mkdir -p "$TARGET_DIR"
    echo -e "複製檔案中..."
    cp -r "$VUE_PROJECT_DIR/dist/"* "$TARGET_DIR/" 2>/dev/null
    
    # 設定權限（讓容器可以讀取）
    chmod -R 755 "$TARGET_DIR"
    
    echo -e "${GREEN}✅ 檔案複製完成${NC}"
    echo -e "檔案位置: $TARGET_DIR"
    echo -e "檔案數量: $(find "$TARGET_DIR" -type f | wc -l) 個檔案\n"
}

# 建立 Nginx 虛擬主機設定
create_nginx_config() {
    echo -e "${YELLOW}[4/5] 建立 Nginx 虛擬主機設定...${NC}"
    
    CONFIG_FILE="$NGINX_PROXY_DIR/nginx/conf.d/$DOMAIN.conf"
    
    # 備份舊設定
    if [ -f "$CONFIG_FILE" ]; then
        echo -e "${YELLOW}⚠️  設定檔已存在，將備份為 $DOMAIN.conf.backup${NC}"
        cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
    fi
    
    # 產生設定檔（Docker 容器內的路徑）
    cat > "$CONFIG_FILE" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    
    # Let's Encrypt 驗證路徑（給 certbot 用）
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
        try_files \$uri =404;
    }
    
    # 其他 HTTP 請求重定向到 HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name $DOMAIN;

    # SSL 證書配置（容器內的路徑）
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # 引入 SSL 參數（從 ssl-params.conf）
    include /etc/nginx/conf.d/ssl-params.conf;

    # 靜態檔案目錄（容器內的路徑，對應到宿主機的 ./www/$DOMAIN）
    root /var/www/$DOMAIN;
    index index.html;

    # 日誌（容器內的路徑）
    access_log /var/log/nginx/$DOMAIN.access.log main;
    error_log /var/log/nginx/$DOMAIN.error.log warn;

    # Vue Router History 模式支援
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 靜態檔案快取
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
EOF
    
    echo -e "${GREEN}✅ 虛擬主機設定完成${NC}"
    echo -e "設定檔位置: $CONFIG_FILE\n"
}

# ===== 檢查 SSL 憑證（使用 Makefile 的 cert-check 和 add-domain）=====
check_ssl_certificate() {
    echo -e "${YELLOW}[5/5] 檢查 SSL 憑證...${NC}"
    
    cd "$NGINX_PROXY_DIR"
    
    # 使用 Makefile 的 cert-check 指令檢查證書
    if make cert-check DOMAIN="$DOMAIN" > /dev/null 2>&1; then
        # 證書存在，顯示詳細資訊
        echo -e "${GREEN}✅ SSL 憑證已存在${NC}"
        
        # 取得證書到期日
        CERT_FILE="certbot/letsencrypt/live/$DOMAIN/fullchain.pem"
        if [ -f "$CERT_FILE" ]; then
            EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_FILE" 2>/dev/null | cut -d= -f2)
            echo -e "  網域: $DOMAIN"
            echo -e "  到期日: $EXPIRY"
        fi
        echo -e "  證書路徑: certbot/letsencrypt/live/$DOMAIN/\n"
    else
        # 證書不存在，詢問是否要申請
        echo -e "${YELLOW}⚠️  SSL 憑證不存在${NC}"
        echo -e "請確認以下事項："
        echo -e "  1. 域名 $DOMAIN 的 DNS 已指向本機"
        echo -e "  2. 防火牆已開放 80 和 443 埠"
        echo ""
        read -p "是否要現在申請 SSL 憑證？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "申請 SSL 憑證中..."
            echo -e "這可能需要 1-2 分鐘，請稍候...\n"
            
            # 使用 make add-domain 申請證書
            if make add-domain DOMAIN="$DOMAIN"; then
                echo -e "${GREEN}✅ SSL 憑證申請成功${NC}\n"
                
                # 顯示證書資訊
                if [ -f "certbot/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
                    EXPIRY=$(openssl x509 -enddate -noout -in "certbot/letsencrypt/live/$DOMAIN/fullchain.pem" 2>/dev/null | cut -d= -f2)
                    echo -e "  到期日: $EXPIRY"
                fi
            else
                echo -e "${RED}❌ SSL 憑證申請失敗${NC}"
                echo -e "請手動執行以下指令排查問題："
                echo -e "  cd $NGINX_PROXY_DIR"
                echo -e "  make add-domain DOMAIN=$DOMAIN"
                echo -e ""
                echo -e "常見問題："
                echo -e "  1. DNS 解析尚未生效（剛設定需要等待）"
                echo -e "  2. 防火牆未開放 80 埠"
                echo -e "  3. Nginx 容器未正常運行"
                exit 1
            fi
        else
            echo -e "${RED}❌ 需要 SSL 憑證才能繼續部署${NC}"
            echo -e "請事後手動申請："
            echo -e "  cd $NGINX_PROXY_DIR"
            echo -e "  make add-domain DOMAIN=$DOMAIN"
            exit 1
        fi
    fi
}

# 重新載入 Nginx
reload_nginx() {
    echo -e "${YELLOW}[額外步驟] 重新載入 Nginx...${NC}"
    
    cd "$NGINX_PROXY_DIR"
    
    # 測試 Nginx 配置
    echo -e "測試 Nginx 配置..."
    if ! docker exec nginx-proxy nginx -t; then
        echo -e "${RED}❌ Nginx 配置測試失敗${NC}"
        echo -e "請檢查設定檔: $NGINX_PROXY_DIR/nginx/conf.d/$DOMAIN.conf"
        exit 1
    fi
    
    # 重新載入 Nginx
    echo -e "重新載入 Nginx..."
    if docker exec nginx-proxy nginx -s reload; then
        echo -e "${GREEN}✅ Nginx 重新載入成功${NC}\n"
    else
        echo -e "${RED}❌ Nginx 重新載入失敗${NC}"
        exit 1
    fi
}

# 顯示部署資訊
show_summary() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}✅ 部署完成！${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${YELLOW}網域:${NC} https://$DOMAIN"
    echo -e "${YELLOW}靜態檔案位置:${NC} $NGINX_PROXY_DIR/www/$DOMAIN/"
    echo -e "${YELLOW}Nginx 設定檔:${NC} $NGINX_PROXY_DIR/nginx/conf.d/$DOMAIN.conf"
    echo -e "${YELLOW}容器內路徑:${NC} /var/www/$DOMAIN"
    echo -e "${BLUE}========================================${NC}"
    echo -e "常用指令："
    echo -e "  ${YELLOW}重新載入 Nginx:${NC} cd $NGINX_PROXY_DIR && docker exec nginx-proxy nginx -s reload"
    echo -e "  ${YELLOW}測試 Nginx 配置:${NC} cd $NGINX_PROXY_DIR && docker exec nginx-proxy nginx -t"
    echo -e "  ${YELLOW}查看 Nginx 日誌:${NC} cd $NGINX_PROXY_DIR && docker logs nginx-proxy"
    echo -e "  ${YELLOW}檢查 SSL 憑證:${NC} cd $NGINX_PROXY_DIR && make cert-check DOMAIN=$DOMAIN"
    echo -e "  ${YELLOW}申請 SSL 憑證:${NC} cd $NGINX_PROXY_DIR && make add-domain DOMAIN=$DOMAIN"
    echo -e "${BLUE}========================================${NC}"
}

# ===== 主程式 =====
main() {
    # 記錄開始時間
    START_TIME=$(date +%s)
    
    # 執行步驟
    confirm_domain
    check_directories
    check_dist
    copy_files
    create_nginx_config
    check_ssl_certificate  # 現在會用 make add-domain 申請證書
    reload_nginx
    
    # 計算花費時間
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    show_summary
    echo -e "${GREEN}✨ 部署花費: ${DURATION} 秒${NC}"
}

# 執行主程式
main