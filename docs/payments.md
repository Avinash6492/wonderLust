# Future payment integration

The current checkout flow only creates a reservation request with `awaiting_payment` status. It shows an INR estimate, sends a clearly labeled request email when Resend is configured, and redirects to a payment placeholder. It does not charge cards, confirm availability, or create a confirmed booking.

Payment credentials are not used by the application yet. The following environment variables are reserved for a later integration and are available in the Render Blueprint:

- `PAYMENT_PROVIDER` (currently `none`)
- `PAYMENT_PUBLIC_KEY`
- `PAYMENT_SECRET_KEY`
- `PAYMENT_WEBHOOK_SECRET`

When enabling payments, create the merchant account and payout details directly with the payment provider. Put API keys and webhook secrets in Render’s Environment settings (and local `.env` for development), never in source control or browser code. Then implement server-created checkout sessions, signed webhook verification, idempotent payment updates, booking availability checks, refunds/cancellation rules, and receipt emails before marking reservations paid or confirmed.

Do not treat setting these variables alone as enabling payments. The payment button intentionally remains disabled until that server-side work is completed.
