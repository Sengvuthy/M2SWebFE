//sales-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesComponent } from './sales.component';
import { SalesListComponent } from './sales-list/sales-list.component';
import { SalesFormComponent } from './sales-form/sales-form.component';
import { SalesDetailComponent } from './sales-detail/sales-detail.component';

const routes: Routes = [
  {
    path: '', component: SalesComponent,
    children: [
      { path: '', component: SalesListComponent },   // Go to Sales on sidebar
      { path: 'form', component: SalesFormComponent }, // Go to Sales/form
      { path: 'form/:invoice', component: SalesFormComponent }, //Go to edit sales
      { path: 'sales/detail/:invoice', component: SalesDetailComponent } // Go to see sales detail
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule {}
