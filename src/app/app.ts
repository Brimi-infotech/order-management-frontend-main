import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from './components/loader/loader';
import { Loader as LoaderS } from './services/loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  protected readonly _loaderService = inject(LoaderS);
}
