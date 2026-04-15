# ===== 變數設定 =====
DEPLOY_SCRIPT   = ./deploy.sh
UNDEPLOY_SCRIPT = ./undeploy.sh

# 顏色定義
BLUE          = \033[0;34m
GREEN         = \033[0;32m
YELLOW        = \033[1;33m
RED           = \033[0;31m
NC            = \033[0m

.PHONY: help deploy undeploy status logs nginx-test nginx-reload

# ===== 預設指令：顯示幫助 =====
help:
	@echo -e "$(BLUE)========================================$(NC)"
	@echo -e "$(BLUE)    Vue Frontend 管理工具 (Makefile)$(NC)"
	@echo -e "$(BLUE)========================================$(NC)"
	@echo -e "$(YELLOW)使用方式:$(NC) make [指令]"
	@echo ""
	@echo -e "$(GREEN)deploy$(NC)         - 執行 deploy.sh 部署靜態網頁與設定 SSL"
	@echo -e "$(GREEN)undeploy$(NC)       - 執行 undeploy.sh 移除網頁與設定檔"
	@echo -e "$(GREEN)status$(NC)         - 檢查 Nginx Proxy 與網頁檔案狀態"
	@echo -e "$(GREEN)nginx-test$(NC)     - 測試 Nginx 設定檔語法是否正確"
	@echo -e "$(GREEN)nginx-reload$(NC)   - 強制 Nginx Proxy 重新載入設定"
	@echo -e "$(GREEN)logs$(NC)           - 查看 Nginx Proxy 的執行日誌"
	@echo -e "$(BLUE)========================================$(NC)"

# ===== 主要流程 =====

# 部署
deploy:
	@echo -e "$(YELLOW)正在準備執行部署腳本...$(NC)"
	@chmod +x $(DEPLOY_SCRIPT)
	@$(DEPLOY_SCRIPT)

# 移除部署
undeploy:
	@echo -e "$(RED)正在準備執行解除部署腳本...$(NC)"
	@chmod +x $(UNDEPLOY_SCRIPT)
	@$(UNDEPLOY_SCRIPT)

# ===== 輔助指令 =====

# 檢查狀態
status:
	@echo -e "$(YELLOW)--- Nginx Proxy 容器狀態 ---$(NC)"
	@docker ps --filter "name=nginx-proxy"
	@echo -e "\n$(YELLOW)--- 網頁目錄狀態 (www) ---$(NC)"
	@ls -lh ../nginx-proxy/www/ 2>/dev/null || echo -e "$(RED)資料夾不存在$(NC)"
	@echo -e "\n$(YELLOW)--- Nginx 設定檔狀態 ---$(NC)"
	@ls -lh ../nginx-proxy/nginx/conf.d/*.conf 2>/dev/null || echo -e "$(RED)無設定檔$(NC)"

# 測試 Nginx 設定
nginx-test:
	@echo -e "$(YELLOW)測試 Nginx 設定語法...$(NC)"
	@docker exec nginx-proxy nginx -t

# 重新載入 Nginx
nginx-reload:
	@echo -e "$(YELLOW)重新載入 Nginx 設定...$(NC)"
	@docker exec nginx-proxy nginx -s reload
	@echo -e "$(GREEN)✅ 已重新載入$(NC)"

# 查看日誌
logs:
	@echo -e "$(YELLOW)查看 Nginx Proxy 日誌 (Ctrl+C 結束)...$(NC)"
	@docker logs -f nginx-proxy