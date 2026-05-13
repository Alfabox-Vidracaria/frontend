import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface CreateMaintenancePayload {
  type: 'NORMAL' | 'WARRANTY';
  clientId: string;
  serviceOrderId?: string | null;
  maintenanceDate: string;
  observation?: string | null;
  street?: string | null;
  addressNumber?: string | null;
  neighborhood?: string | null;
  complement?: string | null;
  city?: string | null;
  productDescription?: string | null;
  productAmount?: number | null;
  laborAmount?: number | null;
}

export interface MaintenanceResponse {
  id: string;
  code: string;
  type: string;
  maintenanceDate: string;
  totalAmount: number;
}

export type MaintenanceType = 'NORMAL' | 'WARRANTY';
export type MaintenancePaymentStatus = 'PAGO' | 'PARCIAL' | 'ABERTO';
export type MaintenanceExecutionStatus = 'PENDENTE' | 'CONCLUIDO';

export interface MaintenanceListItem {
  id: string;
  code: string;
  maintenanceDate: string;
  clientName: string;
  type: MaintenanceType;
  totalAmount: number;
  laborAmount: number;
  productAmount: number;
  paidAmount: number;
  paymentStatus: MaintenancePaymentStatus;
  executionStatus: MaintenanceExecutionStatus;
  assemblerNames: string | null;
}

// ── Detalhe completo da Manutenção ───────────────────────────────────────

export interface MaintenanceDetailPhone {
  id: string;
  number: string;
}

export interface MaintenanceDetailClient {
  id: string;
  name: string;
  personType: string;
  document: string | null;
  isActive: boolean;
  phones: MaintenanceDetailPhone[];
}

export interface MaintenanceDetailAddress {
  street: string | null;
  addressNumber: string | null;
  neighborhood: string | null;
  complement: string | null;
  city: string | null;
}

export interface MaintenanceDetailAssembler {
  id: string;
  name: string;
}

export interface MaintenanceDetailPayment {
  id: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  method: string;
  installments: number | null;
  maintenanceId: string;
}

export interface MaintenanceDetail {
  id: string;
  code: string;
  type: MaintenanceType;
  serviceOrderCode: string | null;
  client: MaintenanceDetailClient;
  address: MaintenanceDetailAddress;
  maintenanceDate: string; // YYYY-MM-DD
  observation: string | null;
  productDescription: string | null;
  productAmount: number;
  laborAmount: number;
  totalAmount: number;
  payments: MaintenanceDetailPayment[];
  paidAmount: number;
  paymentStatus: MaintenancePaymentStatus;
  executionDate: string | null; // YYYY-MM-DD
  assemblers: MaintenanceDetailAssembler[];
  executionStatus: MaintenanceExecutionStatus;
  vidracariaAmount: number;
  assemblersTotalAmount: number;
  amountPerAssembler: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/maintenances`;

  findAll(filters: {
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Observable<MaintenanceListItem[]> {
    let params = new HttpParams();
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.search) params = params.set('search', filters.search);
    return this.http.get<MaintenanceListItem[]>(this.baseUrl, { params });
  }

  findByCode(code: string): Observable<MaintenanceDetail> {
    return this.http.get<MaintenanceDetail>(`${this.baseUrl}/${code}`);
  }

  create(payload: CreateMaintenancePayload): Observable<MaintenanceResponse> {
    return this.http.post<MaintenanceResponse>(this.baseUrl, payload);
  }

  registerExecution(
    maintenanceId: string,
    payload: { executionDate: string; assemblerIds: string[] },
  ): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/${maintenanceId}/execution`, payload);
  }

  deleteExecution(maintenanceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${maintenanceId}/execution`);
  }

  createPayment(maintenanceId: string, payload: object): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${maintenanceId}/payments`, payload);
  }

  updatePayment(maintenanceId: string, paymentId: string, payload: object): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/${maintenanceId}/payments/${paymentId}`, payload);
  }

  deletePayment(maintenanceId: string, paymentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${maintenanceId}/payments/${paymentId}`);
  }

  getPayments(maintenanceId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.baseUrl}/${maintenanceId}/payments`);
  }
}
