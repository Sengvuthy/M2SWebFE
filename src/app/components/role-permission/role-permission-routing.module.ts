import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolePermissionListComponent } from './role-permission-list/role-permission-list.component';
import { RolePermissionFormComponent } from './role-permission-form/role-permission-form.component';

const routes: Routes = [
  { path: '', component: RolePermissionListComponent },
  { path: 'form/:id', component: RolePermissionFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolePermissionRoutingModule {}
