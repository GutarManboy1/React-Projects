# IIBA Admin Report System - Complete Setup Guide

## 🎯 Overview

This guide will walk you through the complete setup of the IIBA Admin Report System, including email notifications, admin user management, and report handling capabilities.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Flutter SDK (3.4.3+)
- ✅ Firebase CLI installed (`npm install -g firebase-tools`)
- ✅ Firebase project set up with Firestore and Functions enabled
- ✅ Node.js 18+ for Cloud Functions
- ✅ Admin access to your Firebase project

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

Run the automated deployment script:

```bash
./deploy-report-system.sh
```

This script will:
1. Install all dependencies
2. Configure email settings
3. Deploy Firestore rules and indexes
4. Deploy Cloud Functions
5. Run code generation
6. Optionally build and deploy the web app

### Option 2: Manual Setup

Follow the manual steps below for more control over the process.

## 📝 Manual Setup Steps

### Step 1: Install Dependencies

```bash
# Install Flutter dependencies
flutter pub get

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### Step 2: Configure Email Settings

Set up email configuration for notifications:

```bash
# For Gmail (recommended for development)
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"

# For other SMTP providers
firebase functions:config:set email.host="smtp.your-provider.com"
firebase functions:config:set email.port="587"
firebase functions:config:set email.user="your-email@provider.com"
firebase functions:config:set email.password="your-password"
```

**Gmail Setup:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the App Password (not your regular password)

### Step 3: Deploy Firebase Configuration

```bash
# Deploy Firestore security rules and indexes
firebase deploy --only firestore

# Deploy Cloud Functions
firebase deploy --only functions
```

### Step 4: Generate Flutter Code

```bash
# Generate DTOs and other code
flutter pub run build_runner build --delete-conflicting-outputs
```

### Step 5: Build and Test

```bash
# Build the web application
flutter build web --dart-define-from-file=env/dev.json

# Optional: Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 👤 Admin User Setup

### Method 1: Using Admin Setup Page (Recommended)

1. Run your Flutter app locally or access your deployed app
2. Navigate to `/admin-setup` in your admin panel
3. Click "デフォルト管理者を作成" to create default admin users
4. Add custom admin users using the form
5. Test email notifications

### Method 2: Manual Database Setup

Add admin users directly to Firestore:

```javascript
// In Firestore Console, create collection: admin_users
// Add documents with this structure:
{
  "id": "admin-001",
  "email": "admin@iiba.co.jp",
  "display_name": "System Administrator",
  "role": "admin",
  "receive_report_notifications": true,
  "notification_preferences": {
    "spot": true,
    "theme_map": true,
    "event": true,
    "user": true,
    "content": true
  },
  "status": "active",
  "created_at": "2025-01-01T00:00:00Z"
}
```

## 🔐 Firebase Auth Configuration

Set up custom claims for admin users:

```javascript
// Use Firebase Admin SDK or Firebase Console
// Set custom claims for admin users:
{
  "admin": true,
  "role": "admin"
}
```

Or use the provided script:

```bash
# If you have the admin script
node scripts/set-admin.js user@example.com
```

## 🧪 Testing the System

### 1. Test Email Configuration

```bash
# Check current configuration
firebase functions:config:get

# View function logs
firebase functions:log --only sendReportNotification
```

### 2. Test Report Creation

1. Use the ReportButton component in any page:

```dart
ReportButton(
  reportType: ReportType.spot,
  reportedItemId: 'test-spot-001',
  reportedItemName: 'Test Spot',
  reporterUserId: 'current-user-id',
)
```

2. Or create a report programmatically:

```dart
final reportService = ref.read(reportServiceProvider);
final result = await reportService.submitReport(
  reportType: ReportType.spot,
  reportReason: ReportReason.inappropriateContent,
  reportedItemId: 'test-spot-001',
  reporterUserId: 'test-user-001',
  reportedItemName: 'Test Spot',
  description: 'This is a test report',
  priority: 3,
);
```

### 3. Test Email Notifications

1. Go to Admin Setup page (`/admin-setup`)
2. Enter a test user ID
3. Click "メール通知をテスト"
4. Check your email for the notification
5. Check Firebase Functions logs for any errors

## 🛠️ Configuration Options

### Email Templates

Customize email templates in `functions/email_notification.js`:

```javascript
// Modify the HTML template
const htmlContent = `
  <html>
    <!-- Your custom email template -->
  </html>
`;
```

### Report Types

Add new report types in `lib/domain/dto/report.dart`:

```dart
enum ReportType {
  @JsonValue('spot')
  spot,
  
  @JsonValue('custom_type')
  customType, // Add your custom type
}
```

### Admin Panel URL

Update the admin panel URL in the email service:

```dart
// In EmailNotificationService
String _generateAdminUrl(Report report) {
  const baseUrl = 'https://your-admin-domain.com';
  return '$baseUrl/reports/${report.id}';
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Emails Not Sending

**Check:**
- Firebase Functions logs: `firebase functions:log`
- Email configuration: `firebase functions:config:get`
- Gmail App Password (if using Gmail)
- SMTP settings

**Solutions:**
- Verify email credentials
- Check firewall/network restrictions
- Test with a different email provider
- Enable "Less secure app access" (not recommended) or use OAuth2

#### 2. Permission Errors

**Check:**
- Firestore security rules
- Firebase Auth custom claims
- User authentication status

**Solutions:**
- Update Firestore rules
- Set proper custom claims for admin users
- Verify user is logged in

#### 3. Function Deployment Errors

**Check:**
- Node.js version (should be 18+)
- Firebase CLI version
- Function dependencies

**Solutions:**
- Update Node.js: `nvm use 18`
- Update Firebase CLI: `npm install -g firebase-tools@latest`
- Clear npm cache: `npm cache clean --force`

#### 4. Code Generation Issues

**Check:**
- Build runner version
- Conflicts in generated files

**Solutions:**
- Clean and regenerate: `flutter clean && flutter pub get && flutter pub run build_runner build --delete-conflicting-outputs`

### Debug Commands

```bash
# View all Firebase projects
firebase projects:list

# Switch Firebase project
firebase use your-project-id

# View function logs
firebase functions:log --only sendReportNotification

# Test functions locally
firebase emulators:start --only functions

# Check Firestore data
firebase firestore:data-export gs://your-bucket/backup

# View hosting sites
firebase hosting:sites:list
```

## 📊 Monitoring and Maintenance

### 1. Set Up Monitoring

- Enable Firebase Performance Monitoring
- Set up Cloud Monitoring alerts for function errors
- Monitor email delivery rates
- Track report submission patterns

### 2. Regular Maintenance

- Review and clean up old test reports
- Update email templates as needed
- Monitor admin user list
- Check for security rule updates

### 3. Backup Strategy

```bash
# Export Firestore data
firebase firestore:data-export gs://your-backup-bucket/$(date +%Y%m%d)

# Backup function code
git tag -a v1.0.0 -m "Report system v1.0.0"
git push origin --tags
```

## 🔒 Security Best Practices

### 1. Email Security

- Use App Passwords instead of regular passwords
- Consider OAuth2 for production
- Use environment variables for sensitive data
- Enable 2FA on email accounts

### 2. Firestore Security

- Review security rules regularly
- Use least privilege principle
- Enable audit logs
- Monitor for unusual access patterns

### 3. Function Security

- Validate all input data
- Use HTTPS-only functions
- Implement rate limiting
- Monitor for abuse

## 🎯 Production Deployment

### 1. Environment Configuration

Update email settings for production:

```bash
# Production email settings
firebase functions:config:set email.user="noreply@yourcompany.com"
firebase functions:config:set email.password="production-password"
```

### 2. Domain Configuration

Update admin panel URL:

```dart
// Update in EmailNotificationService
const baseUrl = 'https://admin.yourcompany.com';
```

### 3. Monitoring Setup

- Set up error alerting
- Configure uptime monitoring
- Enable logging and analytics

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review Firebase Functions logs
3. Verify configuration settings
4. Test with minimal examples

For additional support, check:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Flutter Documentation](https://flutter.dev/docs)
- [REPORT_SYSTEM.md](./REPORT_SYSTEM.md) for detailed API documentation

---

## 🎉 Success Checklist

- [ ] Dependencies installed
- [ ] Email configuration set
- [ ] Firebase rules and indexes deployed
- [ ] Cloud Functions deployed
- [ ] Admin users created
- [ ] Email notifications tested
- [ ] Report creation tested
- [ ] Admin panel accessible
- [ ] Security rules verified
- [ ] Monitoring configured

**Congratulations! Your report system is now fully operational! 🚀**