#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Installing Backend Dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r backend/requirements.txt

echo "Build Complete!"
