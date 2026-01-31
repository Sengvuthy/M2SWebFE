import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesRoutingModule } from './sales-routing.module';

import { SalesComponent } from './sales.component';
import { SalesListComponent } from './sales-list/sales-list.component';
import { SalesFormComponent } from './sales-form/sales-form.component';
import { SalesDetailComponent } from './sales-detail/sales-detail.component';
import { NgxBarcode6Module } from 'ngx-barcode6';

@NgModule({
  declarations: [
    SalesComponent,
    SalesListComponent,
    SalesFormComponent,
    SalesDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SalesRoutingModule,
    NgxBarcode6Module
  ]
})
export class SalesModule {}
