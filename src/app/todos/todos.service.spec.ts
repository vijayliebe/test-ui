import { TestBed } from '@angular/core/testing';
import { TodosService } from './todos.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import { HttpHeaders } from '@angular/common/http';

describe('TodosService', () => {
  let service: TodosService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getAuthDetails']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TodosService,
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    service = TestBed.inject(TodosService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  describe('getHeaders', () => {
    it('should return headers with Authorization token', () => {
      const mockToken = 'fake-jwt-token';
      authService.getAuthDetails.and.returnValue({ token: mockToken, email: 'admin@test.com' });

      const headers = service.getHeaders();

      expect(authService.getAuthDetails).toHaveBeenCalled();
      expect(headers instanceof HttpHeaders).toBeTrue();
      expect(headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    });
  });

  describe('getTodos', () => {
    it('should make GET request to fetch todos without search and sorting', () => {
      service.getTodos(0, 10).subscribe();

      const req = httpMock.expectOne(`http://localhost:3000/todos?offset=0&limit=10&search=undefined&sortField=undefined&sortOrder=undefined`);
      expect(req.request.method).toBe('GET');
      req.flush([]); // Respond with empty array
    });

    it('should make GET request with correct query parameters', () => {
      service.getTodos(1, 5, 'test', 'title', 'asc').subscribe();

      const req = httpMock.expectOne(`http://localhost:3000/todos?offset=5&limit=5&search=test&sortField=title&sortOrder=asc`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('addTodo', () => {
    it('should make POST request to add a new todo with Authorization header', () => {
      const mockToken = 'fake-jwt-token';
      authService.getAuthDetails.and.returnValue({ token: mockToken, email: 'admin@test.com' });

      const newTodo = { title: 'New Todo', description: 'New Description' };
      service.addTodo(newTodo).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/todos');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.body).toEqual(newTodo);
      req.flush({});
    });
  });

  describe('updateTodo', () => {
    it('should make PUT request to update a todo with Authorization header', () => {
      const mockToken = 'fake-jwt-token';
      authService.getAuthDetails.and.returnValue({ token: mockToken, email: 'admin@test.com' });

      const updatedTodo = { title: 'Updated Title', description: 'Updated Description' };
      service.updateTodo(1, updatedTodo).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/todos/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.body).toEqual(updatedTodo);
      req.flush({});
    });
  });

  describe('deleteTodo', () => {
    it('should make DELETE request to delete a todo with Authorization header', () => {
      const mockToken = 'fake-jwt-token';
      authService.getAuthDetails.and.returnValue({ token: mockToken, email: 'admin@test.com' });

      service.deleteTodo(1).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/todos/1');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });
  });
});
