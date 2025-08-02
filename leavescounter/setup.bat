@echo off
echo 🌳 Setting up Tree Calculator...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 3 is required but not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

echo ✅ Python and Node.js found

REM Setup backend
echo 📦 Setting up backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install Python dependencies
echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Copy environment file
if not exist ".env" (
    copy .env.example .env
    echo 📝 Created .env file from template
)

cd ..

REM Setup frontend
echo 📦 Setting up frontend...
cd frontend

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

cd ..

echo ✅ Setup complete!
echo.
echo 🚀 To start the application:
echo 1. Start the backend:
echo    cd backend
echo    venv\Scripts\activate
echo    python main.py
echo.
echo 2. In a new terminal, start the frontend:
echo    cd frontend
echo    npm start
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo 📚 See README.md for more information
pause
