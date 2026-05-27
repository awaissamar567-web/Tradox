import { Handler } from '@netlify/functions';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import crypto from 'crypto';

// Initialize Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Simple check to make sure firebase is configured
const isFirebaseEnvValid = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_api_key_here' && 
  firebaseConfig.apiKey.trim() !== '';

const handler: Handler = async (event, context) => {
  // We only accept POST requests for the webhook
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const signatureHeader = event.headers['webhook-signature'] || event.headers['Webhook-Signature'] || event.headers['x-whop-signature'];
  const timestampHeader = event.headers['webhook-timestamp'] || event.headers['Webhook-Timestamp'];
  const idHeader = event.headers['webhook-id'] || event.headers['Webhook-Id'];
  const bodyText = event.body || '';

  console.log('📦 WHOP WEBHOOK RECEIVED:', {
    hasSignature: !!signatureHeader,
    timestamp: timestampHeader,
    id: idHeader,
  });

  // Verify Whop Signature if WHOP_WEBHOOK_SECRET is set in environment variables
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
  if (webhookSecret) {
    if (!signatureHeader) {
      console.error('❌ Missing webhook signature header');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing signature' }),
      };
    }

    try {
      let isVerified = false;

      // Method 1: Standard Webhooks Specification (webhook-signature, webhook-id, webhook-timestamp)
      if (timestampHeader && idHeader) {
        const toSign = `${idHeader}.${timestampHeader}.${bodyText}`;
        // Standard Webhooks secret is base64 encoded and prefixed with "whsec_"
        const cleanSecret = webhookSecret.replace('whsec_', '');
        const secretBuffer = Buffer.from(cleanSecret, 'base64');
        
        const hmac = crypto.createHmac('sha256', secretBuffer);
        const digest = hmac.update(toSign).digest('base64');

        // Whop webhook signatures can be comma-separated list of "v1,signature"
        const signatures = signatureHeader.split(' ');
        for (const sig of signatures) {
          const parts = sig.split(',');
          if (parts[0] === 'v1' && parts[1] === digest) {
            isVerified = true;
            break;
          }
        }
      }

      // Method 2: Standard Webhooks using raw secret string (non-base64)
      if (!isVerified && timestampHeader && idHeader) {
        const toSign = `${idHeader}.${timestampHeader}.${bodyText}`;
        const cleanSecret = webhookSecret.replace('whsec_', '');
        const hmac = crypto.createHmac('sha256', cleanSecret);
        const digest = hmac.update(toSign).digest('base64');

        const signatures = signatureHeader.split(' ');
        for (const sig of signatures) {
          const parts = sig.split(',');
          if (parts[0] === 'v1' && parts[1] === digest) {
            isVerified = true;
            break;
          }
        }
      }

      // Method 3: Standard Webhooks using raw webhookSecret string directly
      if (!isVerified && timestampHeader && idHeader) {
        const toSign = `${idHeader}.${timestampHeader}.${bodyText}`;
        const hmac = crypto.createHmac('sha256', webhookSecret);
        const digest = hmac.update(toSign).digest('base64');

        const signatures = signatureHeader.split(' ');
        for (const sig of signatures) {
          const parts = sig.split(',');
          if (parts[0] === 'v1' && parts[1] === digest) {
            isVerified = true;
            break;
          }
        }
      }

      // Method 4: Legacy/Simple Hex HMAC-SHA256 of the raw body
      if (!isVerified) {
        const hmacHex = crypto.createHmac('sha256', webhookSecret);
        const digestHex = hmacHex.update(bodyText).digest('hex');
        if (signatureHeader === digestHex) {
          isVerified = true;
        }
      }

      if (!isVerified) {
        console.error('❌ Signature verification failed');
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Signature verification failed' }),
        };
      }
      console.log('✅ Signature successfully verified');
    } catch (err: any) {
      console.error('⚠️ Error during signature verification:', err.message);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Signature verification error' }),
      };
    }
  } else {
    console.warn('⚠️ WHOP_WEBHOOK_SECRET not configured. Signature verification skipped for debugging.');
  }

  // Parse webhook payload
  let payload: any;
  try {
    payload = JSON.parse(bodyText);
  } catch (err) {
    console.error('❌ Failed to parse webhook payload body as JSON');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const eventType = payload.type || payload.action;
  const objectData = payload.data?.object || payload.data || {};
  const email = (objectData.email || objectData.user?.email || payload.email || '') as string;

  if (!email) {
    console.error('❌ Email not found in payload structure:', JSON.stringify(payload));
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email address not found in payload' }),
    };
  }

  const targetEmail = email.toLowerCase().trim();
  console.log(`🔍 Processing Event "${eventType}" for email: ${targetEmail}`);

  // Determine target plan and payment plan type
  let newPlan: 'free' | 'pro' = 'free';
  const isActivation = [
    'membership.activated',
    'membership.went_active',
    'membership.went_valid',
    'payment.succeeded',
    'payment.created'
  ].includes(eventType);

  const isDeactivation = [
    'membership.deactivated',
    'membership.went_inactive',
    'membership.went_invalid',
    'membership.cancelled',
    'membership.expired'
  ].includes(eventType);

  const planId = (payload.data?.plan?.id || payload.plan?.id || '') as string;
  let paymentPlanType: 'monthly' | 'lifetime' | null = null;
  if (planId === 'plan_ADVvcySYlxcIR') {
    paymentPlanType = 'monthly';
  } else if (planId === 'plan_AOaJ2eJfVa30Z') {
    paymentPlanType = 'lifetime';
  }

  if (isActivation) {
    newPlan = 'pro';
  } else if (isDeactivation) {
    newPlan = 'free';
  } else {
    // If it's a webhook event we don't care about, return 200 immediately
    console.log(`ℹ️ Event "${eventType}" is not a plan toggle event. Acknowledging with 200.`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Event acknowledged' }),
    };
  }

  // Update Firestore if configured
  if (isFirebaseEnvValid) {
    try {
      console.log(`⚡ Updating Firestore database user plan to "${newPlan}"...`);
      const firebaseApp = initializeApp(firebaseConfig);
      const db = getFirestore(firebaseApp);

      // Query root users collection by email field
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', targetEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.warn(`⚠️ User with email "${targetEmail}" not found in Firestore root users collection.`);
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'User not found in database' }),
        };
      }

      // Update plan settings in users/{uid}/profile/config
      let updateCount = 0;
      for (const userDoc of querySnapshot.docs) {
        const uid = userDoc.id;
        const profileConfigRef = doc(db, 'users', uid, 'profile', 'config');
        
        const updateData: any = { userPlan: newPlan };
        if (newPlan === 'free') {
          updateData.paymentPlanType = null;
        } else if (paymentPlanType) {
          updateData.paymentPlanType = paymentPlanType;
        }
        
        await setDoc(profileConfigRef, updateData, { merge: true });
        console.log(`✅ Successfully updated user "${uid}" plan to "${newPlan}" (${paymentPlanType || 'unknown'})`);
        updateCount++;
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Successfully updated ${updateCount} user profile(s) to ${newPlan}` }),
      };
    } catch (dbErr: any) {
      console.error('❌ Firestore Database error updating plan:', dbErr.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database update failed' }),
      };
    }
  } else {
    console.warn('📦 Running in LOCAL MOCK MODE: Webhook database connection skipped.');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Mock Mode: Webhook processed successfully',
        simulatedUpdate: { email: targetEmail, newPlan },
      }),
    };
  }
};

export { handler };
