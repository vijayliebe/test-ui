import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    // Create spies for AuthService and Router
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'storeAuth']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [BrowserModule, BrowserAnimationsModule, ReactiveFormsModule, MatSnackBarModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        // MatSnackBar is provided via inject() in the component
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Inject the spies and services
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar);

    fixture.detectChanges();
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm).toBeTruthy();
    expect(component.loginForm.controls['email']).toBeTruthy();
    expect(component.loginForm.controls['password']).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate email and password fields', () => {
    const emailControl = component.loginForm.controls['email'];
    const passwordControl = component.loginForm.controls['password'];

    // Invalid when empty
    emailControl.setValue('');
    passwordControl.setValue('');
    expect(component.loginForm.valid).toBeFalse();

    // Invalid email format
    emailControl.setValue('invalidEmail');
    expect(emailControl.valid).toBeFalse();

    // Valid email and password
    emailControl.setValue('test@example.com');
    passwordControl.setValue('password123');
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should not submit the form when invalid', () => {
    component.loginForm.controls['email'].setValue('');
    component.loginForm.controls['password'].setValue('');

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call authService.login with correct credentials when form is valid', () => {
    const email = 'test@example.com';
    const password = 'password123';
    component.loginForm.controls['email'].setValue(email);
    component.loginForm.controls['password'].setValue(password);

    authService.login.and.returnValue(of({ access_token: 'fake-token' }));

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(email, password);
  });

  it('should store auth token and navigate to home on successful login', () => {
    const email = 'test@example.com';
    const password = 'password123';
    component.loginForm.controls['email'].setValue(email);
    component.loginForm.controls['password'].setValue(password);

    authService.login.and.returnValue(of({ access_token: 'fake-token' }));

    component.onSubmit();

    expect(authService.storeAuth).toHaveBeenCalledWith('fake-token', email);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should display error message when login fails with server error', () => {
    spyOn(component['_snackBar'], 'open');
    const email = 'test@example.com';
    const password = 'password123';
    component.loginForm.controls['email'].setValue(email);
    component.loginForm.controls['password'].setValue(password);

    const errorResponse = { error: { message: 'Invalid credentials' } };
    authService.login.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(component['_snackBar'].open).toHaveBeenCalledWith('Invalid credentials', 'close');
    expect(authService.storeAuth).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should display error message when response contains error', () => {
    spyOn(component['_snackBar'], 'open');
    const email = 'test@example.com';
    const password = 'password123';
    component.loginForm.controls['email'].setValue(email);
    component.loginForm.controls['password'].setValue(password);

    const responseWithError = { error: 'Some error occurred' };
    authService.login.and.returnValue(of(responseWithError));

    component.onSubmit();

    expect(component['_snackBar'].open).toHaveBeenCalledWith(JSON.stringify('Some error occurred'), 'close');
    expect(authService.storeAuth).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
