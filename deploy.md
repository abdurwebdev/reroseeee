# Deployment Guide for Rerose Application

## Current Deployment URLs
- **Frontend**: https://rerosesssss-b61w.vercel.app/
- **Backend**: https://rerosesssss-ma8u.vercel.app/

## Prerequisites
1. Vercel CLI installed: `npm i -g vercel`
2. Git repository connected to Vercel
3. Environment variables configured in Vercel dashboard

## Step-by-Step Deployment Process

### 1. Backend Deployment

#### Environment Variables to Set in Vercel Dashboard
Go to your backend project settings in Vercel and add these environment variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=production
```

#### Deploy Backend
```bash
cd server
vercel --prod
```

### 2. Frontend Deployment

#### Environment Variables to Set in Vercel Dashboard
Go to your frontend project settings in Vercel and add these environment variables:

```
VITE_API_URL=https://rerosesssss-ma8u.vercel.app
VITE_GOOGLE_CLIENT_ID=541034026608-1i8js1r3m6ecan9ij0alegd4tmubmk8f.apps.googleusercontent.com
VITE_NODE_ENV=production
VITE_APP_NAME=Rerose
VITE_APP_VERSION=1.0.0
VITE_SOCKET_URL=https://rerosesssss-ma8u.vercel.app
```

#### Deploy Frontend
```bash
cd client
npm run build
vercel --prod
```

### 3. Verification Steps

1. **Test Backend API**: Visit https://rerosesssss-ma8u.vercel.app/
2. **Test Frontend**: Visit https://rerosesssss-b61w.vercel.app/
3. **Test API Connection**: Check browser network tab for successful API calls
4. **Test Authentication**: Try Google OAuth login
5. **Test Real-time Features**: Check if Socket.io connections work

### 4. Common Issues and Solutions

#### CORS Issues
- Ensure frontend URL is added to CORS origins in server.js
- Check that credentials are properly configured

#### Environment Variables
- Verify all environment variables are set in Vercel dashboard
- Check that variable names match exactly (case-sensitive)

#### Build Issues
- Clear node_modules and reinstall dependencies
- Check for any missing dependencies in package.json

### 5. Monitoring and Logs

- Check Vercel function logs for backend issues
- Use browser developer tools for frontend debugging
- Monitor API response times and errors

## Quick Redeploy Commands

### Backend Only
```bash
cd server && vercel --prod
```

### Frontend Only
```bash
cd client && npm run build && vercel --prod
```

### Both (Full Deployment)
```bash
# Backend
cd server && vercel --prod

# Frontend
cd ../client && npm run build && vercel --prod
```
