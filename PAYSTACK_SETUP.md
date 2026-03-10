# Paystack Integration Setup Guide

## Current Status
❌ **Paystack keys are corrupted with `\n` escape characters**
- Your `.env` file has: `\nPAYSTACK_SECRET_KEY=sk_live_...`
- Should be: `PAYSTACK_SECRET_KEY=sk_live_...`

> 💱 **Currency**: the application now uses **Ghana Cedis (GHS)** for all pricing. Make sure your product prices are entered in GHS and any amounts passed to payment APIs are in cedi units (the Paystack SDK will convert to kobo automatically.
> 
> 🚀 **Mobile money**: choose `paymentMethod: 'paystack_mobile'` when calling `/payments/intents` if you only want the mobile‑money channel. The regular `paystack` method includes card and bank options, which triggers the bank‑details form on the Paystack page.

## Step 1: Create Paystack Account

1. Go to https://dashboard.paystack.com/#/signup
2. Sign up with your email
3. Verify your email
4. Complete your business profile:
   - Business name
   - Business type
   - Website/App name
   - Phone number

## Step 2: Get Your API Keys

### For Testing (Recommended for Development)

1. Login to https://dashboard.paystack.com
2. Go to **Settings** → **API Keys & Webhooks**
3. You'll see two tabs: **Live** and **Test**
4. Click the **Test** tab
5. Copy both keys:
   - **Secret Key**: Starts with `sk_test_...`
   - **Public Key**: Starts with `pk_test_...`

Example:
```
Test Secret Key: sk_test_51a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6
Test Public Key: pk_test_a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p
```

### For Production (When You Go Live)

1. Login to https://dashboard.paystack.com
2. Go to **Settings** → **API Keys & Webhooks**
3. Click the **Live** tab
4. Verify your bank account (required for live keys)
5. Copy both keys:
   - **Secret Key**: Starts with `sk_live_...`
   - **Public Key**: Starts with `pk_live_...`

## Step 3: Update Your Environment Variables

### Backend Configuration

Edit `apps/backend/.env` and update these lines:

**For Development (Testing):**
```env
# Paystack (Testing)
PAYSTACK_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_test_YOUR_TEST_PUBLIC_KEY_HERE
```

**For Production (Live):**
```env
# Paystack (Production)
PAYSTACK_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY_HERE
```

### Frontend Configuration

Edit `apps/frontend/.env.local` and add:

```env
# Paystack (optional - only if you use it on frontend)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE
```

## Step 4: Test Paystack Integration

### Using the Swagger API Documentation

1. Start your backend:
   ```bash
   cd apps/backend
   pnpm dev
   ```

2. Go to http://localhost:4000/api/docs

3. Find the **Payments** section and click **POST /payments/intents**

4. Click "Try it out" and fill in:
   ```json
   {
     "orderId": "your-existing-order-id",
     "paymentMethod": "paystack",
     "currency": "GHS"
   }
   ```

5. Click "Execute"

6. If successful, you'll get a response with `authorizationUrl` - open that link to test payment

### Test Card Details (For Testing Environment)

Use these test card numbers in Paystack's test environment:

| Type | Card Number | Expiry | CVV |
|------|-------------|--------|-----|
| Verve | 5061020000000000 | 12/25 | 123 |
| Visa | 4111111111111111 | 12/25 | 123 |
| Mastercard | 5555555555554444 | 12/25 | 123 |

Any valid future expiry date and any 3-digit CVV will work in test mode.

## Step 5: Configure Paystack Webhook (Important)

### Add Webhook URL to Paystack Dashboard

1. Login to https://dashboard.paystack.com
2. Go to **Settings** → **API Keys & Webhooks**
3. Scroll to **Webhooks**
4. Click **Add Webhook**
5. Enter your webhook URL:
   ```
   https://your-backend-url.com/api/payments/webhook
   ```
   
   For local development:
   ```
   http://localhost:4000/api/payments/webhook
   ```

6. Select events to listen to:
   - ✅ charge.success
   - ✅ charge.failed
   - ✅ transfer.success
   - ✅ transfer.failed

7. Click **Add Webhook**

8. Copy the webhook secret and add to `.env`:
   ```env
   PAYSTACK_WEBHOOK_SECRET=whsec_xxxx...
   ```

## Backend Implementation Check

Your backend already has Paystack integration at:
- **Payment Service**: `apps/backend/src/payments/payments.service.ts`
- **Payment Controller**: `apps/backend/src/payments/payments.controller.ts`

The code handles:
✅ Payment initialization
✅ Paystack API communication
✅ Transaction reference generation
✅ Database payment record creation
✅ Email customer notification

## Frontend Integration (Checkout Flow)

The checkout process should:
1. Create an order in your database
2. Call `/api/payments/intents` with `paymentMethod: 'paystack'` for card/bank, or `'paystack_mobile'` if you want **mobile money only (Ghana)**.
  * The backend will restrict Paystack to the requested channel; without `'paystack_mobile'` users can still choose bank/card, which is why you were seeing the bank fields.
3. Redirect user to the `authorizationUrl` returned
4. User completes payment on Paystack
5. Paystack redirects back to `FRONTEND_URL/paystack-return`
6. Webhook notifies backend of payment status

## Troubleshooting

### Error: "Paystack is not configured"
- ✅ Check that `PAYSTACK_SECRET_KEY` is set in `.env`
- ✅ Make sure there are no `\n` escape characters
- ✅ Restart the backend after updating `.env`

### Error: "Failed to initialize Paystack transaction"
- Check that your secret key is correct
- Verify you're using `sk_test_` or `sk_live_` (not public key)
- Check your Paystack account is active
- Verify internet connection to api.paystack.co

### Payment Not Confirming
- Check webhook is configured correctly
- Verify webhook secret matches `PAYSTACK_WEBHOOK_SECRET`
- Check backend logs for webhook errors
- Test webhook delivery in Paystack dashboard

### Test Payment Not Working
- Ensure you're in **Test** tab, not **Live**
- Use test card numbers from the table above
- Check `FRONTEND_URL` is correct (for redirect)

## Environment Variables Reference

```env
# Required for Paystack
PAYSTACK_SECRET_KEY=sk_test_... or sk_live_...

# Optional but recommended
PAYSTACK_PUBLIC_KEY=pk_test_... or pk_live_...

# Required for payment processing
FRONTEND_URL=http://localhost:3000  # For dev, your domain for prod

# Recommended for webhooks
PAYSTACK_WEBHOOK_SECRET=whsec_...  # From Paystack dashboard
```

## Security Notes

⚠️ **IMPORTANT**
- Never commit real API keys to git
- Keep `PAYSTACK_SECRET_KEY` secret - only use on backend
- `PAYSTACK_PUBLIC_KEY` can be exposed on frontend
- Rotate keys if compromised
- Use different keys for test/production environments

## Next Steps

1. ✅ Go to Paystack and create account
2. ✅ Copy test API keys
3. ✅ Fix the `.env` file (remove `\n` characters)
4. ✅ Add keys to `apps/backend/.env`
5. ✅ Restart backend
6. ✅ Test using Swagger API docs
7. ✅ Configure webhook (optional for development, required for production)

---

**Need help?** Check your browser console and backend logs for detailed error messages when testing payments.
