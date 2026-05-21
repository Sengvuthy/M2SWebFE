//src/app/components/admin-customer/admin-customer-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer/customer.component';
import { CustomerListComponent } from './customer/customer-list/customer-list.component';
import { CustomerFormComponent } from './customer/customer-form/customer-form.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerComponent,   // wrapper with <router-outlet>
    children: [
      { path: '', component: CustomerListComponent },          // /admin/customers
      { path: 'form', component: CustomerFormComponent },      // /admin/customers/form
      { path: 'form/:id', component: CustomerFormComponent }   // /admin/customers/form/123
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminCustomerRoutingModule {}
