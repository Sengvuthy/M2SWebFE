//user-role.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UserRoleRoutingModule } from './user-role-routing.module';
import { UserRoleListComponent } from './user-role-list/user-role-list.component';
import { UserRoleFormComponent } from './user-role-form/user-role-form.component';
import { UserRoleComponent } from './user-role.component';

@NgModule({
  declarations: [
    UserRoleComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoleRoutingModule,

    UserRoleListComponent,
    UserRoleFormComponent,
    RouterModule
  ]
})
export class UserRoleModule {}
