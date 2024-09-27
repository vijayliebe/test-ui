import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { TodosComponent } from './todos/todos.component';
import { AuthService } from './auth/auth.service'; 
import { FormsModule } from '@angular/forms';
import { TodosService } from './todos/todos.service';
import {provideAnimations} from '@angular/platform-browser/animations';
import { ConfirmDialogComponent } from './dialog/confirm-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthGuardService } from './auth/auth-guard.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [AppComponent, 
    LoginComponent, 
    RegisterComponent, 
    TodosComponent,
    ConfirmDialogComponent
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule, 
    MatPaginatorModule,
    MatListModule,
    MatCardModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatSortModule
  ],
  providers: [AuthService, TodosService, provideAnimations(), provideHttpClient(), AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule {}
