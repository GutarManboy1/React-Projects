const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Test email function - sends test emails to all admin users
 * Can be called directly from Firebase Functions shell
 */
exports.testEmailToAdmins = functions.https.onCall(async (data, context) => {
  try {
    console.log('🧪 Starting email test to all admins...');
    
    // Get email configuration
    const config = functions.config();
    if (!config.email) {
      throw new Error('Email configuration not found. Please set email config with: firebase functions:config:set');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.email.host || 'smtp.gmail.com',
      port: parseInt(config.email.port || '587'),
      secure: config.email.secure === 'true',
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });

    // Get all admin users
    const adminSnapshot = await admin.firestore()
      .collection('admin_users')
      .where('status', '==', 'active')
      .where('receive_report_notifications', '==', true)
      .get();

    if (adminSnapshot.empty) {
      console.log('⚠️  No active admin users found');
      return {
        success: false,
        message: 'No active admin users found. Please create admin users first.',
        adminCount: 0
      };
    }

    const adminUsers = adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📧 Found ${adminUsers.length} admin users to email`);

    const results = [];

    // Send test email to each admin
    for (const admin of adminUsers) {
      try {
        const testEmailContent = {
          from: `"IIBA Admin System" <${config.email.user}>`,
          to: admin.email,
          subject: '🧪 IIBA通報システム - メールテスト',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">🧪 メールテスト</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">IIBA通報システム</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">こんにちは、${admin.display_name || admin.email}さん</h2>
                
                <p style="color: #666; line-height: 1.6;">
                  これはIIBA通報システムのメール通知機能のテストです。
                  このメールが正常に受信できていれば、システムは正常に動作しています。
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                  <h3 style="color: #28a745; margin-top: 0;">✅ テスト結果</h3>
                  <ul style="color: #666; margin: 0;">
                    <li>メール送信機能: 正常動作</li>
                    <li>管理者設定: 正常認識</li>
                    <li>通知設定: 有効</li>
                  </ul>
                </div>
                
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #1565c0; font-size: 14px;">
                    <strong>📊 管理者情報:</strong><br>
                    ID: ${admin.id}<br>
                    ロール: ${admin.role}<br>
                    ステータス: ${admin.status}<br>
                    通知設定: ${admin.receive_report_notifications ? '有効' : '無効'}
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://admin-iiba-development.web.app/admin-setup" 
                     style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    管理画面に戻る
                  </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                  このメールはIIBA管理システムから自動送信されました。<br>
                  テスト日時: ${new Date().toLocaleString('ja-JP', {
                    timeZone: 'Asia/Tokyo',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} (JST)
                </p>
              </div>
            </div>
          `,
          text: `
            IIBA通報システム - メールテスト
            
            こんにちは、${admin.display_name || admin.email}さん
            
            これはIIBA通報システムのメール通知機能のテストです。
            このメールが正常に受信できていれば、システムは正常に動作しています。
            
            管理者情報:
            - ID: ${admin.id}
            - ロール: ${admin.role}
            - ステータス: ${admin.status}
            - 通知設定: ${admin.receive_report_notifications ? '有効' : '無効'}
            
            テスト日時: ${new Date().toLocaleString('ja-JP', {
              timeZone: 'Asia/Tokyo',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })} (JST)
            
            管理画面: https://admin-iiba-development.web.app/admin-setup
          `
        };

        await transporter.sendMail(testEmailContent);
        
        results.push({
          email: admin.email,
          success: true,
          message: 'Test email sent successfully'
        });

        console.log(`✅ Test email sent to: ${admin.email}`);
        
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${admin.email}:`, emailError);
        results.push({
          email: admin.email,
          success: false,
          message: emailError.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`📊 Email test completed: ${successCount} success, ${failCount} failed`);

    return {
      success: successCount > 0,
      message: `Email test completed: ${successCount} success, ${failCount} failed`,
      adminCount: adminUsers.length,
      results: results,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Email test failed:', error);
    return {
      success: false,
      message: `Email test failed: ${error.message}`,
      adminCount: 0,
      error: error.message
    };
  }
});

/**
 * HTTP version for direct testing
 */
exports.testEmailToAdminsHttp = functions.https.onRequest(async (req, res) => {
  try {
    const result = await exports.testEmailToAdmins.run({}, { auth: null });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});