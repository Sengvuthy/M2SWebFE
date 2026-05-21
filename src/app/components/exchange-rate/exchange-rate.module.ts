// exchange-rate.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ExchangeRateComponent } from './exchange-rate.component';

const routes: Routes = [
  { path: '', component: ExchangeRateComponent }
];

@NgModule({
  declarations: [ExchangeRateComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [ExchangeRateComponent]
})
export class ExchangeRateModule {}
