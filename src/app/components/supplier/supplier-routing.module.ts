import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupplierComponent } from './supplier.component';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { SupplierFormComponent } from './supplier-form/supplier-form.component';

const routes: Routes = [
  {
    path: '', component: SupplierComponent,
    children: [
      { path: '', component: SupplierListComponent },
      { path: 'form', component: SupplierFormComponent },
      { path: 'form/:id', component: SupplierFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplierRoutingModule {}
