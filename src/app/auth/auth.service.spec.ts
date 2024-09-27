import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests remain
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#login', () => {
    it('should send a POST request for login', () => {
      const mockResponse = { token: '12345' };
      const email = 'test@test.com';
      const password = 'password';

      service.login(email, password).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });

      req.flush(mockResponse);
    });
  });

  describe('#register', () => {
    it('should send a POST request for register', () => {
      const mockResponse = { token: '12345' };
      const email = 'test@test.com';
      const password = 'password';

      service.register(email, password).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });

      req.flush(mockResponse);
    });
  });

  describe('#logout', () => {
    it('should clear localStorage on logout', () => {
      spyOn(localStorage, 'clear');
      service.logout();
      expect(localStorage.clear).toHaveBeenCalled();
    });
  });

  describe('#storeAuth', () => {
    it('should store token and email in localStorage', () => {
      const token = '12345';
      const email = 'test@test.com';
      spyOn(localStorage, 'setItem');

      service.storeAuth(token, email);

      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', token);
      expect(localStorage.setItem).toHaveBeenCalledWith('email', email);
    });
  });

  describe('#isAuthenticated', () => {
    it('should return true if access_token is stored in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue('12345');
      const isAuthenticated = service.isAuthenticated();
      expect(isAuthenticated).toBeTrue();
    });

    it('should return false if access_token is not stored in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      const isAuthenticated = service.isAuthenticated();
      expect(isAuthenticated).toBeFalse();
    });
  });

  describe('#getAuthDetails', () => {
    it('should return auth details from localStorage', () => {
      spyOn(localStorage, 'getItem').and.callFake((key) => {
        switch (key) {
          case 'access_token':
            return '12345';
          case 'email':
            return 'test@test.com';
          default:
            return null;
        }
      });

      const authDetails = service.getAuthDetails();
      expect(authDetails.token).toBe('12345');
      expect(authDetails.email).toBe('test@test.com');
    });

    it('should return null values if no auth details are in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      const authDetails = service.getAuthDetails();
      expect(authDetails.token).toBeNull();
      expect(authDetails.email).toBeNull();
    });
  });
});
