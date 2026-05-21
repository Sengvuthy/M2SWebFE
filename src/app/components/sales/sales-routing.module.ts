//src/app/components/sales-routing.module.ts
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
      { path: '', component: SalesListComponent },          // /sales → list
      { path: 'sales-form', component: SalesFormComponent }, // /sales/sales-form → create
      { path: 'sales-form/:invoice', component: SalesFormComponent }, // /sales/sales-form/:invoice → edit
      { path: 'detail/:invoice', component: SalesDetailComponent }    // /sales/detail/:invoice → detail
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule {}
