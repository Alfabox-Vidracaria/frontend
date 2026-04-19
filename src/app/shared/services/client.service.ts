import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Client, CreateClient, UpdateClient } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/clients`;

  create(client: CreateClient): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, client);
  }

  findAll(isActive?: boolean, search?: string): Observable<Client[]> {
    let params = new HttpParams();
    if (isActive !== undefined) {
      params = params.set('active', String(isActive));
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Client[]>(this.baseUrl, { params });
  }

  findById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  update(id: string, client: UpdateClient): Observable<Client> {
    return this.http.patch<Client>(`${this.baseUrl}/${id}`, client);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
