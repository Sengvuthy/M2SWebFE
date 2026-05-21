//src/app/customer/customer-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';
import { ProductBrowseComponent } from './product-browse/product-browse.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CustomerRegisterComponent } from './customer-register/customer-register.component';
import { CustomerProfileComponent } from './customer-profile/customer-profile.component';
import { TelegramComponent } from './telegram/telegram.component';

const routes: Routes = [
  {
    path: '', component: CustomerComponent,
    children: [
      { path: 'browse', component: ProductBrowseComponent },
      { path: 'product/:barcode', component: ProductDetailComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'register', component: CustomerRegisterComponent },
      { path: 'profile', component: CustomerProfileComponent },
      { path: 'profile/edit', component: CustomerProfileComponent },
      { path: 'telegram', component: TelegramComponent },      
      { path: '', redirectTo: 'browse', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule {}
