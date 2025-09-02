# Firebase Permissions Request Email

**Subject:** Request for Service Account User Role - Firebase Cloud Functions Deployment

---

**To:** [Project Owner/Admin]  
**From:** Glenn Torrens (glenn@iiba.co.jp)  
**Date:** September 1, 2025

## Request Summary

I need the **"Service Account User"** role to deploy Cloud Functions for the IIBA admin report system email notifications.

## Background

I'm implementing an email notification system for the IIBA admin panel that automatically sends alerts to admin team members when users submit reports about spots, theme maps, and events. This requires deploying Cloud Functions to handle email notifications.

## Required Permissions

I need the **"Service Account User"** role assigned to my account for the following Firebase projects:

### Primary Request (Staging Environment)
- **Project:** `iiba-staging`
- **Project ID:** `iiba-staging` 
- **IAM Console:** https://console.cloud.google.com/iam-admin/iam?project=iiba-staging
- **Role Needed:** Service Account User (`roles/iam.serviceAccountUser`)

### Secondary Request (Production Environment - if needed later)
- **Project:** `iiba-production`
- **Project ID:** `iiba-production`
- **IAM Console:** https://console.cloud.google.com/iam-admin/iam?project=iiba-production
- **Role Needed:** Service Account User (`roles/iam.serviceAccountUser`)

## Current Error

When attempting to deploy functions, I receive:
```
Error: Missing permissions required for functions deploy. You must have permission iam.serviceAccounts.ActAs on service account iiba-staging@appspot.gserviceaccount.com.
```

## What This Permission Allows

The Service Account User role allows me to:
- Deploy Cloud Functions for email notifications
- Act as the Firebase service account during deployments
- Does NOT grant admin access to other project resources

## Technical Details

**Functions Being Deployed:**
- `sendReportNotification` - Sends email alerts to admin team when reports are submitted
- `sendReportStatusUpdate` - Notifies users when report status changes
- `testEmailToAdmins` - Testing function for email system verification

**Email System Features:**
- Japanese-localized email templates
- Configurable SMTP settings
- Admin user management
- Report status tracking

## How to Grant Permission

1. Go to the IAM console link above
2. Find my account: `glenn@iiba.co.jp`
3. Click "Edit" (pencil icon)
4. Add role: **Service Account User**
5. Save changes

Alternatively, use gcloud CLI:
```bash
gcloud projects add-iam-policy-binding iiba-staging \
  --member="user:glenn@iiba.co.jp" \
  --role="roles/iam.serviceAccountUser"
```

## Timeline

This is needed to complete the admin report system implementation. Once permissions are granted, I can:
1. Deploy the email notification functions
2. Send test emails to admin team members
3. Complete end-to-end testing of the report system

## Questions?

Please let me know if you need any additional information or have concerns about granting this permission.

Thanks,  
Glenn Torrens  
glenn@iiba.co.jp

---

**Note:** This permission is specific to Cloud Functions deployment and does not grant broader admin access to the Firebase project.