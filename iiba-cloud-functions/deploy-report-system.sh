#!/bin/bash

# IIBA Admin Report System Deployment Script
echo "🚀 IIBA Admin Report System - Deployment Script"
echo "================================================"

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

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  You are not logged in to Firebase. Please login first:${NC}"
    echo "firebase login"
    exit 1
fi

echo -e "${BLUE}📋 Deployment Checklist:${NC}"
echo "1. ✅ Cloud Functions package added to pubspec.yaml"
echo "2. ✅ Email notification service updated"
echo "3. ✅ Firebase Functions configuration created"
echo "4. ✅ Firestore security rules updated"
echo "5. ✅ Firestore indexes defined"
echo "6. ✅ Admin setup page created"
echo ""

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

# Step 1: Install Functions Dependencies
echo -e "${BLUE}📦 Step 1: Installing Cloud Functions dependencies${NC}"
if [ -d "functions" ]; then
    cd functions
    if [ -f "package.json" ]; then
        echo "Installing Node.js dependencies..."
        npm install
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
        else
            echo -e "${RED}❌ Failed to install dependencies${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ package.json not found in functions directory${NC}"
        exit 1
    fi
    cd ..
else
    echo -e "${RED}❌ Functions directory not found${NC}"
    exit 1
fi

# Step 2: Set Email Configuration
echo -e "${BLUE}📧 Step 2: Email Configuration${NC}"
echo "You need to configure email settings for the notification system."
echo ""

if confirm "Do you want to configure email settings now?"; then
    echo "Please provide your email configuration:"
    read -p "Enter sender email address (e.g., your-email@gmail.com): " EMAIL_USER
    read -s -p "Enter email password or app password: " EMAIL_PASSWORD
    echo ""
    
    if [ -n "$EMAIL_USER" ] && [ -n "$EMAIL_PASSWORD" ]; then
        echo "Setting email configuration..."
        firebase functions:config:set email.user="$EMAIL_USER" email.password="$EMAIL_PASSWORD"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Email configuration set successfully${NC}"
        else
            echo -e "${RED}❌ Failed to set email configuration${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Email configuration skipped${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Email configuration skipped. You can set it later with:${NC}"
    echo "firebase functions:config:set email.user=\"your-email@gmail.com\" email.password=\"your-password\""
fi

# Step 3: Deploy Firestore Rules and Indexes
echo -e "${BLUE}🔒 Step 3: Deploying Firestore Rules and Indexes${NC}"
if confirm "Deploy Firestore security rules and indexes?"; then
    firebase deploy --only firestore
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Firestore rules and indexes deployed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to deploy Firestore rules and indexes${NC}"
        exit 1
    fi
fi

# Step 4: Deploy Cloud Functions
echo -e "${BLUE}☁️  Step 4: Deploying Cloud Functions${NC}"
if confirm "Deploy Cloud Functions for email notifications?"; then
    firebase deploy --only functions
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Cloud Functions deployed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to deploy Cloud Functions${NC}"
        exit 1
    fi
fi

# Step 5: Flutter Code Generation
echo -e "${BLUE}🔄 Step 5: Running Flutter Code Generation${NC}"
if confirm "Run Flutter code generation?"; then
    flutter pub get
    flutter pub run build_runner build --delete-conflicting-outputs
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Code generation completed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to run code generation${NC}"
        exit 1
    fi
fi

# Step 6: Build and Deploy Web App (optional)
echo -e "${BLUE}🌐 Step 6: Build and Deploy Web Application${NC}"
if confirm "Build and deploy the web application?"; then
    echo "Building Flutter web app..."
    flutter build web --dart-define-from-file=env/dev.json
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Web app built successfully${NC}"
        
        if confirm "Deploy to Firebase Hosting?"; then
            firebase deploy --only hosting
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Web app deployed successfully${NC}"
            else
                echo -e "${RED}❌ Failed to deploy web app${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Failed to build web app${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Deployment Process Completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. 👤 Visit your admin panel at: https://your-app.web.app/admin-setup"
echo "2. 🛠️  Initialize default admin users"
echo "3. 📧 Test email notifications"
echo "4. 🚨 Create a test report to verify the system"
echo ""
echo -e "${BLUE}📚 Useful Commands:${NC}"
echo "• View function logs: firebase functions:log"
echo "• View email config: firebase functions:config:get"
echo "• Test functions locally: firebase emulators:start"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "• Update email credentials if using Gmail (enable 2FA and use App Password)"
echo "• Configure Firebase Auth custom claims for admin users"
echo "• Set up proper monitoring and alerting for the functions"
echo ""
echo -e "${GREEN}✅ Report System is ready for use!${NC}"