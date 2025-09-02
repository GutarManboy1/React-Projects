#!/bin/bash

echo "📧 Sending Test Emails to Admin Users Collection"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 This script will:${NC}"
echo "1. Check if you're authenticated with Firebase"
echo "2. Verify email configuration exists"
echo "3. Deploy the email functions"
echo "4. Send test emails to all admin users in Firestore"
echo ""

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found${NC}"
    exit 1
fi

# Check authentication
echo -e "${BLUE}🔐 Checking Firebase authentication...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please authenticate first:${NC}"
    echo "firebase login --reauth"
    exit 1
fi

echo -e "${GREEN}✅ Firebase authenticated${NC}"

# Check email config
echo -e "${BLUE}📧 Checking email configuration...${NC}"
EMAIL_CONFIG=$(firebase functions:config:get email 2>/dev/null)

if [ "$EMAIL_CONFIG" = "{}" ] || [ -z "$EMAIL_CONFIG" ]; then
    echo -e "${YELLOW}⚠️  No email configuration found${NC}"
    echo ""
    echo "Please set up email configuration first:"
    echo ""
    echo -e "${YELLOW}For Gmail:${NC}"
    echo 'firebase functions:config:set \'
    echo '  email.host="smtp.gmail.com" \'
    echo '  email.port="587" \'
    echo '  email.user="your-gmail@gmail.com" \'
    echo '  email.password="your-app-password"'
    echo ""
    echo -e "${YELLOW}For other SMTP:${NC}"
    echo 'firebase functions:config:set \'
    echo '  email.host="your-smtp-host" \'
    echo '  email.port="587" \'
    echo '  email.user="your-email@domain.com" \'
    echo '  email.password="your-password"'
    echo ""
    read -p "Press Enter after setting up email config, or Ctrl+C to exit..."
fi

echo -e "${GREEN}✅ Email configuration found${NC}"

# Check current project
echo -e "${BLUE}🔍 Detecting accessible Firebase project...${NC}"
CURRENT_PROJECT=$(firebase use 2>/dev/null | grep "Now using project" | awk '{print $4}' | tr -d '()')
if [ -z "$CURRENT_PROJECT" ]; then
    CURRENT_PROJECT=$(firebase projects:list 2>/dev/null | grep "│" | head -2 | tail -1 | awk '{print $2}' | tr -d '│' | xargs)
fi

if [ -z "$CURRENT_PROJECT" ]; then
    echo -e "${RED}❌ Could not detect Firebase project${NC}"
    echo "Available projects:"
    firebase projects:list
    echo ""
    echo "Please set your project with: firebase use PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}✅ Using project: $CURRENT_PROJECT${NC}"

# Install dependencies and deploy
echo -e "${BLUE}📦 Installing function dependencies...${NC}"
cd functions
if ! npm install; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
cd ..

echo -e "${BLUE}🚀 Deploying functions...${NC}"
if ! firebase deploy --only functions --project "$CURRENT_PROJECT"; then
    echo -e "${RED}❌ Failed to deploy functions${NC}"
    echo -e "${YELLOW}💡 Try switching projects:${NC}"
    echo "firebase projects:list"
    echo "firebase use PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}✅ Functions deployed successfully${NC}"

# Send test emails
echo -e "${BLUE}📧 Sending test emails to admin users...${NC}"
echo ""

# Determine the function URL based on project
if [[ "$CURRENT_PROJECT" == *"staging"* ]]; then
    REGION="us-central1"
elif [[ "$CURRENT_PROJECT" == *"production"* ]]; then
    REGION="us-central1"
else
    REGION="us-central1"
fi

FUNCTION_URL="https://${REGION}-${CURRENT_PROJECT}.cloudfunctions.net/testEmailToAdminsHttp"

echo "Calling test email function..."
RESULT=$(curl -s -X POST "$FUNCTION_URL")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Test email function called successfully${NC}"
    echo ""
    echo "Response:"
    echo "$RESULT" | python3 -m json.tool 2>/dev/null || echo "$RESULT"
else
    echo -e "${RED}❌ Failed to call test email function${NC}"
    echo ""
    echo -e "${YELLOW}Alternative: Use Firebase Functions shell${NC}"
    echo "cd functions"
    echo "npm run shell"
    echo "testEmailToAdmins()"
fi

echo ""
echo -e "${BLUE}📊 Check results:${NC}"
echo "• Function logs: firebase functions:log --only testEmailToAdmins"
echo "• Real-time logs: firebase functions:log --follow"
echo "• Check your email inboxes"
echo ""
echo -e "${GREEN}🎉 Test email process completed!${NC}"