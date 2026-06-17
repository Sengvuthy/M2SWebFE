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
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: SalesListComponent },
      { path: 'sales-form', component: SalesFormComponent },
      { path: 'sales-form/:invoice', component: SalesFormComponent },
      { path: 'sales/detail/:invoice', component: SalesDetailComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
