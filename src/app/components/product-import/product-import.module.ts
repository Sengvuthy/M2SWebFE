import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductImportRoutingModule } from './product-import-routing.module';

import { ProductImportComponent } from './product-import.component';
import { ProductImportListComponent } from './product-import-list/product-import-list.component';
import { ProductImportFormComponent } from './product-import-form/product-import-form.component';
import { ProductImportDetailComponent } from './product-import-detail/product-import-detail.component';

@NgModule({
  declarations: [
    ProductImportComponent,
    ProductImportListComponent,
    ProductImportFormComponent,
    ProductImportDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProductImportRoutingModule
  ]
})
export class ProductImportModule { }
