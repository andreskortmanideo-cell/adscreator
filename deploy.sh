#!/bin/bash
cd /var/www/adscreator
git pull origin main
npm install
rm -rf .next
npm run build
pm2 restart adscreator
echo "✅ Deploy completo: $(date)"
