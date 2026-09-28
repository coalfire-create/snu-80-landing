#!/bin/bash
# SNU Landing Page - Instant Rollback Script to v1
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🔄 Rolling back to v1 (Original)..."

# 1. 파일 복사 복원
cp "$DIR/_v1_backup/index.html" "$DIR/index.html"
cp -r "$DIR/_v1_backup/src/"* "$DIR/src/"
cp "$DIR/_v1_backup/package.json" "$DIR/package.json"

echo "✅ All files restored from _v1_backup successfully!"
echo "✨ You can also run 'git checkout release/v1-original' or 'git checkout v1.0.0' anytime."
