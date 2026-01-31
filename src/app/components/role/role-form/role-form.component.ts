import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService, RoleDTO } from '../../../services/role.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.css'],
  standalone: false
})
export class RoleFormComponent implements OnInit {
  form!: FormGroup;
  roleId: number | null = null; // ✅ use ID
  isSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      roleName: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.roleId = Number(idParam);
      this.loadRole(this.roleId);
    }
  }

  loadRole(id: number) {
    this.roleService.getRoleById(id).subscribe({
      next: (res: RoleDTO) => {
        this.form.patchValue({
          roleName: res.roleName,
          description: res.description
        });
      },
      error: () => {
        this.toastr.error("Role not found", "Error");
        this.router.navigate(['/role']);
      }
    });
  }

  save() {
    if (this.form.invalid || this.isSubmitted) return;
    this.isSubmitted = true;

    const data: Omit<RoleDTO, 'id'> = {
      roleName: this.form.value.roleName.trim(),
      description: this.form.value.description?.trim()
    };

    if (this.roleId) {
      this.updateRole(data);
    } else {
      this.createRole(data);
    }
  }

  private createRole(data: Omit<RoleDTO, 'id'>) {
    this.roleService.createRole(data).subscribe({
      next: () => {
        this.toastr.success("Role created successfully");
        this.router.navigate(['/role']);
      },
      error: err => {
        const msg = err.error?.message || "Create failed";
        this.toastr.error(msg);
        this.isSubmitted = false;
      }
    });
  }

  private updateRole(data: Omit<RoleDTO, 'id'>) {
    this.roleService.updateRole(this.roleId!, data).subscribe({
      next: () => {
        this.toastr.success("Role updated successfully");
        this.router.navigate(['/role']);
      },
      error: err => {
        const msg = err.error?.message || "Update failed";
        this.toastr.error(msg);
        this.isSubmitted = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/role']);
  }
}
