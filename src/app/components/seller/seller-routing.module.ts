import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellerComponent } from './seller.component';
import { SellerListComponent } from './seller-list/seller-list.component';
import { SellerFormComponent } from './seller-form/seller-form.component';

const routes: Routes = [
  {
    path: '', component: SellerComponent,
    children: [
      { path: '', component: SellerListComponent },
      { path: 'form', component: SellerFormComponent },
      { path: 'form/:id', component: SellerFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerRoutingModule {}
