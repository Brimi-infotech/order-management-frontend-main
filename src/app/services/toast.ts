import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class Toast {
  success(message: string) {
    this.toast('success', message);
  }

  error(message: string) {
    this.toast('error', message);
  }

  warning(message: string) {
    this.toast('warning', message);
  }

  toast(typeIcon: 'success' | 'warning' | 'error', message: string, timerProgressBar: boolean = false) {
    Swal.fire({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      icon: typeIcon,
      timerProgressBar,
      timer: 2000,
      title: message
    })
  }

  cofirmationDialog(title: string, text: string) {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
  }
}
