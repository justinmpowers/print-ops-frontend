# 3D Print Shop Manager - Frontend Quick Start

Complete full-stack application for managing Etsy orders and tracking 3D printer filament inventory.

## Quick Start

### Backend Setup
```bash
cd ../j3d-backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
# Configure .env file with your Etsy credentials
python app.py
```

### Frontend Setup
```bash
cd j3d-frontend
npm install
npm start
```

Visit `http://localhost:4200` to access the application.

## Features Overview

**Order Management**
- OAuth 3-legged flow with Etsy
- Sync orders automatically
- Track production status
- Manage fulfillment and shipping
- Internal notes and communication logs

**Filament Inventory**
- Track materials, colors, and costs
- Monitor consumption rates
- Low stock alerts
- Cost per gram calculations

**Printer Management**
- Support for Bambu Lab X1, OctoPrint, Klipper
- Real-time status monitoring
- AMS material slot tracking
- Print queue management
- Notification settings

**Production Queue**
- Schedule prints from orders
- Manage print priorities
- Track print status
- Automated scheduling helpers

**Analytics**
- Business metrics
- Profitability tracking
- Material usage reports
- Production efficiency

## Architecture

**Backend (Python/Flask)**
- RESTful API endpoints
- SQLAlchemy ORM with PostgreSQL
- JWT token management
- Etsy OAuth integration
- Printer API integrations

**Frontend (Angular)**
- Standalone components
- TypeScript with strong typing
- Responsive design
- Real-time data updates
- Material Design styling

## Next Steps

- See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check [../GETTING_STARTED.md](../GETTING_STARTED.md) for 5-minute setup
- Review [../DEPLOYMENT.md](../DEPLOYMENT.md) for production deployment

## License

MIT
