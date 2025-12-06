import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Loader {
  public loading = signal<boolean>(false);
}
