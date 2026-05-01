import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ExecutionReportItem {
  id: string;
  executionDate: string;
  osCode: string;
  osId: string;
  totalAmount: number;
  splitAmount: number;
  assemblerCount: number;
  assemblers: string;
}

export interface ExecutionsReportResponse {
  totalPeriodAmount: number;
  totalAssemblerAmount: number;
  executions: ExecutionReportItem[];
}

export interface ExecutionsReportFilter {
  startDate: string;
  endDate: string;
  assemblerId?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  getExecutionsReport(filters: ExecutionsReportFilter): Observable<ExecutionsReportResponse> {
    let params = new HttpParams()
      .set('startDate', filters.startDate)
      .set('endDate', filters.endDate);

    if (filters.assemblerId) {
      params = params.set('assemblerId', filters.assemblerId);
    }

    return this.http.get<ExecutionsReportResponse>(`${this.baseUrl}/executions`, { params });
  }

  getOrdersReport(filters: OrdersReportFilter): Observable<OrdersReportResponse> {
    let params = new HttpParams()
      .set('startDate', filters.startDate)
      .set('endDate', filters.endDate);

    if (filters.sellerId) {
      params = params.set('sellerId', filters.sellerId);
    }

    return this.http.get<OrdersReportResponse>(`${this.baseUrl}/orders`, { params });
  }
}

export interface OrderReportItem {
  id: string;
  code: string;
  orderDate: string;
  clientName: string;
  sellerName: string;
  totalAmount: number;
}

export interface OrdersReportResponse {
  totalAmount: number;
  orders: OrderReportItem[];
}

export interface OrdersReportFilter {
  startDate: string;
  endDate: string;
  sellerId?: string;
}
