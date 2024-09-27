import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { TodosComponent } from './todos/todos.component';
import { AuthGuardService } from './auth/auth-guard.service';

const routes: Routes = [
  { path: 'todos', component: TodosComponent, canActivate: [AuthGuardService] },
  { path: 'auth/login', component: LoginComponent, canActivate: [AuthGuardService] },
  { path: 'auth/register', component: RegisterComponent, canActivate: [AuthGuardService] },
  {
    path: '**',
    redirectTo: 'todos'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }