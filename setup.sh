#!/bin/bash

# ==========================================
# 🔴 必改项：请将下面的 "your-username" 改为你真实的 GitHub 用户名
# 例如：GITHUB_USER="jackma"
GITHUB_USER="KenLesro" 
# ==========================================

REPO_NAME="sentiment-x"

echo "🚀 正在为您构建 Sentiment-X 开发环境..."

# 1. 生成 package.json (定义项目依赖和部署命令)
cat <<EOF > package.json
{
  "name": "$REPO_NAME",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "homepage": "https://$GITHUB_USER.github.io/$REPO_NAME",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.12.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.64",
    "@types/react-dom": "^18.2.21",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "gh-pages": "^6.1.1",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.6"
  }
}
EOF

# 2. 生成 vite.config.js (构建配置)
cat <<EOF > vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/$REPO_NAME/', 
})
EOF

# 3. 生成 tailwind.config.js (样式配置)
cat <<EOF > tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# 4. 生成 index.html (网页入口)
cat <<EOF > index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sentiment-X | Market Compass</title>
  </head>
  <body class="bg-slate-950">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# 5. 创建 src 目录
mkdir -p src

# 6. 生成 src/main.jsx (React 入口)
cat <<EOF > src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# 7. 生成 src/index.css (全局样式)
cat <<EOF > src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

echo "✅ 环境配置文件已全部生成！"
echo "⚠️  下一步非常重要："
echo "1. 请手动在 src 文件夹下新建 App.jsx 文件。"
echo "2. 将 'Sentiment-X Final' 的完整代码粘贴进去。"
echo "3. 然后在终端运行: npm install && npm run deploy"