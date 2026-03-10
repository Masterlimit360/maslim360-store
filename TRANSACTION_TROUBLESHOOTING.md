# Transaction Issues & Troubleshooting Guide

## Problem: "No active channel to process transaction"

### What This Means
Paystack received your transaction request but the merchant account (your business account) doesn't have the payment channels properly configured or enabled.

### Root Cause
The Paystack API keys being used don't have active payment channels set up in the Paystack Dashboard.

### How to Fix

#### Step 1: Verify Paystack Dashboard Access
1. Go to https://dashboard.paystack.com
2. Login with your merchant account
3. Ensure you're in the correct business account (not a sub-account if not intended)

#### Step 2: Enable Payment Channels
1. **Navigate to Settings**
   - Click on your profile icon (top right)
   - Select **Settings**

2. **Find Payments Section**
   - Look for **Payments**, **Payment Methods**, or **Channels**
   - You should see a list of available channels

3. **Enable Required Channels**
   - **Card**: Required for card transactions
   - **Bank Transfer**: Required for bank transfers
   - **Mobile Money Ghana**: Required for mobile money (Vodafone Cash, MTN Mobile Money, AirtelTigo Money)

4. **Verify Account Status**
   - Ensure your account is **Active** and **Verified**
   - If your account is in **Sandbox/Test Mode**, some channels may be restricted
   - If your account is **Limited**, contact Paystack support

#### Step 3: Check Business Type
1. Go to **Settings** → **Business**
2. Verify your business type matches your actual business
3. Some channels are only available for certain business types

#### Step 4: Wait for Activation (if needed)
- First-time channel activation may take up to 24 hours
- Check your email for any activation steps
- Once activated, refresh the page

### How Our App Handles This

#### Frontend
- **Before checkout**: The app loads available payment channels from the backend
- **Only available methods are shown**: Disabled payment options won't appear
- **Clear error messages**: If a payment method fails, users see what went wrong
- **Payment status page**: Users can check transaction status with order ID

#### Backend
- **Channel validation**: `/payments/channels` endpoint checks which channels are available
- **Graceful fallback**: If Paystack fails, users get helpful error messages
- **Transaction tracking**: Orders are saved even if payment temporarily fails
- **Webhook verification**: Paystack payments are verified via webhooks

### Transaction Flow

```
User Selects Payment Method
        ↓
Backend Checks Available Channels
        ↓
Payment Method Enabled? → NO → Show Error & Available Options
        ↓ YES
Create Order (PENDING status)
        ↓
Initialize Paystack Transaction
        ↓
Paystack Return/Webhook
        ↓
Verify Payment & Update Order Status
```

---

## Common Error Messages & Solutions

### 1. "No active channel to process transaction"
**Cause**: Merchant account channels not configured
**Fix**: Follow "How to Fix" section above

### 2. "Invalid API Key" or "Unauthorized"
**Cause**: Paystack secret key is wrong or expired
**Solution**:
- Go to Paystack Dashboard → Settings → API Keys
- Copy the **Secret Key** (starts with `sk_`)
- Update in `.env` file: `PAYSTACK_SECRET_KEY=sk_...`
- Restart backend

### 3. "Merchant not found"
**Cause**: API key belongs to a different Paystack account
**Solution**: Verify you're using the correct API keys for your account

### 4. "Network error" or "Timeout"
**Cause**: Connection issue or Paystack API slow
**Solution**:
- Check internet connection
- Wait a few minutes and retry
- Contact Paystack if issue persists

### 5. "Invalid email" or "Invalid amount"
**Cause**: Order data validation failed
**Solution**: 
- Ensure customer email is valid
- Verify order total amount is > 0
- Check product prices are in Ghana cedis

---

## Testing Payment Methods

### Test Channels (Sandbox Mode)

If you're in test mode, use these test values:

#### Card Payments
- **Card Number**: 4084084084084081
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 123456

#### Mobile Money (Ghana)
- Test accounts may not be available in sandbox
- Switch to **Live Mode** to test actual mobile money
- Use your real phone number for testing

---

## Verifying Payment Success

### From Our App
1. Go to **Orders** page
2. Click on the order
3. Check **Payment Status**:
   - **COMPLETED** = Payment successful
   - **PENDING** = Still processing
   - **FAILED** = Payment rejected

### From Paystack Dashboard
1. Login to https://dashboard.paystack.com
2. Go to **Transactions**
3. Search by:
   - Transaction reference
   - Customer email
   - Amount

### Via Email
- Customer receives confirmation email
- Order confirmation sent to customer email
- Payment receipt sent by Paystack

---

## Transaction Webhook Setup (Important)

For real-time payment verification:

1. Go to Paystack Dashboard → **Settings** → **Webhooks**
2. Enter your webhook URL:
   ```
   https://yourdomain.com/api/payments/webhook/paystack
   ```
3. Select these events:
   - `charge.success` - When payment succeeds
   - `charge.failed` - When payment fails

4. Our app will automatically:
   - Verify the payment signature
   - Update order status to PROCESSING
   - Send confirmation emails

---

## Preventing Issues

### For Developers
1. **Always check available channels** before displaying payment options
2. **Handle network errors gracefully** with retry logic
3. **Log transaction details** for debugging
4. **Test with real Paystack account** before going live
5. **Monitor webhook delivery** in Paystack Dashboard

### For Business
1. **Keep API keys secure** - never share or commit to git
2. **Verify account status regularly** in Paystack Dashboard
3. **Test payment methods monthly** to catch issues early
4. **Monitor transaction reports** for patterns
5. **Keep payment contact updated** for support

---

## Support

If transactions continue to fail:

### 1. Check Our Checklist
- [ ] Paystack account is Active (not Limited/Suspended)
- [ ] API keys are correct and up-to-date
- [ ] Payment channels are Enabled
- [ ] Account is Verified (if required)
- [ ] No webhook errors in Paystack Dashboard

### 2. Contact Paystack Support
- **Website**: https://paystack.com
- **Support**: https://paystack.com/support
- **Email**: support@paystack.com
- **Status**: https://status.paystack.com

### 3. Contact Our Support
- **Email**: support@maslim360.com
- **Provide**: Order ID, Transaction Reference, Error Message, Screenshots

---

## Payment Method Availability

### Available Now
- ✅ Credit/Debit Card
- ✅ Paystack (with card & bank)
- ✅ Paystack Mobile Money (Ghana)

### Coming Soon
- 🔄 Direct Bank Transfers
- 🔄 PayPal
- 🔄 Apple Pay / Google Pay
- 🔄 Cryptocurrency

---

## Testing Checklist

- [ ] Create test account at paystack.com
- [ ] Get API keys
- [ ] Add keys to `.env`
- [ ] Restart backend
- [ ] Load checkout page
- [ ] Verify payment methods appear
- [ ] Click payment method
- [ ] Complete test transaction
- [ ] Check order status updates
- [ ] Verify webhook received

---

**Last Updated**: March 2026
**Version**: 1.0
