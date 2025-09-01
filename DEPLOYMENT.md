# Think-Events Deployment Guide

## Overview
This guide will help you deploy Think-Events to Vercel. The project consists of:
- **Frontend**: React + Vite + TypeScript (deployed to Vercel)
- **Backend**: Express.js API (deployed to Vercel as serverless functions)
- **Database**: Neon PostgreSQL (cloud-hosted)

## Prerequisites
1. [Vercel Account](https://vercel.com)
2. [Neon Database](https://neon.tech) (already configured)
3. [GitHub Account](https://github.com)

## Step 1: Prepare Your Database

### 1.1 Verify Neon Database
- Ensure your Neon database is running and accessible
- Note down your `DATABASE_URL` from Neon dashboard
- Test the connection locally first

### 1.2 Run Database Migrations
```bash
cd backend
npm install
npm run migrate
npm run seed
```

## Step 2: Deploy Backend to Vercel

### 2.1 Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Deploy Backend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### 2.3 Set Environment Variables
In Vercel dashboard, go to your backend project → Settings → Environment Variables:

```
DATABASE_URL=your-neon-database-url
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2.4 Deploy
Click "Deploy" and wait for the build to complete.

## Step 3: Deploy Frontend to Vercel

### 3.1 Create New Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import the same GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.2 Set Environment Variables
In Vercel dashboard, go to your frontend project → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-domain.vercel.app
VITE_APP_NAME=Think-Events
VITE_APP_VERSION=1.0.0
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3.3 Deploy
Click "Deploy" and wait for the build to complete.

## Step 4: Update CORS Configuration

### 4.1 Update Backend CORS
After getting your frontend URL, update the backend environment variable:
```
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 4.2 Redeploy Backend
Trigger a new deployment in Vercel dashboard.

## Step 5: Test Your Deployment

### 5.1 Health Check
Visit: `https://your-backend-domain.vercel.app/health`

### 5.2 Frontend Test
Visit your frontend URL and test:
- User registration/login
- Event browsing
- Booking functionality

## Step 6: Configure Custom Domains (Optional)

### 6.1 Backend Domain
1. Go to Vercel dashboard → Your backend project
2. Settings → Domains
3. Add your custom domain (e.g., `api.yourapp.com`)

### 6.2 Frontend Domain
1. Go to Vercel dashboard → Your frontend project
2. Settings → Domains
3. Add your custom domain (e.g., `yourapp.com`)

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check if Neon database is accessible
- Ensure SSL configuration is correct

#### 2. CORS Errors
- Verify `FRONTEND_URL` matches your actual frontend domain
- Check that the URL includes `https://`

#### 3. Build Errors
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

#### 4. Environment Variables
- Ensure all required variables are set in Vercel
- Check for typos in variable names
- Redeploy after adding new variables

### Debug Commands
```bash
# Test backend locally
cd backend
npm start

# Test frontend locally
cd frontend
npm run dev

# Check database connection
cd backend
node -e "import('./src/config/database.js').then(db => console.log('DB connected'))"
```

## Monitoring

### 1. Vercel Analytics
- Enable Vercel Analytics in your projects
- Monitor performance and errors

### 2. Database Monitoring
- Use Neon's built-in monitoring
- Set up alerts for connection issues

### 3. Error Tracking
- Consider adding Sentry for error tracking
- Monitor API response times

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Database URL is secure
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Environment variables are not exposed

## Performance Optimization

### 1. Database
- Use connection pooling (already configured)
- Optimize queries
- Add indexes where needed

### 2. Frontend
- Enable Vercel's edge caching
- Optimize images
- Use lazy loading

### 3. Backend
- Implement caching where appropriate
- Optimize API responses
- Use compression

## Support

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test locally first
4. Check database connectivity
5. Review CORS configuration

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure custom domains
3. Set up CI/CD pipeline
4. Add error tracking
5. Implement backup strategies
