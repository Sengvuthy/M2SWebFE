//user-role-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRoleListComponent } from './user-role-list/user-role-list.component';
import { UserRoleFormComponent } from './user-role-form/user-role-form.component';

const routes: Routes = [
  { path: '', component: UserRoleListComponent },
  { path: 'form/:id', component: UserRoleFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoleRoutingModule {}
