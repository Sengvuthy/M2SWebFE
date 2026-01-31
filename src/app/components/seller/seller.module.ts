import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SellerRoutingModule } from './seller-routing.module';

import { SellerComponent } from './seller.component';
import { SellerListComponent } from './seller-list/seller-list.component';
import { SellerFormComponent } from './seller-form/seller-form.component';

@NgModule({
  declarations: [
    SellerComponent,
    SellerListComponent,
    SellerFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SellerRoutingModule
  ]
})
export class SellerModule {}
