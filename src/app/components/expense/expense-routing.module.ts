import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseComponent } from './expense.component';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ExpenseFormComponent } from './expense-form/expense-form.component';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';

const routes: Routes = [
  {
    path: '', component: ExpenseComponent,
    children: [
      { path: '', component: ExpenseListComponent },
      { path: 'form', component: ExpenseFormComponent },
      { path: 'form/:id', component: ExpenseFormComponent },      
      { path: 'detail/:expenseId', component: ExpenseDetailComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpenseRoutingModule {}
