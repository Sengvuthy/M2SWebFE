// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LoginComponent } from './components/login/login.component';
import { CustomerLoginComponent } from './components/customer-login/customer-login.component';

const routes: Routes = [
  // Default redirect → customer browse
  { path: '', redirectTo: 'customer/browse', pathMatch: 'full' },

  // Public login routes
  { path: 'admin/login', component: LoginComponent },          // ✅ Admin login
  { path: 'customer/login', component: CustomerLoginComponent }, // ✅ Customer login

  // Lazy-loaded feature modules
  { path: 'user', loadChildren: () => import('./components/user/user.module').then(m => m.UserModule) },
  { path: 'customer', loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule) },
  { path: 'admin/customers', loadChildren: () => import('./components/admin-customer/admin-customer.module').then(m => m.AdminCustomerModule) },
  { path: 'seller', loadChildren: () => import('./components/seller/seller.module').then(m => m.SellerModule) },
  { path: 'category', loadChildren: () => import('./components/category/category.module').then(m => m.CategoryModule) },
  { path: 'role', loadChildren: () => import('./components/role/role.module').then(m => m.RoleModule) },
  { path: 'permission', loadChildren: () => import('./components/permission/permission.module').then(m => m.PermissionModule) },
  { path: 'role-permission', loadChildren: () => import('./components/role-permission/role-permission.module').then(m => m.RolePermissionModule) },
  { path: 'user-role', loadChildren: () => import('./components/user-role/user-role.module').then(m => m.UserRoleModule) },
  { path: 'product', loadChildren: () => import('./components/product/product.module').then(m => m.ProductModule) },
  { path: 'product-import', loadChildren: () => import('./components/product-import/product-import.module').then(m => m.ProductImportModule) },
  { path: 'sales', loadChildren: () => import('./components/sales/sales.module').then(m => m.SalesModule) },
  { path: 'sale-report', loadChildren: () => import('./components/sale-report/sale-report.module').then(m => m.SaleReportModule) },
  { path: 'expense', loadChildren: () => import('./components/expense/expense.module').then(m => m.ExpenseModule) },
  { path: 'supplier', loadChildren: () => import('./components/supplier/supplier.module').then(m => m.SupplierModule) },
  { path: 'exchange-rate', loadChildren: () => import('./components/exchange-rate/exchange-rate.module').then(m => m.ExchangeRateModule) },

  // Fallback route → 404
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
