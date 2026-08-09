$ErrorActionPreference = "Stop"

Write-Host "Deploying Admin..."
cd apps/panels/admin
vercel link --yes
"https://enginow-api.onrender.com/api" | vercel env add VITE_API_URL production
"https://enginow-web.vercel.app" | vercel env add VITE_MAIN_WEB_URL production
vercel --prod
cd ../../..

Write-Host "Deploying HR..."
cd apps/panels/hr
vercel link --yes
"https://enginow-api.onrender.com/api" | vercel env add VITE_API_URL production
vercel --prod
cd ../../..

Write-Host "Deploying Educator..."
cd apps/panels/educator
vercel link --yes
"https://enginow-api.onrender.com/api" | vercel env add VITE_API_URL production
vercel --prod
cd ../../..

Write-Host "Deploying Sales..."
cd apps/panels/sales
vercel link --yes
"https://enginow-api.onrender.com/api" | vercel env add VITE_API_URL production
vercel --prod
cd ../../..

Write-Host "Deploying Main Web..."
cd apps/web
vercel link --yes
"https://enginow-api.onrender.com/api" | vercel env add VITE_API_URL production
vercel --prod
cd ../..

Write-Host "All deployments successfully launched!"
