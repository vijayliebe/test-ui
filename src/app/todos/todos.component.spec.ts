import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { TodosComponent } from './todos.component';
import { TodosService } from './todos.service';
import { AuthService } from '../auth/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { of, throwError, Subject } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog.component';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TodosComponent', () => {
  let component: TodosComponent;
  let fixture: ComponentFixture<TodosComponent>;
  let todosService: jasmine.SpyObj<TodosService>;
  let authService: jasmine.SpyObj<AuthService>;
  let snackBar: MatSnackBar;
  let dialog: MatDialog;
  let liveAnnouncer: LiveAnnouncer;

  beforeEach(async () => {
    const todosServiceSpy = jasmine.createSpyObj('TodosService', ['getTodos', 'addTodo', 'updateTodo', 'deleteTodo']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const liveAnnouncerSpy = jasmine.createSpyObj('LiveAnnouncer', ['announce']);

    await TestBed.configureTestingModule({
      declarations: [TodosComponent],
      imports: [
        MatSnackBarModule,
        MatDialogModule,
        MatPaginatorModule,
        MatSortModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: TodosService, useValue: todosServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LiveAnnouncer, useValue: liveAnnouncerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignore template errors due to missing components/directives
    }).compileComponents();

    fixture = TestBed.createComponent(TodosComponent);
    component = fixture.componentInstance;

    // Inject services
    todosService = TestBed.inject(TodosService) as jasmine.SpyObj<TodosService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    snackBar = TestBed.inject(MatSnackBar);
    dialog = TestBed.inject(MatDialog);
    liveAnnouncer = TestBed.inject(LiveAnnouncer);

    // Set up spies and default return values
    todosService.getTodos.and.returnValue(of({ rows: [], count: 0 }));
    authService.isAuthenticated.and.returnValue(true);

    // Set up paginator
    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
      length: 0,
    } as MatPaginator;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize and load todos', () => {
      spyOn(component, 'getTodos');
      component.ngOnInit();
      expect(component.getTodos).toHaveBeenCalledWith(component.currentPage, component.pageSize);
    });

    it('should set up searchSubject with throttleTime', fakeAsync(() => {
      spyOn(component, 'getTodos');
      component.ngOnInit();

      component.applyFilter({ target: { value: 'test' } } as any);
      tick(300); // Advance time by 300ms due to throttleTime
      expect(component.searchQuery).toBe('test');
      expect(component.getTodos).toHaveBeenCalledWith(component.currentPage, component.pageSize, 'test', component.sortField, component.sortOrder);
    }));
  });

  describe('getTodos', () => {
    it('should fetch todos and update dataSource', () => {
      const mockData = { rows: [{ id: 1, title: 'Test Todo', description: 'Test Description' }], count: 1 };
      todosService.getTodos.and.returnValue(of(mockData));

      component.getTodos(0, 10);

      expect(todosService.getTodos).toHaveBeenCalledWith(0, 10, undefined, undefined, undefined);
      expect(component.dataSource.data).toEqual(mockData.rows);
      expect(component.totalItems).toBe(mockData.count);
    });

    it('should handle errors when fetching todos', () => {
      spyOn(component['_snackBar'], 'open');
      todosService.getTodos.and.returnValue(throwError(() => new Error('Error fetching todos')));

      component.getTodos(0, 10);

      expect(component['_snackBar'].open).toHaveBeenCalledWith('Error fetching todos', 'close');
    });
  });

  describe('onPageChange', () => {
    it('should update pagination and fetch todos', () => {
      spyOn(component, 'getTodos');
      const pageEvent: PageEvent = { pageIndex: 1, pageSize: 5, length: 10 };
      component.onPageChange(pageEvent);

      expect(component.currentPage).toBe(1);
      expect(component.pageSize).toBe(5);
      expect(component.getTodos).toHaveBeenCalledWith(1, 5, component.searchQuery, component.sortField, component.sortOrder);
    });
  });

  describe('sortChange', () => {
    it('should update sorting and fetch todos', () => {
      spyOn(component, 'getTodos');
      const sortState: Sort = { active: 'title', direction: 'asc' };
      component.sortChange(sortState);

      expect(component.sortField).toBe('title');
      expect(component.sortOrder).toBe('asc');
      expect(liveAnnouncer.announce).toHaveBeenCalledWith('Sorted ascending');
      expect(component.getTodos).toHaveBeenCalledWith(component.currentPage, component.pageSize, component.searchQuery, 'title', 'asc');
    });

    it('should announce sorting cleared when direction is empty', () => {
      const sortState: Sort = { active: 'title', direction: '' };
      component.sortChange(sortState);

      expect(liveAnnouncer.announce).toHaveBeenCalledWith('Sorting cleared');
    });
  });

  describe('applyFilter', () => {
    it('should update searchQuery and fetch todos after throttleTime', fakeAsync(() => {
      const THROTTLE: number = 300;
      spyOn(component, 'getTodos');
      component.applyFilter({ target: { value: 'search term' } } as any);

      tick(THROTTLE); // Advance time due to throttleTime
      expect(component.searchQuery).toBe('search term');
      expect(component.getTodos).toHaveBeenCalledWith(component.currentPage, component.pageSize, 'search term', component.sortField, component.sortOrder);
    }));
  });

  describe('addTodo', () => {
    it('should add a new todo and refresh the list', () => {
      spyOn(component, 'getTodos');
      component.newTodo = { title: 'New Todo', description: 'New Description' };
      todosService.addTodo.and.returnValue(of({}));

      component.addTodo();

      expect(todosService.addTodo).toHaveBeenCalledWith({ title: 'New Todo', description: 'New Description' });
      expect(component.getTodos).toHaveBeenCalledWith(component.currentPage, component.pageSize, component.searchQuery, component.sortField, component.sortOrder);
      expect(component.newTodo).toEqual({ title: '', description: '' });
    });

    it('should handle errors when adding a todo', () => {
      spyOn(component['_snackBar'], 'open');
      component.newTodo = { title: 'New Todo', description: 'New Description' };
      todosService.addTodo.and.returnValue(throwError(() => new Error('Error adding todo')));

      component.addTodo();

      expect(component['_snackBar'].open).toHaveBeenCalledWith('Error adding todo', 'close');
    });
  });

  describe('deleteTodo', () => {
    it('should open confirmation dialog and delete todo upon confirmation', () => {
      spyOn(component, 'getTodos');
      spyOn(dialog, 'open').and.returnValue({
        afterClosed: () => of(true),
      } as any);
      todosService.deleteTodo.and.returnValue(of({}));

      component.deleteTodo(1);

      expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, jasmine.any(Object));
      expect(todosService.deleteTodo).toHaveBeenCalledWith(1);
      expect(component.getTodos).toHaveBeenCalledWith(component.currentPage, component.pageSize, component.searchQuery, component.sortField, component.sortOrder);
    });

    it('should not delete todo if confirmation is cancelled', () => {
      spyOn(dialog, 'open').and.returnValue({
        afterClosed: () => of(false),
      } as any);

      component.deleteTodo(1);

      expect(todosService.deleteTodo).not.toHaveBeenCalled();
    });
  });

  describe('onEditTodo', () => {
    it('should set editTodoId and populate newTodo with selected todo', () => {
      const todo = { id: 1, title: 'Edit Todo', description: 'Edit Description' };
      component.onEditTodo(todo);

      expect(component.editTodoId).toBe(1);
      expect(component.newTodo.title).toBe('Edit Todo');
      expect(component.newTodo.description).toBe('Edit Description');
    });
  });

  describe('editTodo', () => {
    it('should update the todo and refresh the list', () => {
      spyOn(component, 'getTodos');
      component.editTodoId = 1;
      component.newTodo = { title: 'Updated Todo', description: 'Updated Description' };
      todosService.updateTodo.and.returnValue(of({}));

      component.editTodo();

      expect(todosService.updateTodo).toHaveBeenCalledWith(1, { title: 'Updated Todo', description: 'Updated Description' });
      expect(component.getTodos).toHaveBeenCalledWith(component.currentPage, component.pageSize, component.searchQuery, component.sortField, component.sortOrder);
      expect(component.editTodoId).toBe(0);
      expect(component.newTodo).toEqual({ title: '', description: '' });
    });

    it('should handle errors when updating a todo', () => {
      spyOn(component['_snackBar'], 'open');
      component.editTodoId = 1;
      component.newTodo = { title: 'Updated Todo', description: 'Updated Description' };
      todosService.updateTodo.and.returnValue(throwError(() => new Error('Error updating todo')));

      component.editTodo();

      expect(component['_snackBar'].open).toHaveBeenCalledWith('Error updating todo', 'close');
    });
  });

  describe('onFormCancel', () => {
    it('should reset the form and editTodoId', () => {
      component.editTodoId = 1;
      component.newTodo = { title: 'Temp', description: 'Temp' };

      const event = { preventDefault: () => {} } as Event;
      spyOn(event, 'preventDefault');
      component.onFormCancel(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.editTodoId).toBe(0);
      expect(component.newTodo).toEqual({ title: '', description: '' });
    });
  });

  describe('isAuthenticated', () => {
    it('should include action column if authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      component.displayedColumns = ['id', 'title', 'description', 'updatedAt'];

      component.isAuthenticated();

      expect(component.displayedColumns.includes('action')).toBeTrue();
    });

    it('should remove action column if not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      component.displayedColumns = ['id', 'title', 'description', 'updatedAt', 'action'];

      component.isAuthenticated();

      expect(component.displayedColumns.includes('action')).toBeFalse();
    });
  });
});
