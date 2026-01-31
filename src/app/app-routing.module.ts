import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component'; // create this simple component

const routes: Routes = [
  { path: '', redirectTo: 'user', pathMatch: 'full' },

  // Lazy-loaded feature modules
  { path: 'user', loadChildren: () => import('./components/user/user.module').then(m => m.UserModule) },
  { path: 'customer', loadChildren: () => import('./components/customer/customer.module').then(m => m.CustomerModule) },
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
  
  // Fallback route
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
