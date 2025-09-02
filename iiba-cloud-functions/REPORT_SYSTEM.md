# Report System Documentation

This document describes the comprehensive report system implemented for the IIBA admin panel, which allows users to report spots, theme maps, events, and other content, with automatic email notifications to the admin team.

## Overview

The report system consists of several components:
- **Data Models**: DTOs for reports and admin users
- **Repository Layer**: Firestore integration for data persistence
- **Service Layer**: Business logic for report management and email notifications
- **UI Components**: Flutter widgets for reporting functionality
- **Cloud Functions**: Server-side email sending functionality
- **Admin Panel**: Web interface for managing reports

## Features

### Core Functionality
- ✅ Report creation for spots, theme maps, events, users, and content
- ✅ Multiple report reasons (inappropriate content, spam, harassment, etc.)
- ✅ Priority levels (1-5) for report triage
- ✅ Evidence attachment support (URLs)
- ✅ Automatic email notifications to admin team
- ✅ Report status tracking (pending, reviewing, resolved, dismissed, action taken)
- ✅ Admin response system
- ✅ Report analytics and filtering

### Email Notifications
- ✅ Automatic notifications to admin team when reports are submitted
- ✅ Customizable admin notification preferences
- ✅ Status update emails to reporters
- ✅ HTML email templates with Japanese localization
- ✅ Priority-based email styling

### Admin Management
- ✅ Admin user collection in Firestore
- ✅ Notification preference management
- ✅ Report assignment to specific admins
- ✅ Bulk report operations
- ✅ Report analytics dashboard

## Architecture

### Data Models

#### Report
```dart
class Report {
  String id;
  ReportType reportType;        // spot, theme_map, event, user, content
  ReportReason reportReason;    // inappropriate_content, spam, harassment, etc.
  ReportStatus status;          // pending, reviewing, resolved, dismissed, action_taken
  String reportedItemId;
  String? reportedItemName;
  String reporterUserId;
  String? reporterUserName;
  String? description;
  List<String> evidenceUrls;
  int priority;                 // 1-5
  DateTime? createdAt;
  DateTime? updatedAt;
  // ... more fields
}
```

#### AdminUser
```dart
class AdminUser {
  String id;
  String email;
  String? displayName;
  String role;
  bool receiveReportNotifications;
  Map<String, bool> notificationPreferences;
  String status;               // active, inactive
  DateTime? createdAt;
  DateTime? updatedAt;
}
```

### Service Architecture

```
UI Components (ReportButton, ReportDialog)
    ↓
ReportService (Business Logic)
    ↓
ReportRepository (Data Access) + EmailNotificationService
    ↓
Firestore + Cloud Functions (Email Sending)
```

## Setup Instructions

### 1. Firebase Configuration

#### Firestore Collections
The system uses two main Firestore collections:

**`reports` collection:**
```javascript
{
  "id": "auto-generated",
  "report_type": "spot",
  "report_reason": "inappropriate_content", 
  "status": "pending",
  "reported_item_id": "spot_12345",
  "reported_item_name": "Test Spot",
  "reporter_user_id": "user_67890",
  "reporter_user_name": "John Doe",
  "description": "This spot contains inappropriate content...",
  "priority": 3,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "email_notification_sent": true
}
```

**`admin_users` collection:**
```javascript
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

#### Firestore Security Rules
Add these rules to your `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reports collection - authenticated users can create, admins can read/update
    match /reports/{reportId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        (request.auth.token.role == 'admin' || request.auth.token.role == 'support');
    }
    
    // Admin users collection - only admins can access
    match /admin_users/{adminId} {
      allow read, write: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

### 2. Cloud Functions Setup

#### Install Dependencies
```bash
cd functions
npm install firebase-functions firebase-admin nodemailer
```

#### Deploy Functions
```bash
# Set email configuration
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"

# Deploy functions
firebase deploy --only functions
```

#### Email Configuration
The system uses Gmail SMTP by default. For production, consider using:
- SendGrid
- AWS SES
- Cloud Email providers

### 3. Admin User Setup

#### Initialize Default Admins
```dart
// In your app initialization
final adminSetup = ref.read(adminSetupProvider);
final results = await adminSetup.initializeDefaultAdmins();

for (final result in results) {
  if (result.success) {
    logger.i('Admin user created: ${result.adminUser?.email}');
  } else {
    logger.e('Failed to create admin: ${result.message}');
  }
}
```

#### Add Custom Admin
```dart
final result = await adminSetup.addAdminUser(
  id: 'admin-custom-001',
  email: 'moderator@iiba.co.jp',
  displayName: 'Content Moderator',
  role: 'moderator',
  notificationPreferences: {
    'spot': true,
    'content': true,
    'user': false,
    'theme_map': false,
    'event': false,
  },
);
```

## Usage Examples

### 1. Adding Report Button to a Spot Page

```dart
import 'package:iiba_admin/presentations/components/report/report_button.dart';

class SpotDetailPage extends StatelessWidget {
  final Spot spot;
  final String currentUserId;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(spot.name),
        actions: [
          // Add report button to app bar
          ReportButton(
            reportType: ReportType.spot,
            reportedItemId: spot.id,
            reportedItemName: spot.name,
            reporterUserId: currentUserId,
            reportedUserId: spot.supplier?.userId,
            reportedUserName: spot.supplier?.name,
          ),
        ],
      ),
      body: Column(
        children: [
          // Spot content...
          
          // Or add as floating action button
          ReportFAB(
            reportType: ReportType.spot,
            reportedItemId: spot.id,
            reportedItemName: spot.name,
            reporterUserId: currentUserId,
          ),
        ],
      ),
    );
  }
}
```

### 2. Manual Report Submission

```dart
import 'package:iiba_admin/applications/report/report_service.dart';

class MyService {
  Future<void> submitSpotReport(String spotId, String userId) async {
    final reportService = ref.read(reportServiceProvider);
    
    final result = await reportService.submitReport(
      reportType: ReportType.spot,
      reportReason: ReportReason.inappropriateContent,
      reportedItemId: spotId,
      reporterUserId: userId,
      reportedItemName: 'Reported Spot',
      description: 'This spot contains inappropriate images.',
      priority: 4, // High priority
      tags: ['inappropriate', 'images'],
    );
    
    if (result.success) {
      print('Report submitted successfully: ${result.reportId}');
      if (result.emailSent) {
        print('Admin team has been notified via email');
      }
    } else {
      print('Failed to submit report: ${result.message}');
    }
  }
}
```

### 3. Admin Report Management

```dart
import 'package:iiba_admin/applications/report/report_service.dart';

class AdminService {
  Future<void> reviewPendingReports() async {
    final reportService = ref.read(reportServiceProvider);
    
    // Get pending reports
    final reportsStream = reportService.getReports(
      status: ReportStatus.pending,
      limit: 10,
    );
    
    await for (final reports in reportsStream) {
      for (final report in reports) {
        print('Report ${report.id}: ${report.reportedItemName}');
        print('Reason: ${report.reportReason}');
        print('Priority: ${report.priority}');
        
        // Update report status
        await reportService.updateReportStatus(
          reportId: report.id,
          status: ReportStatus.resolved,
          adminResponse: 'Content has been reviewed and appropriate action taken.',
        );
      }
    }
  }
}
```

### 4. Testing Email Notifications

```dart
import 'package:iiba_admin/utils/admin_setup.dart';

class TestService {
  Future<void> testEmailSystem() async {
    final adminSetup = ref.read(adminSetupProvider);
    
    final testResult = await adminSetup.testEmailNotification(
      testReporterUserId: 'test-user-001',
      testReporterUserName: 'Test User',
    );
    
    if (testResult.success) {
      print('✅ Email test successful: ${testResult.message}');
      print('Test report ID: ${testResult.reportId}');
      print('Email sent: ${testResult.emailSent}');
    } else {
      print('❌ Email test failed: ${testResult.message}');
    }
  }
}
```

## Monitoring and Analytics

### Report Metrics
```dart
// Get report statistics
final reportService = ref.read(reportServiceProvider);

// Pending reports count
final pendingCount = await reportService.getPendingReportsCount();

// Reports for specific item
final itemReports = await reportService.getReportsForItem(
  itemId: 'spot_12345',
  type: ReportType.spot,
);

// Analyze report patterns
final analysis = await reportService.analyzeItemReports(
  itemId: 'spot_12345',
  type: ReportType.spot,
);

if (analysis.needsImmediateAttention) {
  print('⚠️ Item needs immediate attention!');
  print('Total reports: ${analysis.totalReports}');
  print('Unique reporters: ${analysis.uniqueReporters}');
  print('High priority reports: ${analysis.highPriorityReports}');
}
```

## Customization

### Custom Report Types
To add new report types, update the `ReportType` enum:

```dart
enum ReportType {
  @JsonValue('spot')
  spot,
  
  @JsonValue('theme_map') 
  themeMap,
  
  @JsonValue('event')
  event,
  
  // Add your custom types
  @JsonValue('review')
  review,
  
  @JsonValue('photo')
  photo,
}
```

### Custom Report Reasons
Update the `ReportReason` enum for custom reasons:

```dart
enum ReportReason {
  @JsonValue('inappropriate_content')
  inappropriateContent,
  
  // Add custom reasons
  @JsonValue('copyright_violation')
  copyrightViolation,
  
  @JsonValue('location_incorrect')
  locationIncorrect,
}
```

### Email Templates
Customize email templates in the Cloud Function:

```javascript
// functions/email_notification.js
function getCustomEmailTemplate(report) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Custom Report Notification</h2>
      <p>Report ID: ${report.id}</p>
      <!-- Your custom template -->
    </div>
  `;
}
```

## Security Considerations

1. **Input Validation**: All report data is validated before storage
2. **Authentication**: Only authenticated users can create reports
3. **Authorization**: Only admins can update report status
4. **Rate Limiting**: Implement rate limiting to prevent spam reports
5. **Data Sanitization**: User input is sanitized before storage and display
6. **Email Security**: Email credentials should be stored securely

## Troubleshooting

### Common Issues

#### 1. Emails Not Being Sent
- Check Firebase Functions logs: `firebase functions:log`
- Verify email configuration: `firebase functions:config:get`
- Test SMTP connection manually
- Check admin users collection has valid email addresses

#### 2. Reports Not Appearing in Admin Panel
- Verify Firestore security rules
- Check user authentication and role claims
- Verify report service is properly initialized

#### 3. Permission Errors
- Update Firestore security rules
- Verify user has correct role claims
- Check Firebase Auth custom claims

### Debug Commands
```bash
# View function logs
firebase functions:log --only sendReportNotification

# Test function locally
firebase functions:shell

# Check Firestore data
firebase firestore:data-export gs://your-bucket/reports

# Verify configuration
firebase functions:config:get
```

## Future Enhancements

### Planned Features
- [ ] Report templates for common issues
- [ ] Automated content moderation integration
- [ ] Report escalation workflows
- [ ] Advanced analytics dashboard
- [ ] Mobile push notifications
- [ ] Slack/Discord integration
- [ ] Report resolution SLA tracking
- [ ] Bulk actions for reports
- [ ] Report appeal system
- [ ] Machine learning for report classification

### API Extensions
- [ ] REST API for external integrations
- [ ] Webhook support for third-party tools
- [ ] GraphQL queries for advanced filtering
- [ ] Export functionality (CSV, JSON, PDF)

## Support

For questions or issues with the report system:
1. Check this documentation first
2. Review Firebase Functions logs
3. Test with the provided utility functions
4. Check Firestore console for data issues

## Changelog

### v1.0.0 (2025-01-01)
- ✅ Initial implementation
- ✅ Basic report functionality
- ✅ Email notifications
- ✅ Admin management UI
- ✅ Cloud Functions integration
- ✅ Documentation and examples