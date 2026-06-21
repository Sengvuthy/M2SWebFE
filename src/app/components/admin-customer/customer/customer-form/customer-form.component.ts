// src/app/components/admin-customer/customer/customer-form/customer-form.component.ts
/// <reference types="google.maps" />
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CustomerDTO, CustomerService } from '../../../../services/customer.service';
import { GoogleMapsService } from '../../../../services/google-map.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-customer-form',
  standalone: false,
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit {

  customerForm!: FormGroup;
  isSubmitted = false;
  customerId: number | null = null;

  private map!: google.maps.Map;
  private marker!: google.maps.Marker;
  activeAddressIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private googleMaps: GoogleMapsService,
    private translate: TranslateService
  ) { }

  async ngOnInit(): Promise<void> {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phones: this.fb.array([this.fb.control('', Validators.required)]),
      addresses: this.fb.array([this.fb.control('', Validators.required)]),
      lat: [null],
      lng: [null],
      isDefault: [false]
    });

    await this.googleMaps.load();

    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      const { lat, lng } = JSON.parse(savedLocation);
      this.reverseGeocode(lat, lng);
      this.setupMap(lat, lng);
    } else {
      // ✅ fallback center (Phnom Penh or any default)
      this.setupMap(11.5564, 104.9282);
    }

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const id = Number(paramMap.get('id'));
      if (id) {
        this.customerId = id;
        this.customerService.getById(id).subscribe({
          next: (customer: CustomerDTO) => this.patchCustomer(customer),
          error: () => {
            this.toastr.error("Customer not found", "Error");
            this.router.navigate(['/admin/customers']);
          }
        });
      }
    });
  }

  // Getters
  get phones(): FormArray {
    return this.customerForm.get('phones') as FormArray;
  }
  get addresses(): FormArray {
    return this.customerForm.get('addresses') as FormArray;
  }

  addPhone(): void {
    this.phones.push(this.fb.control('', Validators.required));
  }
  removePhone(index: number): void {
    this.phones.removeAt(index);
  }

  addAddress(): void {
    this.addresses.push(this.fb.control('', Validators.required));
  }
  removeAddress(index: number): void {
    this.addresses.removeAt(index);
  }

  private patchCustomer(customer: CustomerDTO): void {
    this.customerForm.patchValue({
      name: customer.name,
      lat: this.customerForm.value.lat,
      lng: this.customerForm.value.lng,
      isDefault: customer.isDefault
      // ❌ removed telegramId patch
    });

    this.phones.clear();
    (customer.phones || []).forEach(p => this.phones.push(this.fb.control(p, Validators.required)));

    this.addresses.clear();
    (customer.addresses || []).forEach(a => this.addresses.push(this.fb.control(a, Validators.required)));

    if (customer.addresses && customer.addresses.length > 0) {
      this.reverseGeocodeFromAddress(customer.addresses[0]);
    }
  }

  private reverseGeocode(lat: number, lng: number): void {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        if (this.addresses.length === 0) this.addAddress();
        this.addresses.at(0).setValue(results[0].formatted_address);
      } else {
        this.toastr.warning('Could not resolve address from location');
      }
    });
  }

  private reverseGeocodeFromAddress(address: string): void {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const formatted = results[0].formatted_address;

        // ✅ Clear existing addresses and set the new one
        this.addresses.clear();
        this.addresses.push(this.fb.control(formatted, Validators.required));
      } else {
        console.error('Geocoder failed: ' + status);
      }
    });
  }

  private setupMap(lat: number, lng: number): void {
    // Create map
    this.map = this.googleMaps.createMap('map', lat, lng);

    // Create marker
    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      draggable: true,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 40)
      },
      title: this.translate.instant('MAP_PIN_INSTRUCTION')
    });

    // ✅ Resolve address immediately for initial pin
    this.reverseGeocode(lat, lng);
    this.customerForm.patchValue({ lat, lng });

    // ✅ Update address + form when pin is dragged
    this.marker.addListener('dragend', () => {
      const pos = this.marker.getPosition();
      if (!pos) return;
      this.reverseGeocode(pos.lat(), pos.lng());
      this.customerForm.patchValue({ lat: pos.lat(), lng: pos.lng() });
      localStorage.setItem('userLocation', JSON.stringify({ lat: pos.lat(), lng: pos.lng() }));
    });

    // ✅ Add "Locate Me" button styled like Google Maps
    const locateButton = document.createElement("div");
    locateButton.style.backgroundColor = "#fff";
    locateButton.style.border = "2px solid #fff";
    locateButton.style.borderRadius = "50%";
    locateButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    locateButton.style.cursor = "pointer";
    locateButton.style.margin = "10px";
    locateButton.style.width = "40px";
    locateButton.style.height = "40px";
    locateButton.style.display = "flex";
    locateButton.style.alignItems = "center";
    locateButton.style.justifyContent = "center";
    locateButton.title = "Find my location";

    // Add crosshair icon
    locateButton.classList.add("map-locate-btn"); // use CSS class
    locateButton.title = this.translate.instant("LOCATE_ME");
    locateButton.innerHTML = "📍";

    // Place button on map
    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locateButton);

    // Handle click → center map on user location
    locateButton.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            this.map.setCenter(pos);
            this.marker.setPosition(pos);
            this.reverseGeocode(pos.lat, pos.lng);
            this.customerForm.patchValue({ lat: pos.lat, lng: pos.lng });
            localStorage.setItem("userLocation", JSON.stringify(pos));
          },
          () => this.toastr.error("Unable to fetch your location")
        );
      } else {
        this.toastr.warning("Geolocation not supported by this browser");
      }
    });
  }

  private getCustomerData(): CustomerDTO {
    return { ...this.customerForm.value };
  }

  createCustomer(): void {
    const data = this.getCustomerData();
    this.isSubmitted = true;
    this.customerService.createCustomer(data).subscribe({
      next: (createdCustomer) => {
        this.toastr.success("Customer created successfully!", "Success");
        localStorage.setItem('customerId', createdCustomer.id!.toString());
        localStorage.setItem('customerName', createdCustomer.name);
        this.isSubmitted = false;
        this.router.navigate(['/customer/browse']);
      },
      error: err => {
        this.toastr.error(err.error?.message || "Create failed", "Create Failed");
        this.isSubmitted = false;
      }
    });
  }

  updateCustomer(): void {
    const data = this.getCustomerData();
    this.isSubmitted = true;
    this.customerService.updateCustomer(this.customerId!, data).subscribe({
      next: (updatedCustomer) => {
        this.toastr.success("Customer updated successfully!", "Success");
        localStorage.setItem('customerId', updatedCustomer.id!.toString());
        localStorage.setItem('customerName', updatedCustomer.name);
        this.isSubmitted = false;
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigate([redirect || '/customer/profile']);
      },
      error: err => {
        this.toastr.error(err.error?.message || "Update failed", "Update Failed");
        this.isSubmitted = false;
      }
    });
  }

  cancel(): void {
    if (this.customerId) {
      this.router.navigate(['/customer/profile']);
    } else {
      this.router.navigate(['/customer/browse']);
    }
  }

  saveCustomer(): void {
    if (this.customerForm.invalid || this.isSubmitted) return;
    this.customerId ? this.updateCustomer() : this.createCustomer();
  }
}
