#!/bin/bash

# Email Testing Setup Script
echo "📧 IIBA Report System - Email Testing Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo -e "${BLUE}📋 Email Testing Setup Steps:${NC}"
echo "1. Configure email credentials"
echo "2. Deploy Cloud Functions to development project"
echo "3. Set up admin users"
echo "4. Send test emails"
echo ""

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed${NC}"
    exit 1
fi

# Step 1: Email Configuration
echo -e "${BLUE}📧 Step 1: Email Configuration${NC}"
echo "Choose your email provider:"
echo "1. Gmail (recommended for testing)"
echo "2. Other SMTP provider"
echo ""

read -p "Select option (1 or 2): " EMAIL_OPTION

if [ "$EMAIL_OPTION" = "1" ]; then
    echo -e "${YELLOW}Gmail Setup Instructions:${NC}"
    echo "1. Enable 2-Factor Authentication on your Google account"
    echo "2. Go to: https://myaccount.google.com/apppasswords"
    echo "3. Generate an App Password for 'Mail'"
    echo "4. Use the 16-character App Password below"
    echo ""
    
    read -p "Enter your Gmail address: " EMAIL_USER
    read -s -p "Enter your Gmail App Password (16 chars): " EMAIL_PASSWORD
    echo ""
    
    # Set Gmail configuration
    echo "Setting Gmail configuration..."
    firebase functions:config:set \
        email.host="smtp.gmail.com" \
        email.port="587" \
        email.secure="false" \
        email.user="$EMAIL_USER" \
        email.password="$EMAIL_PASSWORD"

elif [ "$EMAIL_OPTION" = "2" ]; then
    echo -e "${YELLOW}SMTP Configuration:${NC}"
    read -p "Enter SMTP host (e.g., smtp.your-provider.com): " SMTP_HOST
    read -p "Enter SMTP port (usually 587 or 465): " SMTP_PORT
    read -p "Enter your email address: " EMAIL_USER
    read -s -p "Enter your email password: " EMAIL_PASSWORD
    echo ""
    
    # Set SMTP configuration
    echo "Setting SMTP configuration..."
    firebase functions:config:set \
        email.host="$SMTP_HOST" \
        email.port="$SMTP_PORT" \
        email.secure="false" \
        email.user="$EMAIL_USER" \
        email.password="$EMAIL_PASSWORD"
else
    echo -e "${RED}❌ Invalid option${NC}"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Email configuration set successfully${NC}"
else
    echo -e "${RED}❌ Failed to set email configuration${NC}"
    exit 1
fi

# Step 2: Deploy Functions
echo -e "${BLUE}☁️  Step 2: Deploy Cloud Functions${NC}"
if confirm "Deploy Cloud Functions for email testing?"; then
    echo "Installing function dependencies..."
    cd functions && npm install && cd ..
    
    echo "Deploying functions..."
    firebase deploy --only functions --project admin-iiba-development-385505
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Functions deployed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to deploy functions${NC}"
        exit 1
    fi
fi

# Step 3: Flutter Setup
echo -e "${BLUE}📱 Step 3: Flutter App Setup${NC}"
if confirm "Generate code and prepare Flutter app?"; then
    flutter pub get
    flutter pub run build_runner build --delete-conflicting-outputs
    echo -e "${GREEN}✅ Flutter app prepared${NC}"
fi

# Step 4: Testing Instructions
echo -e "${BLUE}🧪 Step 4: Email Testing Instructions${NC}"
echo ""
echo -e "${YELLOW}Method 1: Using Admin Setup Page (Recommended)${NC}"
echo "1. Run your Flutter app:"
echo -e "   ${BLUE}flutter run -d chrome --dart-define-from-file=env/dev.json${NC}"
echo ""
echo "2. Navigate to: http://localhost:port/admin-setup"
echo ""
echo "3. Initialize admin users:"
echo "   • Click '🔧 デフォルト管理者を作成'"
echo "   • Add your own email as a custom admin"
echo ""
echo "4. Test email notifications:"
echo "   • Enter a test user ID"
echo "   • Click '📧 メール通知をテスト'"
echo "   • Check your email inbox"
echo ""

echo -e "${YELLOW}Method 2: Create Test Report (End-to-End)${NC}"
echo "1. Go to any page in your admin panel"
echo "2. Look for ReportButton or ReportFAB"
echo "3. Create a test report"
echo "4. Check admin email for notification"
echo ""

echo -e "${YELLOW}Method 3: Direct Function Testing${NC}"
echo "1. Use Firebase Functions shell:"
echo -e "   ${BLUE}cd functions && npm run shell${NC}"
echo ""
echo "2. Test email function directly:"
echo -e "   ${BLUE}sendReportNotification({reportId: 'test-123'})${NC}"
echo ""

# Step 5: Monitoring
echo -e "${BLUE}📊 Step 5: Monitoring Email Delivery${NC}"
echo ""
echo "Monitor email sending:"
echo -e "• Function logs: ${BLUE}firebase functions:log --only sendReportNotification${NC}"
echo -e "• Real-time logs: ${BLUE}firebase functions:log --follow${NC}"
echo -e "• Firebase Console: https://console.firebase.google.com/project/admin-iiba-development-385505/functions${NC}"
echo ""

# Step 6: Troubleshooting
echo -e "${BLUE}🛠️  Step 6: Troubleshooting${NC}"
echo ""
echo -e "${YELLOW}If emails don't send:${NC}"
echo "1. Check function logs for errors"
echo "2. Verify email credentials"
echo "3. Check spam folder"
echo "4. Try different email provider"
echo ""
echo -e "${YELLOW}Common Gmail issues:${NC}"
echo "• Use App Password, not regular password"
echo "• Enable 2-Factor Authentication first"
echo "• Allow less secure app access (if needed)"
echo ""

echo -e "${GREEN}🎉 Email Testing Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Run Flutter app with dev configuration"
echo "2. Go to /admin-setup page"
echo "3. Create admin users with real email addresses"
echo "4. Test email notifications"
echo "5. Create test reports to verify end-to-end flow"
echo ""

# Display current config
echo -e "${BLUE}📋 Current Email Configuration:${NC}"
firebase functions:config:get email