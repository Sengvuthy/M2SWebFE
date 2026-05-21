//expense-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ExpenseReportService, ExpenseReportDTO } from '../../../services/expense.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css'],
  standalone: false
})
export class ExpenseListComponent implements OnInit {

  expenses: ExpenseReportDTO[] = [];
  isLoading = true;

  startDate?: string;
  endDate?: string;

  page = 1;
  limit = 30;
  totalPages = 1;

  sortBy = 'expenseId';
  sortDir: 'asc' | 'desc' = 'desc';

  constructor(
    private expenseService: ExpenseReportService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses() {
    this.isLoading = true;

    let params = new HttpParams()
      .set('_page', this.page.toString())
      .set('_limit', this.limit.toString())
      .set('_sortBy', this.sortBy)
      .set('_sortDir', this.sortDir);

    if (this.startDate) params = params.set('startDate', this.startDate);
    if (this.endDate) params = params.set('endDate', this.endDate);

    this.expenseService.getExpenseIdList(params).subscribe({
      next: (res) => {
        this.expenses = res.list;
        this.totalPages = res.paginationDTO.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Failed to load expenses', 'Error');
        console.error('Error fetching expenses:', err);
      }
    });
  }

  clearFilters() {
    this.startDate = undefined;
    this.endDate = undefined;
    this.page = 1;
    this.loadExpenses();
  }

  sort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.page = 1;
    this.loadExpenses();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadExpenses();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadExpenses();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.loadExpenses();
  }

  get pageNumbers(): number[] {
    const delta = 2;
    const pages: number[] = [];
    pages.push(1);

    if (this.page - delta > 2) pages.push(-1);

    for (let i = Math.max(2, this.page - delta);
      i <= Math.min(this.totalPages - 1, this.page + delta);
      i++) {
      pages.push(i);
    }

    if (this.page + delta < this.totalPages - 1) pages.push(-1);
    if (this.totalPages > 1) pages.push(this.totalPages);

    return pages;
  }

  openDetail(expenseId: string) {
    this.router.navigate(['/expense/detail', expenseId]);
  }

  goToCreateExpense() {
    this.router.navigate(['/expense/form']);
  }

  editExpense(expenseId: string) {
    this.router.navigate(['/expense/form', expenseId]);
  }

  cancelExpense(expenseId: string) {
    this.expenseService.cancelExpense(expenseId).subscribe({
      next: () => {
        this.toastr.success('Expense cancelled successfully', 'Cancel Success');
        this.loadExpenses();
      },
      error: (err) => {
        const msg = err.error?.message || 'Cancel failed';
        this.toastr.error(msg, 'Cancel Error');
      }
    });
  }

  importExpenses() {
    this.expenseService.importExpenses().subscribe({
      next: () => {
        this.toastr.success('Expenses imported successfully!', 'Import Success');
        this.loadExpenses();
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.message || 'Import failed';
        this.toastr.error(msg, 'Import Error');
      }
    });
  }
}
