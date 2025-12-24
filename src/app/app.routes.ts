import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { OAuthCallbackComponent } from './components/oauth-callback/oauth-callback.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PrinterManagementComponent } from './components/printer-management/printer-management.component';
import { MaterialTrackerComponent } from './components/material-tracker/material-tracker.component';
import { PrintQueueComponent } from './components/print-queue/print-queue.component';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'oauth-callback', component: OAuthCallbackComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'printers', component: PrinterManagementComponent, canActivate: [AuthGuard] },
  { path: 'printer/:printerId/materials', component: MaterialTrackerComponent, canActivate: [AuthGuard] },
  { path: 'printer/:printerId/queue', component: PrintQueueComponent, canActivate: [AuthGuard] },
  { path: 'printer/:printerId/notifications', component: NotificationSettingsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
