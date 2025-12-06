import { Routes } from '@angular/router';
import { Layout } from './components/layout/layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'oms',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((c) => c.Dashboard),
      },
      {
        path: 'staff',
        loadComponent: () => import('./pages/staff/staff').then((c) => c.Staff),
      },
      {
        path: 'staff-form',
        loadComponent: () => import('./pages/staff-form/staff-form').then((c) => c.StaffForm),
      },
      {
        path: 'items',
        loadComponent: () => import('./pages/items/items').then((c) => c.Items),
      },
      {
        path: 'items-form',
        loadComponent: () => import('./pages/items-form/items-form').then((c) => c.ItemsForm),
      },
      {
        path: 'customers-form',
        loadComponent: () => import('./pages/customer-form/customer-form').then((c) => c.CustomerForm),
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  }
];
