import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { SupplierService, SupplierDTO } from '../../../services/supplier.service';

@Component({
  selector: 'app-supplier-form',
  standalone: false,
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.css']
})
export class SupplierFormComponent implements OnInit {

  supplierForm!: FormGroup;
  isSubmitted = false;
  supplierId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      email: [''],
      address: ['']
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const id = Number(paramMap.get('id'));
      if (id) {
        this.supplierId = id;
        this.loadSupplier(id);
      }
    });
  }

  private loadSupplier(id: number) {
    this.supplierService.getById(id).subscribe({
      next: (supplier: SupplierDTO) => {
        this.supplierForm.patchValue(supplier);
      },
      error: () => {
        this.toastr.error("Supplier not found", "Error");
        this.router.navigate(['/supplier']);
      }
    });
  }

  private getSupplierData(): SupplierDTO {
    return { ...this.supplierForm.value };
  }

  private createSupplier() {
    const data = this.getSupplierData();
    this.isSubmitted = true;

    this.supplierService.createSupplier(data).subscribe({
      next: () => {
        this.toastr.success("Supplier created successfully!", "Success");
        this.router.navigate(['/supplier']);
      },
      error: err => {
        const msg = err.error?.message || "Create failed";
        this.toastr.error(msg, "Create Failed");
        this.isSubmitted = false;
      }
    });
  }

  private updateSupplier() {
    const data = this.getSupplierData();
    this.isSubmitted = true;

    this.supplierService.updateSupplier(this.supplierId!, data).subscribe({
      next: () => {
        this.toastr.success("Supplier updated successfully!", "Success");
        this.router.navigate(['/supplier']);
      },
      error: err => {
        const msg = err.error?.message || "Update failed";
        this.toastr.error(msg, "Update Failed");
        this.isSubmitted = false;
      }
    });
  }

  saveSupplier() {
    if (this.supplierForm.invalid || this.isSubmitted) return;

    if (this.supplierId) {
      this.updateSupplier();
    } else {
      this.createSupplier();
    }
  }

  cancel() {
    this.router.navigate(['/supplier']);
  }
}
