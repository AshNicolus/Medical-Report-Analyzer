# 🏥 Medical Report Analyzer - Frontend

## 🚀 Futuristic Medical Website UI

A stunning, modern medical analytics platform built with React, Tailwind CSS, and Framer Motion. Features premium animations, glassmorphism effects, and a futuristic design aesthetic.

## ✨ Features

### 🎨 Design Elements
- **Smooth Framer Motion animations** - Fluid transitions and micro-interactions
- **Glassmorphism cards** - Modern frosted glass effect
- **Neon glow effects** - Glowing buttons and borders
- **Floating particles** - Animated background elements
- **Gradient animations** - Dynamic color transitions
- **Parallax scrolling** - Depth and dimension
- **Animated medical icons** - Heartbeat, DNA, cells, pills

### 📱 Pages
1. **Landing Page**
   - Animated hero section with floating medical icons
   - Feature cards with hover effects
   - Step-by-step process visualization
   - Interactive dashboard preview
   - Testimonials carousel
   - CTA section with glow effects

2. **Login Page**
   - Patient/Doctor role selector
   - Login/Signup forms
   - Smooth transitions
   - Form validation

3. **Patient Dashboard**
   - Report upload interface
   - Reports list with status
   - Health statistics
   - Quick actions sidebar

4. **Doctor Dashboard**
   - Reports queue
   - Review interface
   - Patient management
   - Confidence-based filtering

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **React Router** - Navigation
- **Axios** - HTTP client

## 📦 Installation

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage

### Development Server
```powershell
npm run dev
```
The app will run on `http://localhost:3000`

### Environment Setup
The frontend is configured to proxy API requests to the Go backend running on `http://localhost:8080`

## 🎨 Color Palette

- **Primary**: `#667eea` (Purple Blue)
- **Secondary**: `#764ba2` (Deep Purple)
- **Accent**: `#00d4ff` (Cyan)
- **Glow**: `#00f0ff` (Bright Cyan)

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── AnimatedIcon.jsx
│   │   ├── FeatureCard.jsx
│   │   ├── FloatingParticles.jsx
│   │   ├── GlowButton.jsx
│   │   ├── StepCard.jsx
│   │   └── TestimonialCard.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── PatientDashboard.jsx
│   │   └── DoctorDashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## 🎭 Animation Features

- **Float animations** - Gentle up-down motion
- **Pulse effects** - Breathing glow
- **Slide transitions** - Smooth entry/exit
- **Rotate animations** - Icon spinning
- **Scale transforms** - Hover interactions
- **Opacity fades** - Smooth appearance

## 🔗 Integration with Backend

The frontend connects to the Go backend API:
- Patient authentication: `/api/auth/patient/*`
- Doctor authentication: `/api/auth/doctor/*`
- Report upload: `/api/patient/upload`
- Doctor review: `/api/doctor/reports/*`

## 📱 Responsive Design

Fully responsive across all devices:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🎨 Customization

### Modify Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#00d4ff',
  glow: '#00f0ff',
}
```

### Add Animations
Edit `tailwind.config.js` > `extend` > `animation`

### Custom Components
Create new components in `src/components/`

## 🚀 Deployment

### Build
```powershell
npm run build
```

### Preview
```powershell
npm run preview
```

The build output will be in the `dist/` folder.

## 📄 License

MIT License

## 👨‍💻 Author

Medical Report Analyzer Team

---

**Made with ❤️ using React, Tailwind CSS, and Framer Motion**
