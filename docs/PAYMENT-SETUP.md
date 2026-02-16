# Payment Setup (DocMind)

## Goal
Enable direct in-app payments without exposing receiver numbers in frontend.

## 1) Supabase Edge Functions
Functions used:
- `create-checkout` (Visa/Mastercard via configured card provider)
- `create-mobile-money-payment` (M-Pesa / eMola via backend gateway)

## 2) Required Supabase Secrets
Set in Supabase Project -> Edge Functions -> Secrets.

### Card provider (choose one via `CARD_PROVIDER`)
- `CARD_PROVIDER` = `dodo` | `flutterwave` | `paystack`

For Dodo:
- `DODO_CHECKOUT_STANDARD_URL`
- `DODO_CHECKOUT_PRO_URL`

For Flutterwave:
- `FLW_CHECKOUT_STANDARD_URL`
- `FLW_CHECKOUT_PRO_URL`

For Paystack:
- `PAYSTACK_CHECKOUT_STANDARD_URL`
- `PAYSTACK_CHECKOUT_PRO_URL`

### Mobile money gateway (M-Pesa/eMola)
- `MOBILE_MONEY_PROVIDER_BASE_URL`
- `MOBILE_MONEY_PROVIDER_API_KEY`
- `MOBILE_MONEY_MERCHANT_ID`

## 3) Deploy
Deploy/redeploy both functions after setting secrets.

## 4) Security
- Do NOT keep receiver phone in frontend code.
- Keep all payment credentials in Supabase secrets only.
