//src/app/components/sales/sale.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesRoutingModule } from './sales-routing.module';

import { SalesComponent } from './sales.component';
import { SalesListComponent } from './sales-list/sales-list.component';
import { SalesFormComponent } from './sales-form/sales-form.component';
import { SalesDetailComponent } from './sales-detail/sales-detail.component';
import { NgxBarcode6Module } from 'ngx-barcode6';
import { CustomerHeaderModule } from '../../customer/customer-header/customer-header.module';
import { TranslateModule } from '@ngx-translate/core';

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
    NgxBarcode6Module,
    CustomerHeaderModule,
    TranslateModule
  ]
})
export class SalesModule {}
