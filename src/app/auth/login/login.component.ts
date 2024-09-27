import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private _snackBar = inject(MatSnackBar);
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe((response: any) => {
        if (response?.error) {
          this._snackBar.open(JSON.stringify(response?.error), 'close');
          return;
        }
        this.authService.storeAuth(response.access_token, this.loginForm.value.email);
        this.router.navigate(['/']);

      }, (error) => {
        this._snackBar.open(error.error.message, 'close');
      });
    }

  }
}
