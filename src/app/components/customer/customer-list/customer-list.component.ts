import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-list',
  standalone: false,
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {

  customers: any[] = [];
  isLoading = true;

  page = 1;
  limit = 15;
  totalPages = 1;

  searchName = '';

  sortBy = 'id';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers() {
    this.isLoading = true;

    let params = new HttpParams()
      .set("page", this.page.toString())
      .set("size", this.limit.toString())
      .set("sort", `${this.sortBy},${this.sortDir}`);

    if (this.searchName.trim() !== '') {
      params = params.set("name", this.searchName.trim());
    }

    this.customerService.getCustomerList(params).subscribe({
      next: (res) => {
        const customers = res.list;
        const totalPages = res.paginationDTO.totalPages;

        if (customers.length === 0 && this.page > 1) {
          this.page = 1;
          this.loadCustomers();
          return;
        }

        this.customers = customers;
        this.totalPages = totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Error fetching customers:", error);
      }
    });
  }

  sort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.page = 1;
    this.loadCustomers();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadCustomers();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadCustomers();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.loadCustomers();
  }

  search() {
    this.page = 1;
    this.loadCustomers();
  }

  clearSearch() {
    this.searchName = '';
    this.page = 1;
    this.loadCustomers();
  }

  goToCreateCustomer() {
    this.router.navigate(['/customer/form']);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  editCustomer(id: number) {
    this.router.navigate(['/customer/form', id]);
  }

  deleteCustomer(id: number) {
    this.customerService.deleteCustomer(id).subscribe({
      next: res => {
        this.toastr.success(res, "Delete Success");
        this.clearSearch();
      },
      error: err => {
        const msg = err.error?.message || "Delete failed";
        this.toastr.error(msg, "Delete Error");
      }
    });
  }

  importCustomers() {
    this.customerService.importCustomers().subscribe({
      next: (res) => {
        this.toastr.success("Customers imported successfully!", "Import Success");
        this.loadCustomers();
      },
      error: (err) => {
        const msg = err.error || "Import failed";
        this.toastr.error(msg, "Import Error");
      }
    });
  }

  exportCustomers() {
    this.customerService.exportCustomers().subscribe({
      next: (res) => {
        this.toastr.success("Customers exported successfully!", "Export Success");
      },
      error: (err) => {
        const msg = err.error || "Export failed";
        this.toastr.error(msg, "Export Error");
      }
    });
  }
}
