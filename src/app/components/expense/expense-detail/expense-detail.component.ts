import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseReportService, ExpenseReportDTO, ExpenseReportItem } from '../../../services/expense.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-expense-detail',
  standalone: false,
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.css']
})
export class ExpenseDetailComponent implements OnInit {

  expenseId = '';
  items: ExpenseReportItem[] = [];
  info: any = {};
  countdown = 0;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private expenseService: ExpenseReportService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.expenseId = this.route.snapshot.paramMap.get('expenseId') || '';
    this.countdown = Number(this.route.snapshot.queryParamMap.get('countdown')) || 0;

    this.expenseService.getExpenseByExpenseId(this.expenseId).subscribe({
      next: (res: ExpenseReportDTO) => {
        this.items = res.items ?? [];
        this.info = {
          expenseId: res.expenseId,
          supplierName: res.supplierName,
          payerName: res.payerName,
          expenseDate: res.expenseDate,
          expenseTime: res.expenseTime
        };
      },
      error: err => {
        const msg = err.error?.message || 'Failed to load expense details';
        this.toastr.error(msg);
      }
    });

    if (this.countdown > 0) {
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          clearInterval(timer);
          this.router.navigate(['/expense/form']);
        }
      }, 1000);
    }
  }

  getTotal(): number {
    return this.items.reduce((sum, it) => {
      const subtotal = (Number(it.expensePrice) || 0) * (Number(it.expenseUnit) || 0);
      return sum + subtotal;
    }, 0);
  }

  print(): void {
    window.print();
  }

  cancel(): void {
    if (!confirm(`Cancel expense ${this.expenseId}? This will delete all records for this expense.`)) return;

    this.expenseService.cancelExpense(this.expenseId).subscribe({
      next: () => {
        this.toastr.success('Expense cancelled');
        this.router.navigate(['/expense']);
      },
      error: err => {
        const msg = err.error?.message || 'Cancel failed';
        this.toastr.error(msg);
      }
    });
  }
}
