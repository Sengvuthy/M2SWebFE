// src/app/customer/customer-header/customer-header.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomerHeaderComponent } from './customer-header.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [CustomerHeaderComponent],
  imports: [
    CommonModule,
    FormsModule,     // enables [(ngModel)]
    RouterModule,    // enables [routerLink]
    TranslateModule  // ✅ enables {{ 'KEY' | translate }}
  ],
  exports: [CustomerHeaderComponent]
})
export class CustomerHeaderModule {}
