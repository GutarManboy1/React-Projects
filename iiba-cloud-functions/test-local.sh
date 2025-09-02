#!/bin/bash

# Local Testing Script for IIBA Report System
echo "🧪 IIBA Report System - Local Testing Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed. Please install it first:${NC}"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Function to ask for confirmation
confirm() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes (y) or no (n).";;
        esac
    done
}

echo -e "${BLUE}📋 Local Testing Setup Steps:${NC}"
echo "1. Install dependencies"
echo "2. Set up Firebase emulators"
echo "3. Start emulator suite"
echo "4. Run Flutter app with emulator configuration"
echo ""

# Step 1: Install Dependencies
echo -e "${BLUE}📦 Step 1: Installing Dependencies${NC}"
if confirm "Install Flutter and Function dependencies?"; then
    echo "Installing Flutter dependencies..."
    flutter pub get
    
    if [ -d "functions" ]; then
        echo "Installing Cloud Functions dependencies..."
        cd functions
        npm install
        cd ..
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${RED}❌ Functions directory not found${NC}"
        exit 1
    fi
fi

# Step 2: Generate code
echo -e "${BLUE}🔄 Step 2: Generating Code${NC}"
if confirm "Run code generation?"; then
    flutter pub run build_runner build --delete-conflicting-outputs
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Code generation completed${NC}"
    else
        echo -e "${RED}❌ Code generation failed${NC}"
        exit 1
    fi
fi

# Step 3: Start Firebase Emulators
echo -e "${BLUE}🔥 Step 3: Starting Firebase Emulators${NC}"
echo "This will start:"
echo "• Auth Emulator (port 9099)"
echo "• Firestore Emulator (port 8080)" 
echo "• Functions Emulator (port 5001)"
echo "• Hosting Emulator (port 5000)"
echo "• Emulator UI (port 4000)"
echo ""

if confirm "Start Firebase emulators?"; then
    echo "Starting emulators in background..."
    firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data &
    EMULATOR_PID=$!
    
    echo "Waiting for emulators to start..."
    sleep 10
    
    echo -e "${GREEN}✅ Emulators started successfully${NC}"
    echo -e "${BLUE}🌐 Emulator UI: http://localhost:4000${NC}"
    echo ""
fi

# Step 4: Create test environment file
echo -e "${BLUE}⚙️  Step 4: Creating Test Environment${NC}"
if confirm "Create test environment configuration?"; then
    cat > env/test.json << EOF
{
  "USE_FIREBASE_EMULATOR": "true",
  "FIREBASE_AUTH_EMULATOR_HOST": "localhost:9099",
  "FIRESTORE_EMULATOR_HOST": "localhost:8080",
  "FIREBASE_FUNCTIONS_EMULATOR_HOST": "localhost:5001"
}
EOF
    echo -e "${GREEN}✅ Test environment created: env/test.json${NC}"
fi

# Step 5: Instructions for running Flutter
echo -e "${BLUE}🚀 Step 5: Running Flutter App${NC}"
echo "To test the app with emulators, run:"
echo -e "${YELLOW}flutter run -d chrome --dart-define-from-file=env/test.json${NC}"
echo ""

# Step 6: Testing Instructions
echo -e "${BLUE}📝 Testing Instructions:${NC}"
echo ""
echo -e "${YELLOW}1. Authentication Testing:${NC}"
echo "   • Go to http://localhost:4000 (Emulator UI)"
echo "   • Navigate to Authentication tab"
echo "   • Create test users manually"
echo ""
echo -e "${YELLOW}2. Admin Setup Testing:${NC}"
echo "   • In your Flutter app, go to /admin-setup"
echo "   • Click 'デフォルト管理者を作成'"
echo "   • Add custom admin users"
echo ""
echo -e "${YELLOW}3. Report System Testing:${NC}"
echo "   • Go to any page with ReportButton or ReportFAB"
echo "   • Create test reports"
echo "   • Check Firestore emulator for data"
echo "   • Verify function calls in Functions emulator logs"
echo ""
echo -e "${YELLOW}4. Email Testing (Local):${NC}"
echo "   • Check Functions emulator logs for email attempts"
echo "   • Email won't actually send in emulator mode"
echo "   • Function will log what would have been sent"
echo ""

# Step 7: Cleanup instructions
echo -e "${BLUE}🧹 Cleanup Instructions:${NC}"
echo "To stop testing:"
echo "• Press Ctrl+C to stop Flutter app"
echo "• Run: firebase emulators:stop"
echo "• Or kill process: kill $EMULATOR_PID"
echo ""

echo -e "${GREEN}🎉 Local Testing Environment Ready!${NC}"
echo ""
echo -e "${BLUE}📚 Useful URLs:${NC}"
echo "• Emulator UI: http://localhost:4000"
echo "• Flutter App: http://localhost:5000 (hosting emulator)"
echo "• Your Flutter Dev Server: http://localhost:8080 (when you run flutter run)"
echo ""
echo -e "${BLUE}📊 Monitoring:${NC}"
echo "• Watch emulator logs: firebase emulators:start --debug"
echo "• View function logs in Emulator UI → Functions tab"
echo "• Check Firestore data in Emulator UI → Firestore tab"
echo ""

if [ ! -z "$EMULATOR_PID" ]; then
    echo -e "${YELLOW}⚠️  Emulators are running in background (PID: $EMULATOR_PID)${NC}"
    echo "To stop them later: kill $EMULATOR_PID"
fi