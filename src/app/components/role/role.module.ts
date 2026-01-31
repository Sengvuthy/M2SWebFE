import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoleRoutingModule } from './role-routing.module';

import { RoleComponent } from './role.component';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleFormComponent } from './role-form/role-form.component';

@NgModule({
  declarations: [
    RoleComponent,
    RoleListComponent,
    RoleFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RoleRoutingModule
  ]
})
export class RoleModule {}
