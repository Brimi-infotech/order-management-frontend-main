import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';
import { Toast } from '../../services/toast';

@Component({
  selector: 'app-login',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _authService = inject(Auth);
  private readonly _toast = inject(Toast);

  loginForm = this._formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  get username(): FormControl {
    return this.loginForm.get('username') as FormControl;
  }

  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  loginSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginData: { username: string; password: string } = {
      username: this.username.value,
      password: this.password.value,
    };

    this._authService.login(loginData).subscribe({
      next: (res) => {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        this._toast.success('Login Successfull');
      },
      error: (err) => {
        this._toast.error(err.error.message);
      },
      complete: () => {
        this._router.navigate(['/oms/dashboard']);
      },
    });
  }
}
