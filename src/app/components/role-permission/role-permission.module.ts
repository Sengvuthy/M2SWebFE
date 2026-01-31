//role-permission.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolePermissionRoutingModule } from './role-permission-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import your standalone components directly
import { RolePermissionListComponent } from './role-permission-list/role-permission-list.component';
import { RolePermissionFormComponent } from './role-permission-form/role-permission-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RolePermissionRoutingModule,

    // ✅ Import standalone components instead of declaring
    RolePermissionListComponent,
    RolePermissionFormComponent
  ]
})
export class RolePermissionModule {}
