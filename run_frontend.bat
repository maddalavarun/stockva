@echo off
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
echo @tailwind base; > src/index.css
echo @tailwind components; >> src/index.css
echo @tailwind utilities; >> src/index.css
npm run dev
