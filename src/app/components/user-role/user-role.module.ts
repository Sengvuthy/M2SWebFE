import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserRoleRoutingModule } from './user-role-routing.module';

// Import your standalone components directly
import { UserRoleListComponent } from './user-role-list/user-role-list.component';
import { UserRoleFormComponent } from './user-role-form/user-role-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoleRoutingModule,

    // ✅ Import standalone components instead of declaring
    UserRoleListComponent,
    UserRoleFormComponent
  ]
})
export class UserRoleModule {}
