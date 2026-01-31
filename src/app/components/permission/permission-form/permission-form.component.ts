//permission-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PermissionService, PermissionDTO } from '../../../services/permission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-permission-form',
  templateUrl: './permission-form.component.html',
  styleUrls: ['./permission-form.component.css'],
  standalone: false
})
export class PermissionFormComponent implements OnInit {
  form!: FormGroup;
  permissionId: number | null = null; // ✅ use ID
  isSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      permissionName: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.permissionId = Number(idParam);
      this.loadPermission(this.permissionId);
    }
  }

  loadPermission(id: number) {
    this.permissionService.getPermissionById(id).subscribe({
      next: (res: PermissionDTO) => {
        this.form.patchValue({
          permissionName: res.permissionName,
          description: res.description
        });
      },
      error: () => {
        this.toastr.error('Permission not found', 'Error');
        this.router.navigate(['/permission']);
      }
    });
  }

  save() {
    if (this.form.invalid || this.isSubmitted) return;
    this.isSubmitted = true;

    const data: Omit<PermissionDTO, 'id'> = {
      permissionName: this.form.value.permissionName.trim(),
      description: this.form.value.description?.trim()
    };

    if (this.permissionId) {
      this.updatePermission(data);
    } else {
      this.createPermission(data);
    }
  }

  private createPermission(data: Omit<PermissionDTO, 'id'>) {
    this.permissionService.createPermission(data).subscribe({
      next: () => {
        this.toastr.success('Permission created successfully');
        this.router.navigate(['/permission']);
      },
      error: err => {
        const msg = err.error?.message || 'Create failed';
        this.toastr.error(msg);
        this.isSubmitted = false;
      }
    });
  }

  private updatePermission(data: Omit<PermissionDTO, 'id'>) {
    this.permissionService.updatePermission(this.permissionId!, data).subscribe({
      next: () => {
        this.toastr.success('Permission updated successfully');
        this.router.navigate(['/permission']);
      },
      error: err => {
        const msg = err.error?.message || 'Update failed';
        this.toastr.error(msg);
        this.isSubmitted = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/permission']);
  }
}
