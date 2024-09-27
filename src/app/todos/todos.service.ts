import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TodosService {
    constructor(private http: HttpClient, private authService: AuthService) { }
    
    getHeaders() {
        const token = this.authService.getAuthDetails().token;  
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`  
        });
        return headers;
    }

    getTodos(pageIndex: number, pageSize: number, searchQuery?:string, sortField?:string, sortOrder?:string) {
        const offset = (pageIndex * pageSize);
        return this.http.get(`http://localhost:3000/todos?offset=${offset}&limit=${pageSize}&search=${searchQuery}&sortField=${sortField}&sortOrder=${sortOrder}`);
    }

    addTodo(todo: any) {
        return this.http.post('http://localhost:3000/todos', todo, { headers: this.getHeaders() });
    }

    updateTodo(id: number, todo: any) {
        return this.http.put(`http://localhost:3000/todos/${id}`, todo, { headers: this.getHeaders() });
    }

    deleteTodo(id: number) {
        return this.http.delete(`http://localhost:3000/todos/${id}`, { headers: this.getHeaders() });
    }
}
