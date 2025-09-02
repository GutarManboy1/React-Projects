const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import email notification functions
const emailNotification = require('./email_notification');
const testEmail = require('./test_email');

// Export functions
exports.sendReportNotification = emailNotification.sendReportNotification;
exports.sendReportStatusUpdate = emailNotification.sendReportStatusUpdate;
exports.testEmailToAdmins = testEmail.testEmailToAdmins;
exports.testEmailToAdminsHttp = testEmail.testEmailToAdminsHttp;