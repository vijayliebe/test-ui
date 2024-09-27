import { Component, ChangeDetectionStrategy, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
import { TodosService } from './todos.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog.component';
import { AuthService } from '../auth/auth.service';
import { MatSort, Sort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { LiveAnnouncer } from '@angular/cdk/a11y';

const THROTTLE: number = 300;

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css'],
})
export class TodosComponent implements OnInit, AfterViewInit {
  private _snackBar = inject(MatSnackBar);
  dialogRef: any;

  todos: any = [];
  editTodoId: number = 0;
  newTodo = { title: '', description: '' };
  displayedColumns: string[] = ['id', 'title', 'description', 'updatedAt'];
  dataSource = new MatTableDataSource<any>();


  sortField = 'id';
  sortOrder: any = 'asc';
  private _liveAnnouncer = inject(LiveAnnouncer);

  pageIndex = 0;
  searchQuery = '';
  searchSubject = new Subject<string>();

  totalItems = 0; // Total number of items (from API response)
  pageSize = 10;  // Number of items per page
  currentPage = 0; // Current page index
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private todosService: TodosService,
    private dialog: MatDialog,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.searchSubject
      .pipe(
        throttleTime(THROTTLE)
      )
      .subscribe((searchText) => {
        this.searchQuery = searchText;
        this.pageIndex = 0;
        this.getTodos(this.currentPage, this.pageSize, this.searchQuery, this.sortField, this.sortOrder);
      });

    this.getTodos(this.currentPage, this.pageSize);
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator; //Remove automatic paginator linking
    // this.dataSource.sort = this.sort;
  }

  getTodos(pageIndex: number, pageSize: number, searchQuery?: string, sortField?: string, sortOrder?: string): void {
    this.todosService.getTodos(pageIndex, pageSize, searchQuery, sortField, sortOrder).subscribe({
      next: (data) => {
        this.todos = data;
        this.dataSource.data = this.todos.rows;
        this.totalItems = this.todos.count;
        if(this.paginator){
          this.paginator.pageIndex = pageIndex; 
        }
      },
      error: (err) => {
        this._snackBar.open('Error fetching todos', 'close');
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getTodos(this.currentPage, this.pageSize, this.searchQuery, this.sortField, this.sortOrder);
  }

  sortChange(sortState: any) {
    this.sortField = sortState.active;
    this.sortOrder = sortState.direction
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
    this.getTodos(this.currentPage, this.pageSize, this.searchQuery, this.sortField, this.sortOrder);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim().toLowerCase());
  }

  addTodo() {
    this.todosService.addTodo(this.newTodo).subscribe({
      next: () => {
        this.getTodos(this.currentPage, this.pageSize, this.searchQuery, this.sortField, this.sortOrder);
        this.resetTodoForm();
      },
      error: (err) => {
        this._snackBar.open('Error adding todo', 'close');
      }
    });
  }

  deleteTodo(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: `Are you sure you want to delete the todo with id ${id}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.todosService.deleteTodo(id).subscribe({
          next: () => {
            this.getTodos(this.currentPage, this.pageSize, this.searchQuery, this.sortField, this.sortOrder);
            this._snackBar.open("Todo deleted successfully", 'close');
          },
          error: (err) => {
            this._snackBar.open('Error deleting todo', 'close');
          }
        });
      }
    });
  }

  onEditTodo(todo: any) {
    this.editTodoId = todo.id;
    this.newTodo.title = todo.title;
    this.newTodo.description = todo.description;
  }

  editTodo() {
    this.todosService.updateTodo(this.editTodoId, this.newTodo).subscribe({
      next: () => {
        this.getTodos(this.currentPage, this.pageSize, this.searchQuery, this.sortField, this.sortOrder);
        this.editTodoId = 0;
        this.resetTodoForm();
      },
      error: (err) => {
        this._snackBar.open('Error updating todo', 'close');
      }
    });
  }

  resetTodoForm() {
    this.newTodo = { title: '', description: '' };
  }

  onFormCancel(event: Event) {
    event.preventDefault();
    this.editTodoId = 0;
    this.resetTodoForm();
  }

  isAuthenticated() {
    const token = this.authService.isAuthenticated();
    if (token) {
      !this.displayedColumns.includes('action') && this.displayedColumns.push('action');
    } else {
      this.displayedColumns.splice(4, 1);
    }
    return token;
  }
}

