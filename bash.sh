#!/bin/bash

echo "🔧 Setting up Python backend..."
cd backend || exit
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

echo "🔧 Setting up React frontend..."
cd frontend || exit
npm install
echo "✅ Setup completed! Use 'npm run dev' in frontend/ and 'uvicorn main:app --reload --port 8000' in backend/."
