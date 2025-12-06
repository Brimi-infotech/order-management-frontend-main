import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaffS } from '../../services/staff-s';
import { v4 as uuid } from 'uuid';
import { ItemsS } from '../../services/items-s';
import { forkJoin } from 'rxjs';
import { Toast } from '../../services/toast';
import { EnterNavDirective } from '../../directives/enter-nav';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersS } from '../../services/customers-s';

export interface Address {
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CaratBoxes {
  id: string;
  name: string;
  price?: number;
  isCustom?: boolean;
}

export interface Advance {
  amount: number;
  date: string;
}

export interface Weight {
  pw: 'P' | 'W';
  grWt: number;
  pcs: number;
  prRate: number;
  prAmt: number;
  rate: number;
  itmAmt: number;
}

export enum OrderStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Done = 'Done',
  Emergency = 'Emergency',
}

export interface Item {
  itemCode: string;
  size: string;
  caratPurity: string;
  color: string;
  weight: Weight;
  workerName: string;
  workerIssueDate: string;
  orderStatus: OrderStatus;
  workerReceiveDate: string;
  customerDeliveryDate: string;
  note: string;
  newItemTag: string;
  imageUrls: string[];
}

export interface Customer {
  orderId: string;
  name: string;
  mobile: string;
  address: Address;
  deliveryDate: string;
  orderReceiveDate: string;
  staffCode: string;
  carateBoxes: CaratBoxes[];
  rateFixed: 'fixed' | 'notFixed';
  fixedRateDate: string;
  advances: Advance[];
  items: Item[];
}

@Component({
  selector: 'app-customer-form-new',
  imports: [FormsModule, EnterNavDirective],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.css',
})
export class CustomerForm {
  private readonly _staffS = inject(StaffS);
  private readonly _itemsS = inject(ItemsS);
  private readonly _customersS = inject(CustomersS);
  private readonly _toast = inject(Toast);
  private readonly _activeRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _cdr = inject(ChangeDetectorRef);

  staffsList = signal<any[]>([]);
  itemsList = signal<any[]>([]);
  customerId = signal<string | null>(null);

  customerForm: Customer = {
    orderId: '',
    name: '',
    mobile: '',
    address: {
      address1: '',
      address2: '',
      city: '',
      state: '',
      pincode: '',
    },
    deliveryDate: '',
    orderReceiveDate: new Date().toISOString().split('T')[0],
    staffCode: '',
    carateBoxes: [
      {
        id: uuid(),
        name: '18 Carat Rate',
      },
      {
        id: uuid(),
        name: '22 Carat Rate',
      },
      {
        id: uuid(),
        name: '24 Carat Rate',
      },
      {
        id: uuid(),
        name: 'Silver Rate',
      },
    ],
    rateFixed: 'notFixed',
    fixedRateDate: '',
    advances: [],
    items: [
      {
        itemCode: '',
        size: '',
        caratPurity: '',
        color: '',
        weight: {
          pw: 'P',
          grWt: 0,
          pcs: 0,
          prRate: 0,
          prAmt: 0,
          rate: 0,
          itmAmt: 0,
        },
        workerName: '',
        workerIssueDate: '',
        orderStatus: OrderStatus.Pending,
        workerReceiveDate: '',
        customerDeliveryDate: '',
        note: '',
        newItemTag: '',
        imageUrls: [],
      },
    ],
  };

  isSubmitted = false;

  orderStatusOptions = [
    { label: 'Pending', value: OrderStatus.Pending },
    { label: 'In Progress', value: OrderStatus.InProgress },
    { label: 'Done', value: OrderStatus.Done },
    { label: 'Emergency', value: OrderStatus.Emergency },
  ];

  constructor() {
    this.customerForm.orderId = this.getOrderId();
    this._activeRoute.queryParamMap.subscribe((params) => {
      const customerId = params.get('id');
      this.customerId.set(customerId);
      if (customerId) {
        this.loadCustomerData();
      }
    });
  }

  ngOnInit(): void {
    forkJoin([this._staffS.getStaffs(), this._itemsS.getItems()]).subscribe({
      next: ([staffRes, itemRes]) => {
        this.staffsList.set(staffRes.data);
        this.itemsList.set(itemRes.data);
      },
    });
  }

  private loadCustomerData(): void {
    this._customersS.getCustomerById(this.customerId()!).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.customerForm = res.data;
          this._cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(err);
        this._toast.error('Error fetching customer data');
      },
    });
  }

  private getOrderId(): string {
    const prefix = 'O';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNum}`;
  }

  addNewBox(): void {
    const newBox: CaratBoxes = {
      id: uuid(),
      name: '',
      price: 0,
      isCustom: true,
    };

    this.customerForm.carateBoxes.push(newBox);
  }

  removeBox(id: string): void {
    this.customerForm.carateBoxes = this.customerForm.carateBoxes.filter((box) => box.id !== id);
  }

  addAdvance(): void {
    this.customerForm.advances.push({ amount: 0, date: new Date().toISOString().split('T')[0] });
  }

  removeAdvance(index: number): void {
    this.customerForm.advances.splice(index, 1);
  }

  addItemRow(): void {
    const item: Item = {
      itemCode: '',
      size: '',
      caratPurity: '',
      color: '',
      weight: {
        pw: 'P',
        grWt: 0,
        pcs: 0,
        prRate: 0,
        prAmt: 0,
        rate: 0,
        itmAmt: 0,
      },
      workerName: '',
      workerIssueDate: '',
      orderStatus: OrderStatus.Pending,
      workerReceiveDate: '',
      customerDeliveryDate: '',
      note: '',
      newItemTag: '',
      imageUrls: [],
    };

    this.customerForm.items.push(item);
  }

  removeItemRow(index: number): void {
    if (this.customerForm.items.length <= 1) return;
    this.customerForm.items.splice(index, 1);
  }

  onItemImageChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const maxSizeInMB = 1;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      files.forEach((file) => {
        if (!file.type.startsWith('image/')) {
          this._toast.error(`${file.name} is not a valid image file`);
          return;
        }

        if (file.size > maxSizeInBytes) {
          this._toast.warning(`${file.name} is larger than ${maxSizeInMB}MB. Compressing...`);
          this.compressAndUploadImage(file, index);
        } else {
          this.uploadImage(file, index);
        }
      });

      input.value = '';
    }
  }

  private uploadImage(file: File, index: number): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.customerForm.items[index].imageUrls.push(reader.result as string);
      this._cdr.detectChanges();
      this._toast.success(`${file.name} uploaded successfully`);
    };
    reader.onerror = () => {
      this._toast.error(`Failed to upload ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  private compressAndUploadImage(file: File, index: number): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              const compressionRatio = ((1 - blob.size / file.size) * 100).toFixed(1);
              this._toast.success(
                `${file.name} compressed by ${compressionRatio}% (${this.formatFileSize(
                  file.size
                )} → ${this.formatFileSize(blob.size)})`
              );

              this.uploadImage(compressedFile, index);
            } else {
              this._toast.error(`Failed to compress ${file.name}`);
            }
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = () => {
        this._toast.error(`Failed to process ${file.name}`);
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      this._toast.error(`Failed to read ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  removeImage(itemIndex: number, imageIndex: number): void {
    this.customerForm.items[itemIndex].imageUrls.splice(imageIndex, 1);
    this._cdr.detectChanges();
  }

  calculateWeightValues(weight: Weight, index: number): void {
    const pw = weight.pw;
    const grWt = weight.grWt || 0;
    const pcs = weight.pcs || 0;
    const prRate = weight.prRate || 0;
    const rate = weight.rate || 0;

    let prAmt = 0;
    let itmAmt = 0;

    if (pw === 'W') {
      prAmt = grWt * prRate;
      itmAmt = rate * grWt;
    } else {
      prAmt = pcs * prRate;
      itmAmt = rate * pcs;
    }

    if (weight.prAmt !== prAmt || weight.itmAmt !== itmAmt) {
      weight.prAmt = prAmt;
      weight.itmAmt = itmAmt;

      this.customerForm.items[index].weight = weight;
    }
  }

  onDelete(): void {
    if (!this.customerId()) return;

    this._customersS.deleteCustomer(this.customerId()!).subscribe({
      next: (res) => {
        this._toast.success('Customer deleted successfully');
        this.customerId.set(null);
      },
      error: () => {
        this._toast.error('Error deleting customer');
      },
      complete: () => {
        this._router.navigate(['/oms/dashboard']);
      },
    });
  }

  onSubmit(form: any) {
    this.isSubmitted = true;

    if (form.valid) {
      const observable = this.customerId()
        ? this._customersS.editCustomer(this.customerId()!, this.customerForm)
        : this._customersS.addCustomer(this.customerForm);

      observable.subscribe({
        next: (res) => {
          if (this.customerId()) {
            this._toast.success('Customer updated successfully');
            this.customerId.set(null);
          } else {
            this._toast.success('Customer added successfully');
            this.isSubmitted = false;
          }
        },
        error: (err) => {
          console.error(err);
          this._toast.error('Error adding customer');
          this.isSubmitted = false;
        },
        complete: () => {
          this._router.navigate(['/oms/dashboard']);
        },
      });
    } else {
      this._toast.error('Please check the form details and correct them.');
      this.isSubmitted = false;
    }
  }
}
