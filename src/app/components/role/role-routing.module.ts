import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleComponent } from './role.component';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleFormComponent } from './role-form/role-form.component';

const routes: Routes = [
  {
    path: '', component: RoleComponent,
    children: [
      { path: '', component: RoleListComponent },
      { path: 'form', component: RoleFormComponent },
      { path: 'form/:id', component: RoleFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRoutingModule {}
