# J3D - Etsy Orders & Filament Tracker

Complete full-stack application for managing Etsy orders and tracking 3D printer filament inventory.

## Quick Start

### Backend
```bash
cd j3d-backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
# Configure .env file with your Etsy credentials
python app.py
```

### Frontend
```bash
cd j3d-frontend
npm install
npm start
```

Visit `http://localhost:4200` to access the application.

## Setup Instructions

See the main README.md for complete setup instructions and features.

## Key Components

**Backend (Python/Flask)**
- OAuth 3-legged flow with Etsy
- SQLAlchemy models for Orders, Filaments, and Usage
- RESTful API endpoints
- JWT token management

**Frontend (Angular)**
- Standalone components
- Order management dashboard
- Filament inventory tracker
- Real-time data sync

## License

MIT
