#!/bin/bash
echo "📚 Đang chạy tool Playwright..."

# Đảm bảo chạy từ thư mục chứa script
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Load config
if [ -f "$DIR/config.env" ]; then
  source "$DIR/config.env"
else
  echo "❌ Không tìm thấy file config.env!"
  read -p "Nhấn Enter để thoát..."
  exit 1
fi

# Chạy script Node với tham số từ config
node "$DIR/scrape.js" "$ITERATIONS" "$TARGET_URL" "$TARGET_PROFILE"

read -p "✅ Xong! Nhấn Enter để thoát..."
