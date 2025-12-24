# Frontend Architecture

Complete architecture documentation for the Angular frontend application.

## Overview

The 3D Print Shop Manager frontend is a modern Angular 15+ Single Page Application (SPA) that provides a comprehensive dashboard for managing 3D printing operations, orders, inventory, and printer controls.

## Technology Stack

- **Framework**: Angular 15+
- **Language**: TypeScript 5
- **Styling**: SCSS with Bootstrap integration
- **State Management**: RxJS Observables
- **HTTP Client**: Angular HttpClient
- **Build Tool**: Angular CLI
- **Development Server**: ng serve (with live reload)
- **Production Build**: Optimized tree-shaking, AOT compilation

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   User Browser                           │
│                Angular SPA (Port 4200)                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │
┌────────────────────▼────────────────────────────────────┐
│              Angular Application Shell                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  app.component.ts                                │  │
│  │  (Main layout, routing, navigation)              │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
  ┌─────▼────┐  ┌───▼────┐  ┌───▼─────┐
  │ Dashboard│  │ Services│  │ Guards  │
  │          │  │         │  │         │
  │Components│  │(HTTP)   │  │(Auth)   │
  └──────────┘  └─────────┘  └─────────┘
        │
        ▼
  ┌──────────────────┐
  │  Backend REST API│
  │  (Port 5000)     │
  └──────────────────┘
```

## Project Structure

```
src/
├── index.html              ← Entry HTML
├── main.ts                 ← Application bootstrap
├── styles.scss             ← Global styles
├── app/
│   ├── app.component.ts    ← Root component
│   ├── app.routes.ts       ← Route definitions
│   ├── components/
│   │   ├── dashboard/      ← Main dashboard
│   │   ├── login/          ← Authentication
│   │   ├── oauth-callback/ ← OAuth handler
│   │   ├── order-management/
│   │   ├── production/
│   │   ├── printer-management/
│   │   ├── material-tracker/
│   │   ├── print-queue/
│   │   └── notification-settings/
│   ├── guards/
│   │   └── auth.guard.ts   ← Route protection
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── order.service.ts
│   │   ├── filament.service.ts
│   │   ├── printer.service.ts
│   │   └── http-client.ts
│   ├── models/
│   │   └── types.ts        ← TypeScript interfaces
│   └── interceptors/       ← HTTP interceptors (auth, errors)
└── assets/
    └── (images, fonts, etc)
```

## Core Components

### 1. App Component (`app.component.ts`)

**Purpose**: Root component for the entire application

**Responsibilities**:
- Initialize application
- Set up main layout
- Manage navigation
- Handle global events

**Features**:
- Header with title and navigation
- Sidebar with menu items
- Main content router outlet
- Footer

**Template Structure**:
```html
<app-header></app-header>
<div class="main-container">
  <app-sidebar></app-sidebar>
  <router-outlet></router-outlet>
</div>
<app-footer></app-footer>
```

### 2. Dashboard Component

**Purpose**: Main hub showing all critical information

**Sections**:
- Order summary (Today, This week, This month)
- Printer status overview
- Print queue snapshot
- Material inventory alerts
- Recent activity log

**Real-time Updates**:
- Refreshes every 30 seconds
- Shows active prints
- Displays material levels
- Shows order status changes

### 3. Login Component

**Purpose**: OAuth authentication with Etsy

**Flow**:
1. User clicks "Login with Etsy"
2. Requests login URL from backend
3. Redirects to Etsy OAuth
4. User authorizes
5. Redirected to callback URL
6. Backend exchanges code for JWT
7. Frontend stores JWT
8. Redirected to dashboard

**Features**:
- OAuth flow handling
- Token storage
- Session persistence
- Logout functionality

### 4. OAuth Callback Component

**Purpose**: Handles redirect from Etsy OAuth

**Process**:
1. Receives authorization code
2. Extracts code verifier from session
3. Sends to backend for token exchange
4. Receives JWT token
5. Stores in localStorage
6. Redirects to dashboard

### 5. Printer Management Component

**Purpose**: View and control connected printers

**Features**:
- List all printers (Bambu Lab)
- Real-time status
- Add new printer
- Configure printer settings
- View printer details
- Manage printer materials

**Display**:
```
Printers List
├── Printer Card 1
│   ├── Name & Status
│   ├── Current Job
│   ├── Progress Bar
│   ├── Temperature
│   └── Action Buttons
├── Printer Card 2
│   └── ...
└── Add Printer Button
```

**Printer Card Details**:
- Name and connection status
- Current job name
- Progress percentage
- Temperatures (nozzle, bed, chamber)
- Material loaded
- Last update time
- Action buttons (view details, control)

### 6. Production Queue Component

**Purpose**: Manage print job queue

**Features**:
- View all scheduled jobs
- Add new print job
- Reorder queue by priority
- Start/stop jobs
- Cancel jobs
- Track job progress

**Queue Display**:
```
Job Priority  Job Name        Material    Duration    Status
1            Custom Bracket  PLA Red     4h 30m     In Progress (45%)
2            Phone Stand     PETG Blue   3h 20m     Queued
3            Test Part       PLA White   1h 15m     Queued
```

### 7. Material Tracker Component

**Purpose**: Inventory management

**Features**:
- Add new materials
- Track usage
- Set low stock alerts
- View material costs
- Calculate filament needs
- Monitor material per print

**Display**:
```
Material    Color   Current  Initial  Cost/g   Status
PLA         Red     750g     1000g    €0.02    ✓ Adequate
PETG        Blue    120g     500g     €0.025   ⚠ Low Stock
ABS         Black   0g       500g     €0.03    ✗ Out
```

### 8. Notification Settings Component

**Purpose**: Configure alerts and notifications

**Settings**:
- Print start alerts
- Print completion alerts
- Material change reminders
- Maintenance notifications
- Email notifications
- Webhook configuration

**Notification Types**:
- In-app (dashboard alerts)
- Email (to shop email)
- Webhooks (external systems)

## Services Architecture

### 1. AuthService

**Purpose**: Authentication and user management

**Key Methods**:
- `getLoginUrl()` - Get Etsy OAuth URL
- `handleCallback()` - Process OAuth callback
- `login()` - Authenticate user
- `logout()` - End session
- `isAuthenticated()` - Check auth status
- `getUser()` - Current user data
- `getToken()` - JWT token

**State Management**:
```typescript
private currentUser$ = new BehaviorSubject<User | null>(null);
public currentUser = this.currentUser$.asObservable();
```

**Token Handling**:
- Stores JWT token in an HttpOnly, Secure, SameSite cookie (not accessible to JavaScript)
- Browser sends cookie automatically with all API requests to the backend
- Auto-refreshes on expiry
- Handles logout

### 2. OrderService

**Purpose**: Order management operations

**Key Methods**:
- `getOrders()` - Fetch orders with filters
- `getOrder(id)` - Get single order details
- `updateOrder()` - Update order status
- `syncOrders()` - Sync from Etsy
- `addNote()` - Add order note
- `getNotes()` - Get order notes
- `logCommunication()` - Log customer contact

**Caching**:
- Orders cached for 5 minutes
- Manual refresh available
- Auto-refresh on updates

**Filtering Support**:
```typescript
interface OrderFilters {
  status?: OrderStatus;
  production_status?: ProductionStatus;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}
```

### 3. FilamentService

**Purpose**: Inventory management

**Key Methods**:
- `getFilaments()` - List materials
- `addFilament()` - Add new material
- `updateFilament()` - Update material info
- `deleteFilament()` - Remove material
- `getLowStockItems()` - Alert on low stock
- `calculateCost()` - Material cost calculation

**Material Tracking**:
```typescript
interface Filament {
  id: number;
  material: string;
  color: string;
  initial_amount: number;
  current_amount: number;
  cost_per_gram: number;
  low_stock_threshold: number;
}
```

### 4. PrinterService

**Purpose**: Printer operations and monitoring

**Key Methods**:
- `getPrinters()` - List all printers
- `addPrinter()` - Register new printer
- `getPrinterStatus()` - Real-time status
- `startJob()` - Start print job
- `cancelJob()` - Cancel print
- `getMaterials()` - Get loaded materials
- `updateNotifications()` - Configure alerts

**Real-time Updates**:
```typescript
// Polls backend every 30 seconds
getPrinterStatus(printerId: number): Observable<PrinterStatus> {
  return interval(30000).pipe(
    startWith(0),
    switchMap(() => this.http.get(`/api/bambu/printers/${printerId}/status`))
  );
}
```

### 5. HTTP Client with Interceptors

**Purpose**: Centralized HTTP communication

**Features**:
- Automatic JWT injection
- Error handling
- Request/response logging
- Rate limiting awareness
- Retry logic for failures

**Interceptor Chain**:
```
Request
  ↓
Add JWT Token (AuthInterceptor)
  ↓
Log Request (LoggingInterceptor)
  ↓
Backend API
  ↓
Response
  ↓
Handle Errors (ErrorInterceptor)
  ↓
Component
```

## Route Configuration

### Navigation Routes

Defined in `app.routes.ts`:

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'auth/callback', component: OAuthCallbackComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    component: OrderManagementComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'printers',
    component: PrinterManagementComponent,
    canActivate: [AuthGuard]
  },
  // ... more routes
];
```

### Protected Routes

Uses `AuthGuard` to:
- Check if user is authenticated
- Redirect to login if not
- Load user data if needed

```typescript
canActivate(route, state) {
  if (this.authService.isAuthenticated()) {
    return true;
  } else {
    this.router.navigate(['/login']);
    return false;
  }
}
```

## State Management

### RxJS Observables

Uses Observables for reactive data flow:

```typescript
// Service
public orders$: Observable<Order[]>;

// Component
this.orders$ = this.orderService.getOrders();

// Template
<app-order-card *ngFor="let order of orders$ | async"></app-order-card>
```

### Behavior Subjects

For mutable state:

```typescript
private currentFilter = new BehaviorSubject<OrderFilters>(defaultFilters);
public currentFilter$ = this.currentFilter.asObservable();

// Update from component
updateFilter(filter: OrderFilters) {
  this.currentFilter.next(filter);
}
```

### Data Flow

```
Component
  ↓
Calls Service Method
  ↓
Service makes HTTP Request
  ↓
Backend returns data
  ↓
Service caches/transforms
  ↓
Observable emitted to Component
  ↓
Template renders
```

## Styling Architecture

### Bootstrap Integration

Uses Bootstrap 5 for responsive design:

```scss
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/bootstrap';
```

### Custom SCSS

Global styles in `styles.scss`:

```scss
// Variables
$primary-color: #3498db;
$secondary-color: #2c3e50;

// Mixins
@mixin button-style {
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
}

// Global classes
.container-main {
  max-width: 1200px;
  margin: 0 auto;
}
```

### Component Styles

Each component has `component.scss`:

```scss
.printer-card {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 0.5rem;
  
  &.online {
    border-color: #28a745;
  }
  
  &.offline {
    border-color: #dc3545;
  }
}
```

## Authentication Flow

### Login Process

```
1. User clicks "Login"
   ↓
2. LoginComponent requests auth URL
   GET /api/auth/login
   ↓
3. Backend returns:
   {
     "auth_url": "https://www.etsy.com/oauth/authorize?...",
     "code_verifier": "random_string"
   }
   ↓
4. Store code_verifier in session
   ↓
5. Redirect browser to auth_url
   ↓
6. User logs in on Etsy
   ↓
7. Etsy redirects to:
   http://localhost:4200/auth/callback?code=AUTH_CODE
   ↓
8. OAuthCallbackComponent receives code
   ↓
9. POST /api/auth/callback with:
   {
     "code": "AUTH_CODE",
     "code_verifier": "stored_value"
   }
   ↓
10. Backend exchanges for access token
    ↓
11. Backend returns JWT
    ↓
12. Frontend stores JWT in localStorage
    ↓
13. Redirect to /dashboard
    ↓
14. AuthGuard verifies JWT
    ↓
15. Dashboard loads
```

## HTTP Request/Response

### Request Headers

All authenticated requests include:

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
X-Requested-With: XMLHttpRequest
```

### Request Example

```typescript
// Component
this.orderService.updateOrder(orderId, updateData).subscribe(
  order => console.log('Order updated', order),
  error => console.error('Update failed', error)
);

// Service
updateOrder(id: number, data: Partial<Order>): Observable<Order> {
  return this.http.put<Order>(`/api/orders/${id}`, data);
}

// HTTP Call
PUT /api/orders/123
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "status": "shipped",
  "production_status": "completed"
}
```

### Response Handling

```typescript
// Success (200 OK)
{
  "id": 123,
  "status": "shipped",
  "updated_at": "2025-01-01T12:34:56"
}

// Error (4xx, 5xx)
{
  "error": "Order not found",
  "status": 404
}
```

## Performance Optimization

### Change Detection

Uses `OnPush` strategy for performance:

```typescript
@Component({
  selector: 'app-printer-card',
  templateUrl: './printer-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Lazy Loading

Routes lazy-load modules:

```typescript
{
  path: 'printers',
  loadChildren: () => 
    import('./modules/printers/printers.module')
      .then(m => m.PrintersModule)
}
```

### Memory Leaks Prevention

Unsubscribe using `takeUntil`:

```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.printerService.getPrinters()
    .pipe(takeUntil(this.destroy$))
    .subscribe(printers => this.printers = printers);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## Testing Architecture

### Unit Tests

```typescript
describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch orders', () => {
    service.getOrders().subscribe(orders => {
      expect(orders.length).toBe(2);
    });

    const req = httpMock.expectOne('/api/orders');
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });
});
```

### Component Tests

```typescript
describe('PrinterManagementComponent', () => {
  let component: PrinterManagementComponent;
  let fixture: ComponentFixture<PrinterManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrinterManagementComponent],
      providers: [PrinterService]
    }).compileComponents();

    fixture = TestBed.createComponent(PrinterManagementComponent);
    component = fixture.componentInstance;
  });

  it('should display printers', () => {
    component.printers = mockPrinters;
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(
      By.css('.printer-card')
    );
    expect(cards.length).toBe(2);
  });
});
```

## Build & Deployment

### Development Build

```bash
ng serve
# App runs on http://localhost:4200
# Hot reload enabled
# Source maps for debugging
```

### Production Build

```bash
ng build --configuration production
# Optimized bundle
# Tree-shaking enabled
# Minified & uglified
# Assets hashed
# Output in dist/
```

### Docker Deployment

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN ng build --configuration production

FROM nginx:alpine
COPY --from=builder /app/dist/j3d-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Code Quality Standards

### TypeScript Best Practices
- Strong typing (avoid any)
- Interface definitions
- Null checks
- Strict mode enabled

### Angular Best Practices
- Smart/Dumb components pattern
- Change detection strategy
- Memory leak prevention
- Lazy loading routes

### SCSS Best Practices
- Use variables for colors/sizes
- Use mixins for repetitive styles
- BEM naming convention
- Avoid deep nesting

### JSDoc Comments
- Document public methods
- Include @param descriptions
- Include @returns information
- Include usage examples

## Future Improvements

- [ ] Add offline mode with service workers
- [ ] Implement WebSocket for real-time updates
- [ ] Add advanced filtering and search
- [ ] Implement drag-and-drop for queue management
- [ ] Add dark mode support
- [ ] Add mobile app (Ionic/React Native)
- [ ] Advanced analytics and reporting
