import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private _snackBar = inject(MatSnackBar);
  registerForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value.email, this.registerForm.value.password).subscribe((response: any) => {
        if (response?.error) {
          this._snackBar.open(JSON.stringify(response?.error), 'close');
          return;
        }
        this.router.navigate(['/auth/login']);

      }, (error) => {
        this._snackBar.open(error.error.message, 'close');
      });
    }
  }
}
