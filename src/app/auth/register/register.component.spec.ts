import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RegisterComponent } from './register.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    // Create spies for AuthService and Router
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [BrowserModule, BrowserAnimationsModule, ReactiveFormsModule, MatSnackBarModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        // MatSnackBar is provided via inject() in the component
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    // Inject the spies and services
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar);

    fixture.detectChanges();
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.registerForm).toBeTruthy();
    expect(component.registerForm.controls['email']).toBeTruthy();
    expect(component.registerForm.controls['password']).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should validate email and password fields', () => {
    const emailControl = component.registerForm.controls['email'];
    const passwordControl = component.registerForm.controls['password'];

    // Invalid when empty
    emailControl.setValue('');
    passwordControl.setValue('');
    expect(component.registerForm.valid).toBeFalse();

    // Invalid email format
    emailControl.setValue('invalidEmail');
    expect(emailControl.valid).toBeFalse();

    // Valid email and password
    emailControl.setValue('test@example.com');
    passwordControl.setValue('password123');
    expect(component.registerForm.valid).toBeTrue();
  });

  it('should not submit the form when invalid', () => {
    component.registerForm.controls['email'].setValue('');
    component.registerForm.controls['password'].setValue('');
    
    component.onSubmit();

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should call authService.register with correct credentials when form is valid', () => {
    const email = 'test@example.com';
    const password = 'password123';
    component.registerForm.controls['email'].setValue(email);
    component.registerForm.controls['password'].setValue(password);

    authService.register.and.returnValue(of({ message: 'User registered successfully' }));

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith(email, password);
  });

  it('should navigate to login page upon successful registration', () => {
    const email = 'test@example.com';
    const password = 'password123';
    component.registerForm.controls['email'].setValue(email);
    component.registerForm.controls['password'].setValue(password);

    authService.register.and.returnValue(of({ message: 'User registered successfully' }));

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should display error message when registration fails with server error', () => {
    spyOn(component['_snackBar'], 'open');
    const email = 'test@example.com';
    const password = 'password123';
    component.registerForm.controls['email'].setValue(email);
    component.registerForm.controls['password'].setValue(password);

    const errorResponse = { error: { message: 'Email already exists' } };
    authService.register.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(component['_snackBar'].open).toHaveBeenCalledWith('Email already exists', 'close');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should display error message when response contains error', () => {
    spyOn(component['_snackBar'], 'open');
    const email = 'test@example.com';
    const password = 'password123';
    component.registerForm.controls['email'].setValue(email);
    component.registerForm.controls['password'].setValue(password);

    const responseWithError = { error: 'Registration error occurred' };
    authService.register.and.returnValue(of(responseWithError));

    component.onSubmit();

    expect(component['_snackBar'].open).toHaveBeenCalledWith(JSON.stringify('Registration error occurred'), 'close');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
