const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./path/to/your/service-account-key.json'); // You'll need to download this
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'admin-iiba-development-385505'
});

const db = admin.firestore();

async function addGlennAsAdmin() {
  try {
    const glennAdmin = {
      id: 'admin-glenn-001',
      email: 'glenn@iiba.co.jp',
      display_name: 'Glenn Torrens',
      role: 'admin',
      receive_report_notifications: true,
      notification_preferences: {
        spot: true,
        theme_map: true,
        event: true,
        user: true,
        content: true
      },
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.collection('admin_users').doc('admin-glenn-001').set(glennAdmin);
    console.log('✅ Glenn added as admin user successfully!');
    
    // Test the email function
    console.log('📧 Testing email to Glenn...');
    // This would call your deployed function
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addGlennAsAdmin();