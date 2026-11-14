PAYSTACK PAYOUTS, WEBHOOK, AND WALLET
=====================================

1. SCHEMA (manual)
   Follow prisma/SCHEMA-ADDITIONS.txt. Four additions, then:

     npx prisma validate
     npx prisma generate
     npm run prisma:migrate      (name it: add_paystack_payouts)

2. ENVIRONMENT VARIABLES
   Add to .env (and to Vercel for the live site):

     PAYSTACK_SECRET_KEY="sk_test_..."     (test key first; sk_live_... later)

   Get the key from the Paystack dashboard under Settings -> API Keys & Webhooks.

3. UNZIP
   From the project folder:

     unzip -o paystack-changes.zip

   Files added or replaced:
     src/lib/paystack.ts                                   (new)
     src/lib/tipPayments.ts                                (new)
     src/app/api/tips/route.ts                             (replaced)
     src/app/api/tips/callback/route.ts                    (replaced)
     src/app/api/tips/webhook/route.ts                     (new)
     src/app/api/admin/payment-eligibility-requests/[id]/route.ts  (replaced)
     src/app/payment-eligibility/page.tsx                  (replaced)
     src/app/wallet/page.tsx                               (new)

4. PAYSTACK WEBHOOK (manual, in the Paystack dashboard)
   Settings -> API Keys & Webhooks -> Webhook URL:

     https://storyspace-jet.vercel.app/api/tips/webhook

   For local testing, the webhook can't reach localhost. Use the redirect
   flow locally, and test the webhook on the live site.

5. TEST (in this order)
   a. Approve a creator. The admin approval checks the account name against
      the applicant's name, then creates the subaccount. The terminal shows
      the result. A name mismatch returns an error with the bank's name.
   b. Send a N100 tip with a Paystack test card. Note the platform's share
      and the creator's share in the Paystack dashboard.
   c. Open /wallet as the creator. The tip should appear as earned.
   d. Reload the callback page. The earning must not appear twice.

6. PUSH
   git add .
   git commit -m "Paystack payouts: 30% platform share, webhook, earnings, wallet"
   git push

NOTE ON THE SPLIT
-----------------
The transaction_charge field is the platform's flat share of each payment.
Paystack's documentation is not fully consistent on which side it applies to.
Confirm the split with the first test tip before going live, as before.
