import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { RolePermissionService } from '../../../services/role-permission.service';
import { RoleService, RoleDTO } from '../../../services/role.service';
import { PermissionService, PermissionDTO } from '../../../services/permission.service';

@Component({
  selector: 'app-role-permission-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './role-permission-form.component.html'
})
export class RolePermissionFormComponent implements OnInit {
  form!: FormGroup;
  isSubmitted = false;
  errorMsg = '';

  roles: RoleDTO[] = [];
  permissions: PermissionDTO[] = [];
  isLoadingRoles = true;
  isLoadingPermissions = true;

  constructor(
    private fb: FormBuilder,
    private rolePermissionService: RolePermissionService,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
    this.loadPermissions();
    this.addPermissionControl();
  }

  private initForm(): void {
    this.form = this.fb.group({
      roleId: [null, Validators.required],
      permissionIds: this.fb.array([], Validators.required)
    });
  }

  private loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: res => {
        const raw = res.list ?? res.content ?? res;
        this.roles = raw.map((r: any) => ({
          id: r.id ?? r.roleId,
          roleName: r.roleName ?? r.name
        }));
        this.isLoadingRoles = false;
      },
      error: () => {
        this.toastr.error('Failed to load roles');
        this.isLoadingRoles = false;
      }
    });
  }

  private loadPermissions(): void {
    this.permissionService.getAllPermissions().subscribe({
      next: res => {
        this.permissions = res
          .map((p: any) => ({
            id: p.id ?? p.permissionId,
            permissionName: p.permissionName ?? p.name
          }))
          .sort((a, b) => a.id - b.id);
        this.isLoadingPermissions = false;
      },
      error: () => {
        this.toastr.error('Failed to load permissions');
        this.isLoadingPermissions = false;
      }
    });
  }

  get permissionIds(): FormArray {
    return this.form.get('permissionIds') as FormArray;
  }

  get permissionControls(): FormControl[] {
    return this.permissionIds.controls as FormControl[];
  }

  addPermissionControl(prefill: number | null = null): void {
    this.permissionIds.push(new FormControl(prefill ?? '', Validators.required));
  }

  removePermissionControl(index: number): void {
    this.permissionIds.removeAt(index);
  }

  save(): void {
    if (this.form.invalid || this.isSubmitted) return;
    this.isSubmitted = true;

    const roleId = this.form.value.roleId;
    const permissionIds = this.permissionIds.value.map((v: any) => Number(v));

    this.rolePermissionService.assignBatch(roleId, permissionIds).subscribe({
      next: () => {
        this.toastr.success('Permissions assigned successfully!', 'Success');
        this.router.navigate(['/role-permission'], { queryParams: { roleId } });
        this.isSubmitted = false;
      },
      error: err => {
        this.errorMsg = err?.error?.message || 'Assign failed';
        this.toastr.error(this.errorMsg, 'Error');
        this.isSubmitted = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/role-permission']);
  }
}
