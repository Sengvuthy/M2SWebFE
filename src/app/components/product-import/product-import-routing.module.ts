//product-import-routing.component.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductImportListComponent } from './product-import-list/product-import-list.component';
import { ProductImportFormComponent } from './product-import-form/product-import-form.component';
import { ProductImportDetailComponent } from './product-import-detail/product-import-detail.component';

const routes: Routes = [
  { path: '', component: ProductImportListComponent },
  { path: 'form', component: ProductImportFormComponent }, // ✅ route for create form
  { path: 'form/:importId', component: ProductImportFormComponent }, // optional edit route
  { path: 'product-import/detail/:importId', component: ProductImportDetailComponent } // Go to see product import detail
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductImportRoutingModule { }
