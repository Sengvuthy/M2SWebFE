//user-role-format.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { UserRoleService } from '../../../services/user-role.service';
import { RoleService, RoleDTO } from '../../../services/role.service';
import { UserService } from '../../../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-role-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './user-role-form.component.html'
})
export class UserRoleFormComponent implements OnInit {
  form!: FormGroup;
  userId!: number;
  isSubmitted = false;
  errorMsg = '';
  roles: RoleDTO[] = [];
  users: { id: number; userName: string }[] = [];
  isLoadingRoles = true;
  isLoadingUsers = true;

  constructor(
    private fb: FormBuilder,
    private service: UserRoleService,
    private roleService: RoleService,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      userId: [null, Validators.required],
      roleId: [null, Validators.required]
    });

    this.loadDropdowns();
  }

  private loadDropdowns(): void {
    // Load roles
    this.roleService.getAllRoles().subscribe({
      next: (res: any) => {
        const list = res.list ?? res.content ?? res;
        this.roles = list.map((r: any) => ({
          id: r.id ?? r.roleId,
          roleName: r.roleName ?? r.name,
          description: r.description
        }));
        this.isLoadingRoles = false;
      },
      error: () => {
        this.toastr.error('Failed to load roles');
        this.isLoadingRoles = false;
      }
    });

    // Load users
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const list = res.list ?? res.content ?? res;
        this.users = list.map((u: any) => ({
          id: u.id ?? u.userId,
          userName: u.username ?? u.name,
          description: u.description
        }));
        this.isLoadingUsers = false;
      },
      error: () => {
        this.toastr.error('Failed to load users');
        this.isLoadingUsers = false;
      }
    });
  }

  save(): void {
    if (this.form.invalid || this.isSubmitted) return;
    this.isSubmitted = true;

    const userId = this.form.value.userId;
    const roleId = this.form.value.roleId;

    this.service.assignBatch(userId, [roleId]).subscribe({
      next: () => this.router.navigate(['/user-role'], { queryParams: { userId } }),
      error: err => {
        this.errorMsg = err?.error?.message || 'Assign failed';
        this.isSubmitted = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/user-role'], { queryParams: { userId: this.userId } });
  }
}
