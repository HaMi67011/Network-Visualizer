#!/bin/bash
cd backend || exit
if [ ! -d "venv" ]; then python3 -m venv venv; fi
source venv/bin/activate
pip install --upgrade pip
pip install fastapi uvicorn python-multipart
python -m uvicorn main:app --reload --port 8000 & BACKEND_PID=$!
cd ../frontend || exit
if [ ! -d "node_modules" ]; then npm install; fi
npm run dev
kill $BACKEND_PID
