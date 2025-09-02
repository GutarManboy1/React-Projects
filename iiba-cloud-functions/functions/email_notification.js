const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Configure email transporter (using Gmail SMTP as example)
// In production, use your actual email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user, // Set via: firebase functions:config:set email.user="your-email@gmail.com"
    pass: functions.config().email.password, // Set via: firebase functions:config:set email.password="your-app-password"
  },
});

/**
 * Cloud Function to send report notification emails to admin team
 */
exports.sendReportNotification = functions
  .region('asia-northeast1')
  .https.onCall(async (data, context) => {
    try {
      console.log('Sending report notification email', data);

      // Validate required data
      if (!data.reportId || !data.adminEmails || !Array.isArray(data.adminEmails)) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required data');
      }

      const {
        reportId,
        reportType,
        reportReason,
        reportedItemId,
        reportedItemName,
        reporterUserName,
        description,
        priority,
        createdAt,
        adminEmails,
        adminAdminUrl,
      } = data;

      // Format email content
      const subject = `[IIBA Admin] 新しい通報: ${formatReportType(reportType)} - ${reportedItemName}`;
      
      const htmlContent = `
        <html>
        <head>
          <meta charset="UTF-8">
          <title>新しい通報通知</title>
          <style>
            body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
            .priority-high { border-left: 4px solid #dc3545; padding-left: 12px; }
            .priority-medium { border-left: 4px solid #ffc107; padding-left: 12px; }
            .priority-low { border-left: 4px solid #28a745; padding-left: 12px; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #495057; }
            .value { margin-left: 10px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #007bff; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 20px 0; 
            }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🚨 新しい通報が届きました</h2>
              <p>IIBA アプリで新しい通報が作成されました。確認をお願いします。</p>
            </div>
            
            <div class="content ${getPriorityClass(priority)}">
              <div class="info-row">
                <span class="label">通報ID:</span>
                <span class="value">${reportId}</span>
              </div>
              
              <div class="info-row">
                <span class="label">通報タイプ:</span>
                <span class="value">${formatReportType(reportType)}</span>
              </div>
              
              <div class="info-row">
                <span class="label">通報理由:</span>
                <span class="value">${formatReportReason(reportReason)}</span>
              </div>
              
              <div class="info-row">
                <span class="label">対象:</span>
                <span class="value">${reportedItemName} (ID: ${reportedItemId})</span>
              </div>
              
              <div class="info-row">
                <span class="label">通報者:</span>
                <span class="value">${reporterUserName || '匿名'}</span>
              </div>
              
              <div class="info-row">
                <span class="label">優先度:</span>
                <span class="value">${getPriorityText(priority)} (${priority}/5)</span>
              </div>
              
              <div class="info-row">
                <span class="label">作成日時:</span>
                <span class="value">${formatDateTime(createdAt)}</span>
              </div>
              
              ${description ? `
              <div class="info-row">
                <span class="label">詳細:</span>
                <div class="value" style="margin-top: 8px; padding: 12px; background-color: #f8f9fa; border-radius: 4px;">
                  ${description}
                </div>
              </div>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="${adminAdminUrl}" class="button">管理画面で確認する</a>
              </div>
            </div>
            
            <div class="footer">
              <p>このメールは自動送信されています。</p>
              <p>IIBA Admin System</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email to all admin users
      const emailPromises = adminEmails.map(email => {
        return transporter.sendMail({
          from: functions.config().email.user,
          to: email,
          subject: subject,
          html: htmlContent,
        });
      });

      await Promise.all(emailPromises);

      console.log(`Report notification email sent to ${adminEmails.length} admins for report ${reportId}`);
      
      return {
        success: true,
        message: `Email sent to ${adminEmails.length} admin(s)`,
      };
      
    } catch (error) {
      console.error('Error sending report notification email:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send email', error);
    }
  });

/**
 * Cloud Function to send report status update emails to reporters
 */
exports.sendReportStatusUpdate = functions
  .region('asia-northeast1')
  .https.onCall(async (data, context) => {
    try {
      console.log('Sending report status update email', data);

      const {
        reportId,
        reportType,
        status,
        reportedItemName,
        adminResponse,
        resolvedAt,
        reporterEmail,
      } = data;

      if (!reportId || !reporterEmail) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required data');
      }

      const subject = `[IIBA] 通報ステータス更新: ${reportedItemName}`;
      
      const htmlContent = `
        <html>
        <head>
          <meta charset="UTF-8">
          <title>通報ステータス更新</title>
          <style>
            body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
            .status-resolved { border-left: 4px solid #28a745; padding-left: 12px; }
            .status-dismissed { border-left: 4px solid #6c757d; padding-left: 12px; }
            .status-action { border-left: 4px solid #dc3545; padding-left: 12px; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #495057; }
            .value { margin-left: 10px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📋 通報ステータスが更新されました</h2>
              <p>あなたが提出した通報について、ステータスが更新されました。</p>
            </div>
            
            <div class="content ${getStatusClass(status)}">
              <div class="info-row">
                <span class="label">通報ID:</span>
                <span class="value">${reportId}</span>
              </div>
              
              <div class="info-row">
                <span class="label">対象:</span>
                <span class="value">${reportedItemName}</span>
              </div>
              
              <div class="info-row">
                <span class="label">新しいステータス:</span>
                <span class="value">${formatStatus(status)}</span>
              </div>
              
              ${resolvedAt ? `
              <div class="info-row">
                <span class="label">解決日時:</span>
                <span class="value">${formatDateTime(resolvedAt)}</span>
              </div>
              ` : ''}
              
              ${adminResponse ? `
              <div class="info-row">
                <span class="label">管理者からの回答:</span>
                <div class="value" style="margin-top: 8px; padding: 12px; background-color: #f8f9fa; border-radius: 4px;">
                  ${adminResponse}
                </div>
              </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>ご報告いただき、ありがとうございました。</p>
              <p>今後ともIIBAをよろしくお願いいたします。</p>
              <p>IIBA Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: functions.config().email.user,
        to: reporterEmail,
        subject: subject,
        html: htmlContent,
      });

      console.log(`Status update email sent to ${reporterEmail} for report ${reportId}`);
      
      return {
        success: true,
        message: 'Status update email sent successfully',
      };
      
    } catch (error) {
      console.error('Error sending status update email:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send email', error);
    }
  });

// Helper functions
function formatReportType(type) {
  const types = {
    'spot': 'スポット',
    'theme_map': 'テーママップ',
    'event': 'イベント',
    'user': 'ユーザー',
    'content': 'コンテンツ',
  };
  return types[type] || type;
}

function formatReportReason(reason) {
  const reasons = {
    'inappropriate_content': '不適切なコンテンツ',
    'spam': 'スパム',
    'harassment': 'ハラスメント',
    'false_information': '虚偽情報',
    'intellectual_property': '知的財産権侵害',
    'privacy_violation': 'プライバシー侵害',
    'safety_concerns': '安全性の懸念',
    'other': 'その他',
  };
  return reasons[reason] || reason;
}

function formatStatus(status) {
  const statuses = {
    'pending': '確認待ち',
    'reviewing': '確認中',
    'resolved': '解決済み',
    'dismissed': '却下',
    'action_taken': '対応完了',
  };
  return statuses[status] || status;
}

function getPriorityClass(priority) {
  if (priority >= 4) return 'priority-high';
  if (priority >= 3) return 'priority-medium';
  return 'priority-low';
}

function getPriorityText(priority) {
  if (priority >= 4) return '高';
  if (priority >= 3) return '中';
  return '低';
}

function getStatusClass(status) {
  if (status === 'resolved') return 'status-resolved';
  if (status === 'dismissed') return 'status-dismissed';
  if (status === 'action_taken') return 'status-action';
  return '';
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP');
}