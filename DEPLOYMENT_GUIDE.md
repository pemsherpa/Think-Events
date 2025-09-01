# 🚀 Think-Events Deployment Guide for Render

This guide will walk you through deploying your Think-Events application to Render.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Neon Database**: A PostgreSQL database on Neon.tech
3. **Render Account**: Sign up at [render.com](https://render.com)

## 🗄️ Database Setup (Neon)

1. **Create Neon Database**:
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy your connection string

2. **Test Database Connection**:
   ```bash
   cd backend
   npm install
   # Set your DATABASE_URL in .env
   npm run migrate
   npm run seed
   ```

## 🔧 Backend Deployment

### 1. Create Web Service on Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `think-events-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2. Set Environment Variables

In the Render dashboard, go to "Environment" tab and add:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=your-neon-connection-string
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.onrender.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Deploy Backend

1. Click "Create Web Service"
2. Wait for the build to complete
3. Note your backend URL (e.g., `https://think-events-backend.onrender.com`)

## 🎨 Frontend Deployment

### 1. Create Static Site on Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `think-events-frontend`
- **Environment**: `Static Site`
- **Region**: Same as backend
- **Branch**: `main`
- **Root Directory**: `frontend`

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 2. Set Environment Variables

```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_APP_NAME=Think-Events
VITE_APP_VERSION=1.0.0
```

### 3. Deploy Frontend

1. Click "Create Static Site"
2. Wait for the build to complete
3. Note your frontend URL

## 🔄 Update URLs

After both services are deployed:

1. **Update Backend CORS**: Go to backend service → Environment → Update `FRONTEND_URL`
2. **Update Frontend API**: Go to frontend service → Environment → Update `VITE_API_URL`

## 🧪 Testing Your Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.onrender.com/health`
2. **Frontend**: Visit your frontend URL
3. **Test Features**:
   - User registration/login
   - Event browsing
   - Booking creation

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Database Connection Issues**:
   - Verify DATABASE_URL is correct
   - Check Neon database is active
   - Ensure SSL configuration is correct

3. **CORS Errors**:
   - Verify FRONTEND_URL is set correctly
   - Check that frontend URL is in corsOrigins array

4. **Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify sensitive data is properly secured

### Debug Commands:

```bash
# Check backend logs
# Go to Render dashboard → Backend service → Logs

# Test database connection locally
cd backend
npm run migrate

# Test frontend build locally
cd frontend
npm run build
```

## 📊 Monitoring

1. **Render Dashboard**: Monitor service health and logs
2. **Neon Dashboard**: Monitor database performance
3. **Application Logs**: Check for errors and performance issues

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] DATABASE_URL is secure
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Environment variables are not exposed in logs
- [ ] HTTPS is enabled (automatic on Render)

## 🚀 Next Steps

After successful deployment:

1. **Set up custom domain** (optional)
2. **Configure monitoring** and alerts
3. **Set up CI/CD** for automatic deployments
4. **Implement backup strategies**
5. **Add performance monitoring**

## 📞 Support

If you encounter issues:

1. Check Render documentation
2. Review application logs
3. Test locally first
4. Contact Render support if needed

---

**🎉 Congratulations! Your Think-Events application is now live on Render!**
