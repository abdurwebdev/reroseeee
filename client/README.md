# Rerose Client - React Frontend

This is the frontend client for the Rerose platform, built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📦 Deployment to Vercel

### Automatic Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the configuration and deploy

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Create a `.env` file based on `.env.example`:

```bash
VITE_API_URL=your_backend_url
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

## 🛠 Technologies Used

- **React 18** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS 4** - Styling
- **React Router** - Routing
- **Framer Motion** - Animations
- **Socket.io** - Real-time Communication
- **Chart.js** - Data Visualization
- **React Toastify** - Notifications

## 📁 Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── utils/         # Utility functions
├── context/       # React contexts
├── assets/        # Static assets
└── styles/        # Global styles
```

## 🔧 Build Optimizations

- Code splitting with manual chunks
- Tree shaking for unused code
- CSS optimization with PostCSS
- Asset optimization
- Bundle size warnings at 1500kb

## 🚨 Common Issues

### Build Errors
- Ensure all dependencies are installed
- Check for missing environment variables
- Verify all imports are correct

### Deployment Issues
- Check Vercel build logs
- Ensure environment variables are set in Vercel dashboard
- Verify API endpoints are accessible

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔗 Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
