# ProJenius 3D API

This API powers the admin and storefront. Configure `.env` from `.env.example`, then run `npm install` and `npm run dev`.

## Setup
1. Install Node.js 20+.
2. Create a MongoDB Atlas cluster and database user. Copy the Node.js connection string into `MONGODB_URI`, replacing the placeholders and URL-encoding special characters in the password.
3. Generate `JWT_SECRET` with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
4. Generate an admin password hash: run `node -e "const b=require('bcryptjs'); console.log(b.hashSync('YOUR-STRONG-PASSWORD',12))"` after `npm install`; put the output in `ADMIN_PASSWORD_HASH`. Set `ADMIN_EMAIL` to the admin login email.
5. For Gmail, enable 2-Step Verification and create a Google App Password. Put the email in `SMTP_USER`, the 16-character App Password in `SMTP_PASS`, and set `ADMIN_NOTIFICATION_EMAIL`.
6. Add both frontend origins to `CORS_ORIGINS`. For deployment use the real HTTPS origins.
7. In each frontend `.env`, set `VITE_API_BASE_URL=http://localhost:5000/api` (or your deployed API base).

Images are stored in local `uploads/` for development. For production configure Cloudinary variables so image uploads are durable across deploys. Never commit `.env` or expose SMTP credentials, MongoDB credentials, JWT secrets or Cloudinary API secrets in frontend code.

## Notes
- Product create/edit/delete, order creation, enquiry submission, notification persistence, and email notifications are implemented.
- Order emails are sent only when SMTP is configured. Email sending failures are logged; the order itself remains saved.
- Admin authentication uses a JWT bearer token. Ensure the admin frontend saves the token and sends `Authorization: Bearer <token>` on protected requests.
- New order/product/enquiry notifications are persisted in MongoDB and admin email is attempted.
