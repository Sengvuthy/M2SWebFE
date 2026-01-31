import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SellerService, SellerDTO } from '../../../services/seller.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-seller-form',
  templateUrl: './seller-form.component.html',
  styleUrls: ['./seller-form.component.css'],
  standalone: false
})
export class SellerFormComponent implements OnInit {

  sellerForm!: FormGroup;
  isSubmitted = false;
  sellerId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private sellerService: SellerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sellerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      employeeCode: [''],
      phone: ['', [Validators.pattern(/^[0-9]{9,15}$/)]]
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const id = Number(paramMap.get('id'));
      if (id) {
        this.sellerId = id;
        this.sellerService.getById(id).subscribe({
          next: (seller: SellerDTO) => {
            this.sellerForm.patchValue(seller);
          },
          error: () => {
            this.toastr.error("Seller not found", "Error");
            this.router.navigate(['/seller']);
          }
        });
      }
    });
  }

  saveSeller() {
    if (this.sellerForm.invalid || this.isSubmitted) return;

    this.isSubmitted = true;
    const data: Omit<SellerDTO, 'id'> = this.sellerForm.value;

    if (this.sellerId) {
      this.sellerService.updateSeller(this.sellerId, data).subscribe({
        next: () => {
          this.toastr.success("Seller updated successfully!", "Success");
          this.isSubmitted = false;
          this.router.navigate(['/seller']);
        },
        error: (err) => {
          const msg = err.error?.message || "Update failed";
          this.toastr.error(msg, "Error");
          this.isSubmitted = false;
        }
      });
    } else {
      this.sellerService.createSeller(data).subscribe({
        next: () => {
          this.toastr.success("Seller created successfully!", "Success");
          this.isSubmitted = false;
          this.router.navigate(['/seller']);
        },
        error: (err) => {
          const msg = err.error?.message || "Create failed";
          this.toastr.error(msg, "Error");
          this.isSubmitted = false;
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/seller']);
  }
}
