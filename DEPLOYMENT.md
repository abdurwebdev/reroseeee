# Rerose App Deployment Guide

This guide will help you deploy the Rerose app using Cloudinary for media storage and Google authentication for user login/registration, without requiring a paid MongoDB Atlas account.

---

## 1. Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Cloudinary account (for video/image storage)
- Google Cloud project (for OAuth login)
- GitHub account (for deployment to Vercel/Render/Netlify/other)

---

## 2. Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/).
2. Get your Cloud Name, API Key, and API Secret from the Cloudinary dashboard.
3. Add these to your `.env` files (both client and server as needed):
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. In your backend, use the Cloudinary Node.js SDK to upload videos/images. Store only the Cloudinary URLs in your database.

---

## 3. Google Authentication Only (No MongoDB Atlas)

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and set up OAuth 2.0 credentials.
3. Add your app's domain(s) to the OAuth consent screen and redirect URIs.
4. In your backend, use [passport-google-oauth20](https://www.npmjs.com/package/passport-google-oauth20) for Google login.
5. In your `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   ```
6. In your backend, **disable or remove** local email/password registration and login routes. Only allow Google login.
7. In your frontend, hide or remove the Register/Login forms and show only "Continue with Google".

---

## 3a. Disabling Email/Password Auth (Google-Only Login)

To enforce Google-only authentication and remove all local (email/password) auth:

### Frontend

- The Login and Register pages now only show a "Continue with Google" button. Email/password forms are removed.
- Users can only sign in or register with Google.

### Backend

- The `/api/auth/register` and `/api/auth/login` routes are commented out in `server/routes/auth.js`.
- Only Google OAuth routes are active.
- If you want to fully remove the code, you can also delete or comment out the `registerUser` and `loginUser` functions in `server/controllers/authController.js`.

### Notes

- If you have existing users with email/password, they will not be able to log in. Only Google accounts will work.
- For local development, ensure your Google OAuth callback URL is set to `http://localhost:5000/api/auth/google/callback` and your frontend uses the correct API URL.

---

## 4. Local Database (No Paid MongoDB Atlas)

- For demo/testing, you can use [MongoDB Community Server](https://www.mongodb.com/try/download/community) locally.
- For production, you can use [MongoDB Atlas Free Tier](https://www.mongodb.com/atlas/database) (500MB is free, but may have limitations).
- If you want a truly serverless/zero-db approach, you can use [Cloud Firestore](https://firebase.google.com/products/firestore) or [Supabase](https://supabase.com/) for user metadata, but this requires code changes.

---

## 5. Build and Deploy

### Build the Client

```sh
cd client
npm install
npm run build
```

### Prepare the Server

```sh
cd server
npm install
```

- Make sure your server serves the built client (e.g., with Express static middleware).

### Deploy

- **Vercel/Netlify**: Deploy the `client` as a static site. Deploy the `server` as an API (Vercel/Render/Heroku).
- **Render/Heroku**: Deploy the fullstack app. Set all environment variables in the dashboard.
- **Custom VPS**: Use PM2 or Docker to run your server. Serve the client from the server's static files.

---

## 6. Environment Variables Example

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
MONGODB_URI=mongodb://localhost:27017/rerose
VITE_API_URL=https://yourdomain.com
```

---

## 7. Final Checklist

- [ ] All uploads use Cloudinary.
- [ ] Only Google login is enabled (no email/password).
- [ ] All environment variables are set in production.
- [ ] The client is built and served in production.
- [ ] The server is deployed and running.
- [ ] The database is local or free-tier (or not required for demo).

---

## 8. Troubleshooting

- If you get MongoDB errors, use local MongoDB or switch to a free-tier cloud DB.
- If Google login fails, check your OAuth credentials and redirect URIs.
- For Cloudinary issues, check your API keys and usage limits.

---

## 9. Useful Links

- [Cloudinary Docs](https://cloudinary.com/documentation/node_integration)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [Vercel](https://vercel.com/), [Render](https://render.com/), [Netlify](https://netlify.com/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)

---

**Need help?** Open an issue on GitHub or contact the maintainer.
