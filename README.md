# Plate40 Frontend

Enterprise Turborepo containing the customer application and the shared Admin/Merchant dashboard.

## Start locally

1. Copy `.env.example` to `.env.local` in both app folders.
2. Start the NestJS `auth-api` on port 4001 and `main-api` on port 4002.
3. Run `npm install`.
4. Run `npm run dev` to start Customer Web on port 3000 and Dashboard Web on port 3001.

Online payment intentionally redirects to `NEXT_PUBLIC_TEST_PAYMENT_URL`. Razorpay is not loaded by
the frontend and can be integrated later without changing checkout state ownership.
