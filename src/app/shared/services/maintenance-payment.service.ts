import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  MaintenancePayment,
  CreateMaintenancePayment,
  UpdateMaintenancePayment,
} from '../models/maintenance-payment.model';

@Injectable({ providedIn: 'root' })
export class MaintenancePaymentService {
  private readonly http = inject(HttpClient);

  private url(maintenanceId: string): string {
    return `${environment.apiUrl}/maintenances/${maintenanceId}/payments`;
  }

  /**
   * Lista todos os pagamentos de uma manutenção.
   * GET /api/maintenances/:maintenanceId/payments
   */
  findAll(maintenanceId: string): Observable<MaintenancePayment[]> {
    return this.http.get<MaintenancePayment[]>(this.url(maintenanceId));
  }

  /**
   * Cria um pagamento para uma manutenção.
   * POST /api/maintenances/:maintenanceId/payments
   */
  create(maintenanceId: string, payload: CreateMaintenancePayment): Observable<MaintenancePayment> {
    return this.http.post<MaintenancePayment>(this.url(maintenanceId), payload);
  }

  /**
   * Atualiza parcialmente um pagamento.
   * PATCH /api/maintenances/:maintenanceId/payments/:id
   */
  update(
    maintenanceId: string,
    paymentId: string,
    payload: UpdateMaintenancePayment,
  ): Observable<MaintenancePayment> {
    return this.http.patch<MaintenancePayment>(`${this.url(maintenanceId)}/${paymentId}`, payload);
  }

  /**
   * Exclui um pagamento.
   * DELETE /api/maintenances/:maintenanceId/payments/:id
   */
  delete(maintenanceId: string, paymentId: string): Observable<void> {
    return this.http.delete<void>(`${this.url(maintenanceId)}/${paymentId}`);
  }
}
