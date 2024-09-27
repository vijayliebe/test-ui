import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from './auth/auth.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getAuthDetails', 'isAuthenticated', 'logout']);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    // Inject the mocked AuthService
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated and set userEmail', () => {
      const mockAuthDetails = { email: 'test@example.com', token: 'fake-token' };
      authService.getAuthDetails.and.returnValue(mockAuthDetails);
      authService.isAuthenticated.and.returnValue(true);

      const isAuth = component.isAuthenticated();

      expect(authService.getAuthDetails).toHaveBeenCalled();
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(component.userEmail).toBe('test@example.com');
      expect(isAuth).toBeTrue();
    });

    it('should return false when user is not authenticated and userEmail should be empty', () => {
      authService.getAuthDetails.and.returnValue({ email: '', token: '' });
      authService.isAuthenticated.and.returnValue(false);

      const isAuth = component.isAuthenticated();

      expect(authService.getAuthDetails).toHaveBeenCalled();
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(component.userEmail).toBe('');
      expect(isAuth).toBeFalse();
    });
  });

  describe('logout', () => {
    it('should call authService.logout', () => {
      component.logout();

      expect(authService.logout).toHaveBeenCalled();
    });
  });
});
