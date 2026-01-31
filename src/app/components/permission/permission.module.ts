import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PermissionRoutingModule } from './permission-routing.module';

import { PermissionComponent } from './permission.component';
import { PermissionListComponent } from './permission-list/permission-list.component';
import { PermissionFormComponent } from './permission-form/permission-form.component';

@NgModule({
  declarations: [
    PermissionComponent,
    PermissionListComponent,
    PermissionFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PermissionRoutingModule
  ]
})
export class PermissionModule {}
