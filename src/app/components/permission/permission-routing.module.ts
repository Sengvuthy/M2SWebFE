//permission-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionComponent } from './permission.component';
import { PermissionListComponent } from './permission-list/permission-list.component';
import { PermissionFormComponent } from './permission-form/permission-form.component';

const routes: Routes = [
  {
    path: '', component: PermissionComponent,
    children: [
      { path: '', component: PermissionListComponent },
      { path: 'form', component: PermissionFormComponent },
      { path: 'form/:id', component: PermissionFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionRoutingModule {}
