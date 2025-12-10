import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../services/toast';
import { StaffS } from '../../services/staff-s';
import { ItemsS } from '../../services/items-s';
import { forkJoin } from 'rxjs';
import { CustomersS } from '../../services/customers-s';

interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  filterable: boolean;
}

declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly _customersS = inject(CustomersS);
  private readonly _staffS = inject(StaffS);
  private readonly _itemsS = inject(ItemsS);
  private readonly _toast = inject(Toast);
  private readonly _router = inject(Router);

  Math = Math;

  customers = signal<any[]>([]);
  items = signal<any[]>([]);
  staffs = signal<any[]>([]);
  loading = signal<boolean>(true);

  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  columnFilters = signal<Record<string, string>>({});

  activeStatus = signal<string | null>(null);

  noteModel: any = null;

  columns: TableColumn[] = [
    { key: 'orderId', label: 'Order ID', sortable: true, filterable: true },
    { key: 'receiveDate', label: 'Order Receive Date', sortable: true, filterable: true },
    { key: 'customerName', label: 'Customer Name', sortable: true, filterable: true },
    { key: 'itemName', label: 'Item Name', sortable: true, filterable: true },
    { key: 'itemCode', label: 'Item Code', sortable: true, filterable: true },
    { key: 'size', label: 'Size', sortable: true, filterable: true },
    { key: 'caratPurity', label: 'Carat/Purity', sortable: true, filterable: true },
    { key: 'color', label: 'Color', sortable: true, filterable: true },
    { key: 'weight', label: 'Weight', sortable: true, filterable: true },
    { key: 'workerName', label: 'Worker Name', sortable: true, filterable: true },
    { key: 'workerIssueDate', label: 'Worker Issue Date', sortable: true, filterable: true },
    { key: 'orderStatus', label: 'Order Status', sortable: true, filterable: true },
    { key: 'workerReceiveDate', label: 'Worker Receive Date', sortable: true, filterable: true },
    {
      key: 'customerDeliveryDate',
      label: 'Customer Receive Date',
      sortable: true,
      filterable: true,
    },
    { key: 'note', label: 'Note', sortable: true, filterable: true },
    { key: 'share', label: 'Share', sortable: false, filterable: false },
    { key: 'newItemTag', label: 'New Item Tag', sortable: true, filterable: true },
    { key: 'chat', label: 'Chat', sortable: false, filterable: false },
    { key: 'image', label: 'Image', sortable: false, filterable: false },
  ];

  tableData = computed(() => {
    const customers = this.customers();
    const flattened: any[] = [];

    customers.forEach((customer) => {
      if (customer.items && customer.items.length > 0) {
        customer.items.forEach((item: any) => {
          flattened.push({
            customerId: customer._id,
            orderId: customer.orderId,
            receiveDate: customer.orderReceiveDate,
            customerName: customer.name,
            itemName: this.getItemName(item.itemCode) || '-',
            itemCode: item.itemCode || '-',
            size: item.size || '-',
            caratPurity: item.caratPurity || '-',
            color: item.color || '-',
            weight: `${item.weight?.grWt || 0}g / ${item.weight?.pcs || 0}pcs`,
            workerName: item.workerName || '-',
            workerIssueDate: item.workerIssueDate,
            orderStatus: item.orderStatus || 'Pending',
            workerReceiveDate: item.workerReceiveDate,
            customerDeliveryDate: item.customerDeliveryDate,
            note: item.note || '-',
            newItemTag: item.newItemTag,
            customer: customer,
            item: item,
            imageUrl: item.imageUrl || '',
          });
        });
      } else {
        flattened.push({
          customerId: customer._id,
          orderId: customer.orderId,
          receiveDate: customer.orderReceiveDate,
          customerName: customer.name,
          itemName: '-',
          itemCode: '-',
          size: '-',
          caratPurity: '-',
          color: '-',
          weight: '0g / 0pcs',
          workerName: '-',
          workerIssueDate: null,
          orderStatus: 'Pending',
          workerReceiveDate: null,
          customerDeliveryDate: null,
          note: '-',
          newItemTag: null,
          customer: customer,
          item: null,
          imageUrl: null,
        });
      }
    });

    return flattened;
  });

  statusFilteredData = computed(() => {
    const status = this.activeStatus();
    const data = this.tableData();

    if (!status) return data;

    return data.filter((row) => row.orderStatus === status);
  });

  columnFilteredData = computed(() => {
    const data = this.statusFilteredData();
    const filters = this.columnFilters();

    return data.filter((row) => {
      return Object.keys(filters).every((key) => {
        const filterValue = filters[key]?.toLowerCase() || '';
        if (!filterValue) return true;

        const cellValue = String(row[key] || '').toLowerCase();
        return cellValue.includes(filterValue);
      });
    });
  });

  sortedData = computed(() => {
    const data = [...this.columnFilteredData()];
    const sortCol = this.sortColumn();
    const sortDir = this.sortDirection();

    if (!sortCol) return data;

    return data.sort((a, b) => {
      let valueA = a[sortCol];
      let valueB = b[sortCol];

      if (sortCol.includes('Date')) {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      } else if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB ? valueB.toLowerCase() : '';
      }

      if (valueA < valueB) {
        return sortDir === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDir === 'asc' ? 1 : -1;
      }
      return 0;
    });
  });

  totalItems = computed(() => this.sortedData().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));

  paginatedData = computed(() => {
    const data = this.sortedData();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return data.slice(start, end);
  });

  paginationNumbers = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  ngOnInit(): void {
    forkJoin([this._itemsS.getItems(), this._staffS.getStaffs()]).subscribe({
      next: ([itemsRes, staffRes]) => {
        this.items.set(itemsRes.data || []);
        this.staffs.set(staffRes.data || []);
      },
      error: (err) => {
        this._toast.error('Error loading initial data: ' + (err.error?.message || err.message));
        this.items.set([]);
        this.staffs.set([]);
      },
    });
    this.loadCustomers();

    const modalElement = document.getElementById('noteModal');
    if (modalElement) {
      this.noteModel = new bootstrap.Modal(modalElement);

      modalElement.addEventListener('shown.bs.modal', () => {
        setTimeout(() => {
          const noteInput = document.querySelector('#noteModal') as HTMLElement;
          if (noteInput) {
            noteInput.focus();
          }
        }, 100);
      });
    }
  }

  openNoteModel(note: string): void {
    if (!this.noteModel) return;
    this.noteModel.show();
    const noteInput = document.getElementById('noteContent');
    if (noteInput) {
      noteInput.innerText = note || '-';
    }
  }

  private loadCustomers(): void {
    this.loading.set(true);
    this._customersS.getCustomers().subscribe({
      next: (res) => {
        this.customers.set(res.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        this._toast.error('Error loading customer data: ' + (err.error?.message || err.message));
        this.customers.set([]);
        this.loading.set(false);
      },
    });
  }

  onSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
  }

  getSortIcon(column: string): string {
    if (this.sortColumn() !== column) return 'bi bi-arrow-down-up';
    return this.sortDirection() === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
  }

  onColumnFilter(column: string, value: string): void {
    const filters = { ...this.columnFilters() };
    if (value) {
      filters[column] = value;
    } else {
      delete filters[column];
    }
    this.columnFilters.set(filters);
    this.currentPage.set(1);
  }

  getColumnFilterValue(column: string): string {
    return this.columnFilters()[column] || '';
  }

  onStatusFilter(status: string): void {
    this.activeStatus.set(this.activeStatus() === status ? null : status);
    this.currentPage.set(1);
  }

  onResetStatusFilter(): void {
    this.activeStatus.set(null);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage.set(itemsPerPage);
    this.currentPage.set(1);
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '-';
      return dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  }

  shareOrder(customer: any, item: any, itemName: any): void {
    const orderDetails = {
      orderId: customer.orderId,
      customerName: customer.name,
      itemName: itemName,
      itemCode: item.itemCode,
      orderStatus: item.orderStatus,
    };
    const shareText = `Order: ${orderDetails.orderId}\n` + `Customer: ${orderDetails.customerName}\n` + `Item: ${orderDetails.itemName} (${orderDetails.itemCode})\n` + `Status: ${orderDetails.orderStatus}`;
    const phoneNumber = customer.mobile?.replace(/\D/g, "") || "";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  }

  openChat(customer: any, item: any): void {
    console.log('Opening chat for:', customer.name, item.itemName);
    this._toast.warning(`Opening chat for ${customer.name} - ${item.itemName}`);
  }

  addCustomer(): void {
    this._router.navigate(['/oms/customers-form']);
  }

  editCustomer(id: string): void {
    console.log('Navigating to edit customer with ID:', id);
    this._router.navigate(['/oms/customers-form'], { queryParams: { id } });
  }

  getColumnWidth(columnKey: string): string {
    const widths: Record<string, string> = {
      orderId: '100px',
      receiveDate: '100px',
      customerName: '250px',
      itemName: '150px',
      itemCode: '50px',
      size: '100px',
      caratPurity: '50px',
      color: '100px',
      weight: '100px',
      workerName: '150px',
      workerIssueDate: '100px',
      orderStatus: '150px',
      workerReceiveDate: '100px',
      customerDeliveryDate: '100px',
      note: '200px',
      share: '80px',
      newItemTag: '50px',
      chat: '80px',
    };
    return widths[columnKey] || '120px';
  }

  getNoteText(note: string): string {
    if (note.length > 10) {
      return note.substring(0, 10) + '...';
    }
    return note;
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  getItemName(itemCode: string): string {
    const item = this.items().find((i) => i.itemcode === itemCode);
    return item ? item.name : itemCode;
  }

  getStaffName(staffId: string): string {
    const staff = this.staffs().find((s) => s._id === staffId);
    return staff ? staff.name : staffId;
  }
}
