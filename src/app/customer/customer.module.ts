//src/app/customer/customer.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerComponent } from './customer.component';
import { ProductBrowseComponent } from './product-browse/product-browse.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CustomerRegisterComponent } from './customer-register/customer-register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomerProfileComponent } from './customer-profile/customer-profile.component';
import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerHeaderModule } from './customer-header/customer-header.module';
import { RouterModule } from '@angular/router';
import { TelegramComponent } from './telegram/telegram.component';
import { DraggableDirective } from '../directives/draggable.directive';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CustomerComponent,
    ProductBrowseComponent,
    ProductDetailComponent,
    CheckoutComponent,
    CustomerRegisterComponent,
    CustomerProfileComponent,
    TelegramComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CustomerRoutingModule,
    CustomerHeaderModule,
    TranslateModule,
    DraggableDirective
  ]
})
export class CustomerModule {}
