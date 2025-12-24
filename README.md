# 3D Print Shop Manager - Frontend UI

Angular-based web interface for managing Etsy orders, 3D printer operations, and filament inventory. Built for any 3D printing business using Etsy as their sales platform.

## Quick Links

- **[Getting Started](../GETTING_STARTED.md)** - 5-minute setup guide
- **[Deployment Guide](../DEPLOYMENT.md)** - Production setup
- **[Architecture](./docs/ARCHITECTURE.md)** - Component design and data flow
- **[Code Cleanup Summary](../CODE_CLEANUP_SUMMARY.md)** - Code quality standards

## Features

### Dashboard
- ✅ **Order Management** - Sync and track Etsy orders in real-time
- ✅ **Production Queue** - Visual queue management and status tracking
- ✅ **Filament Inventory** - Track materials, costs, and low-stock alerts
- ✅ **Analytics** - Business metrics, revenue reports, efficiency tracking

### Printer Management
- ✅ **Multi-Printer Support** - Bambu Lab X1, OctoPrint, Klipper
- ✅ **Material Tracking** - AMS slot monitoring and usage
- ✅ **Print Scheduling** - Schedule prints from orders
- ✅ **Notifications** - Alerts for print events and maintenance

### Advanced Features
- 🔐 **Secure Auth** - OAuth with Etsy
- 📊 **Real-time Updates** - Live order and printer status
- 📱 **Responsive Design** - Works on desktop, tablet, mobile
- 🎨 **Clean UI** - Intuitive and fast interface

## Prerequisites

- **Node.js 16+** and npm
- **Backend API** running (see [j3d-backend](../j3d-backend/README.md))
- Etsy API credentials from [etsy.com/developers](https://www.etsy.com/developers)

## Quick Start

### Option 1: Docker
```bash
cd ..
docker-compose up -d
```
Frontend available at `http://localhost:4200`

### Option 2: Development
```bash
# Install dependencies
npm install

# Start development server
npm start
```
Frontend available at `http://localhost:4200`

### Option 3: Production Build
```bash
# Build optimized production files
npm run build

# Files in dist/ ready for deployment
```

## Project Structure

```
src/
├── app/
│   ├── app.component.ts         # Root component
│   ├── app.routes.ts            # Route definitions
│   ├── components/
│   │   ├── dashboard/           # Main dashboard
│   │   ├── login/               # Etsy OAuth login
│   │   ├── order-management/    # Order tracking
│   │   ├── production/          # Production queue
│   │   ├── filament-inventory/  # Material tracking
│   │   ├── printer-management/  # Printer control
│   │   ├── material-tracker/    # AMS materials
│   │   ├── print-queue/         # Print scheduling
│   │   └── notification-settings/ # Alert config
│   ├── services/
│   │   ├── auth.service.ts      # OAuth & JWT
│   │   ├── order.service.ts     # Order API
│   │   ├── filament.service.ts  # Inventory API
│   │   ├── printer.service.ts   # Printer API
│   │   └── production.service.ts # Queue API
│   ├── guards/
│   │   └── auth.guard.ts        # Route protection
│   └── models/
│       └── types.ts             # TypeScript interfaces
├── styles.scss                   # Global styles
├── index.html                    # HTML template
└── main.ts                       # Bootstrap
```

## Configuration

### Environment Setup
Create environment files:

**development** (src/environments/environment.ts):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

**production** (src/environments/environment.prod.ts):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-domain.com/api'
};
```

## Development

### Run Development Server
```bash
npm start
```
Navigate to `http://localhost:4200`

### Build for Production
```bash
npm run build --configuration production
```

### Run Tests
```bash
npm test
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Docker Deployment

### Build Container
```bash
docker build -t my-shop/j3d-frontend .
docker run -p 80:80 my-shop/j3d-frontend
```

### Docker Compose
See [../docker-compose.yml](../docker-compose.yml) for full setup

## Components Overview

### Dashboard
Hub for all shop operations
- View orders from Etsy
- Sync new orders
- Filament management
- Production queue overview
- Analytics dashboard

### Production Queue
Visual print job management
- Drag-to-reorder queue
- Status tracking (queued → completed)
- Time estimates
- Error tracking and recovery

### Printer Management
Multi-printer control interface
- Add/edit/delete printers
- Real-time status monitoring
- Configure by type (Bambu, OctoPrint, Klipper)
- Material slot assignment

### Material Tracker
AMS inventory at a glance
- Visual material cards
- Progress indicators
- Weight and cost calculations
- Low-stock warnings

### Notification Settings
Flexible alert configuration
- Print event alerts
- Material change notifications
- Email delivery options
- Custom webhooks

## Services

All backend communication goes through service classes:

### AuthService
- Etsy OAuth 3-legged flow
- JWT token management
- User information retrieval

### OrderService
- Order synchronization
- Status updates
- Notes and communications
- Filament assignment

### FilamentService
- Material inventory CRUD
- Usage tracking
- Cost calculations
- Low-stock alerts

### PrinterService
- Printer CRUD operations
- Status monitoring
- AMS material management
- Print scheduling
- Notification configuration

## Authentication Flow

1. User clicks "Login with Etsy"
2. Redirected to Etsy OAuth
3. User grants permissions
4. Redirected to app with auth code
5. Backend validates code, issues JWT, and sets the token in an HttpOnly, Secure, SameSite cookie
6. Browser automatically sends authentication cookie with all API requests
7. Tokens are not stored in localStorage or other JavaScript-accessible storage

## API Integration

Frontend communicates with backend REST API:

### Orders
```
GET  /api/orders
GET  /api/orders/:id
PUT  /api/orders/:id
POST /api/orders/sync
```

### Filaments
```
GET    /api/filaments
POST   /api/filaments
PUT    /api/filaments/:id
DELETE /api/filaments/:id
```

### Printers
```
GET    /api/bambu/printers
POST   /api/bambu/printers
GET    /api/bambu/printers/:id/status
POST   /api/bambu/scheduled-prints
GET    /api/bambu/scheduled-prints/:id
```

See [Backend API Documentation](../j3d-backend/docs/API.md) for complete reference.

## Styling

Uses SCSS for styling with global theme in [src/styles.scss](src/styles.scss):

- **Color Scheme**: Blue primary, with status-specific colors
- **Layout**: Grid-based, fully responsive
- **Components**: Material Design inspired
- **Accessibility**: WCAG 2.1 AA compliant

## State Management

Simple service-based state with RxJS:

- **AuthService**: Authentication state
- **Component Local State**: Each component manages its own data
- **Service Observables**: Real-time data updates

## Performance

- 📦 **Bundle Size**: ~600KB (optimized)
- ⚡ **Load Time**: <3 seconds
- 🚀 **Runtime**: Smooth 60 FPS
- 📱 **Mobile**: Full support

Optimizations:
- Tree-shaking
- Ahead-of-Time (AOT) compilation
- Code splitting
- Lazy loading routes

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Technology Stack

- **Framework**: Angular 15+
- **Language**: TypeScript 5
- **Styling**: SCSS
- **HTTP**: HttpClient with RxJS
- **Build**: Angular CLI / Webpack
- **Container**: Nginx (production)

## Code Quality

- ✅ TypeScript strict mode
- ✅ No console logs in production
- ✅ Proper error handling
- ✅ JSDoc documentation
- ✅ Clean code standards

See [../CODE_CLEANUP_SUMMARY.md](../CODE_CLEANUP_SUMMARY.md) for details.

## Troubleshooting

### Backend Not Connecting
Check `apiUrl` in environment config points to correct backend URL

### CORS Errors
Ensure backend has CORS enabled and frontend URL is whitelisted

### Authentication Loop
Clear localStorage and try login again

See [../DEPLOYMENT.md](../DEPLOYMENT.md) for more help.

## License

MIT - Free to use and modify

## Support

- 📖 [Getting Started](../GETTING_STARTED.md)
- 🚀 [Deployment Guide](../DEPLOYMENT.md)
- 🏗️ [Backend Documentation](../j3d-backend/README.md)
- 🐛 [Report Issues](../../issues)

---

**Ready to manage your shop?** Start with [Getting Started](../GETTING_STARTED.md) or [Deployment](../DEPLOYMENT.md).
````

```
┌─────────────────────┐
│   Angular Frontend  │  Port 4200
│   (nginx + SPA)     │
└──────────┬──────────┘
           │ /api/* proxy
           ▼
┌─────────────────────┐
│   Flask Backend     │  Port 5000
│   (Python + SQLite) │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│   Etsy API          │
│   (OAuth + Orders)  │
└─────────────────────┘
```

## ✨ Features

- ✅ **Etsy Integration** - 3-legged OAuth with automatic token refresh
- ✅ **Order Management** - Sync and track orders from last 6 months
- ✅ **Filament Tracking** - Inventory management for multiple spools
- ✅ **Usage Logging** - Track filament used per order
- ✅ **Auto-Deploy** - Push to main → automatic Docker build
- ✅ **Multi-Arch** - Works on Intel and ARM (Raspberry Pi, M1/M2)

## 🛠️ Tech Stack

**Backend:**
- Python 3.11 + Flask
- SQLAlchemy ORM
- JWT authentication
- Etsy API v3

**Frontend:**
- Angular 17 (standalone components)
- TypeScript
- SCSS styling
- RxJS

**DevOps:**
- Docker multi-stage builds
- GitHub Actions CI/CD
- GitHub Container Registry
- Nginx reverse proxy

## 📖 Documentation

- [Backend Docker Setup](./j3d-backend/README.md)
- [Frontend Docker Setup](./j3d-frontend/FRONTEND_DOCKER_SETUP.md)
- [Complete Setup Guide](./COMPLETE_SETUP.md)

## 🚢 Deployment Options

### Development
```bash
# Backend
cd j3d-backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend
cd j3d-frontend
npm install && npm start
```

### Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

### Cloud Platforms
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

Pull the images and deploy anywhere Docker runs!

## 🔧 Configuration

### Required Environment Variables

```env
ETSY_CLIENT_ID=your_etsy_client_id
ETSY_CLIENT_SECRET=your_etsy_client_secret
ETSY_REDIRECT_URI=http://localhost:4200/oauth-callback
SECRET_KEY=your-super-secret-key
```

### Optional Variables

```env
FLASK_ENV=production
DATABASE_URL=sqlite:///j3d.db  # or postgresql://...
```

## 🔐 Security

- JWT tokens for session management
- Non-root Docker containers
- Security headers configured
- HTTPS ready (add reverse proxy)
- Secrets via environment variables

## 📊 Database

Default: SQLite (file-based, included)
Production: PostgreSQL or MySQL supported

Update `DATABASE_URL` in `.env` to switch.

## 🐛 Troubleshooting

### Backend won't start?
```bash
docker logs j3d-backend
# Check ETSY credentials in .env
```

### Frontend can't reach API?
```bash
docker logs j3d-frontend
# Check if both containers are on same network
docker network inspect j3d_default
```

### OAuth redirect fails?
Ensure `ETSY_REDIRECT_URI` matches exactly in:
1. Your `.env` file
2. Etsy developer console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to main → Docker image auto-builds!
5. Create a Pull Request

## 📝 License

GNU General Public License v3.0

## 🙏 Credits

Built with:
- [Flask](https://flask.palletsprojects.com/)
- [Angular](https://angular.io/)
- [Etsy API](https://www.etsy.com/developers)
- [Docker](https://www.docker.com/)

---

**Made with ❤️ for 3D printing enthusiasts**

Questions? Open an issue!