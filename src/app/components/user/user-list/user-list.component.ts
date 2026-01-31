//user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {

  users: any[] = [];
  isLoading = true;

  page = 1;
  limit = 15;
  totalPages = 1;

  searchName = '';
  searchId: number | null = null;

  sortBy = 'id';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;

    let params = new HttpParams()
      .set("_page", this.page.toString())
      .set("_limit", this.limit.toString())
      .set("_sortBy", this.sortBy)
      .set("_sortDir", this.sortDir);

    if (this.searchName.trim() !== '') {
      params = params.set("name", this.searchName.trim());
    }

    if (this.searchId) {
      params = params.set("id", this.searchId.toString());
    }

    this.userService.getUserList(params).subscribe({
      next: (res) => {
        const users = res.list;
        const totalPages = res.paginationDTO.totalPages;

        // ✅ If current page is empty and not the first page, go back to page 1
        if (users.length === 0 && this.page > 1) {
          this.page = 1;
          this.loadUsers(); // 🔁 Retry with page 1
          return;
        }

        this.users = users;
        this.totalPages = totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.log("Error fetching users:", error);
      }
    });
  }

  mapColumnToEntity(column: string): string {
    switch (column) {
      case 'username': return 'userName';
      case 'phoneNumber': return 'phoneNumber';
      default: return column;
    }
  }

  sort(column: string) {
    const mappedColumn = this.mapColumnToEntity(column);

    if (this.sortBy === mappedColumn) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = mappedColumn;
      this.sortDir = 'asc';
    }

    this.page = 1;
    this.loadUsers();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadUsers();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadUsers();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.loadUsers();
  }

  search() {
    this.page = 1;
    if (this.searchName.trim() === '') {
      this.searchName = '';
      this.searchId = null;
    }
    this.loadUsers();
  }

  clearSearch() {
    this.searchName = '';
    this.searchId = null;
    this.page = 1;
    this.loadUsers();
  }

  goToCreateUser() {
    this.router.navigate(['/user/form']);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  editUser(id: number) {
    this.router.navigate(['/user/form', id]);
  }

  deleteUser(id: number) {
    if (!confirm(`Are you sure you want to delete user ID ${id}?`)) return;
    this.userService.deleteUser(id).subscribe({
      next: res => {
        const msg = res || "User deleted successfully";
        this.toastr.success(msg, "Delete Success");
        this.clearSearch();
      },
      error: err => {
        const msg = err.error?.message || "Delete failed";
        this.toastr.error(msg, "Delete Error");
      }
    });
  }

  importUsers() {
    this.userService.importUsers().subscribe({
      next: (res) => {
        this.toastr.success("Users imported successfully!", "Import Success");
        this.loadUsers(); // refresh table
      },
      error: (err) => {
        const msg = err.error || "Import failed";
        this.toastr.error(msg, "Import Error");
      }
    });
  }
}
