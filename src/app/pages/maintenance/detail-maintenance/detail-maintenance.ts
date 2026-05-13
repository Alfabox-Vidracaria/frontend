import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmationService, MessageService } from 'primeng/api';

import { SHARED_CRUD_IMPORTS } from '../../../shared/constants/shared-crud-imports';
import {
  MaintenanceService,
  MaintenanceDetail,
  MaintenanceDetailPayment,
  MaintenanceType,
  MaintenancePaymentStatus,
  MaintenanceExecutionStatus,
} from '../../../shared/services/maintenance.service';
import { PhoneFormatPipe } from '../../../shared/pipes/phone-format.pipe';
import { CpfFormatPipe } from '../../../shared/pipes/cpf-format.pipe';
import { CnpjFormatPipe } from '../../../shared/pipes/cnpj-format.pipe';
import { fromApiDate } from '../../../shared/utils/date.utils';
import { whatsappUrl } from '../../../shared/utils/whatsapp.utils';
import { toCents, fromCents } from '../../../shared/utils/money.utils';
import { ServiceOrderPayment } from '../../../shared/models/service-order-payment.model';
import { PaymentDialogComponent } from '../../../shared/components/payment-dialog/payment-dialog';
import { MaintenanceExecutionDialogComponent } from '../../../shared/components/maintenance-execution-dialog/maintenance-execution-dialog';

@Component({
  selector: 'app-detail-maintenance',
  imports: [
    ...SHARED_CRUD_IMPORTS,
    CurrencyPipe,
    DatePipe,
    SkeletonModule,
    ProgressBarModule,
    PhoneFormatPipe,
    PaymentDialogComponent,
    MaintenanceExecutionDialogComponent,
  ],
  templateUrl: './detail-maintenance.html',
  styleUrl: './detail-maintenance.scss',
})
export class DetailMaintenance implements OnInit {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly maintenanceService = inject(MaintenanceService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  maintenance: MaintenanceDetail | null = null;
  loading = true;

  // ── Dialog Pagamento ──────────────────────────────────────────────────
  paymentDialogVisible = false;
  paymentDialogMode: 'create' | 'edit' = 'create';
  paymentDialogPayment: ServiceOrderPayment | null = null;

  // ── Dialog Execução ───────────────────────────────────────────────────
  executionDialogVisible = false;

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code')!;
    this.loadMaintenance(code);
  }

  private loadMaintenance(code: string): void {
    this.loading = true;
    this.maintenanceService.findByCode(code).subscribe({
      next: (data) => {
        this.maintenance = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar a manutenção.',
        });
        this.loading = false;
      },
    });
  }

  reload(): void {
    const code = this.maintenance?.code ?? this.route.snapshot.paramMap.get('code')!;
    this.loadMaintenance(code);
  }

  // ── Helpers de data ───────────────────────────────────────────────────

  toDate(apiDate: string): Date {
    return fromApiDate(apiDate);
  }

  // ── Helpers de display ────────────────────────────────────────────────

  get documentLabel(): string {
    return this.maintenance?.client.personType === 'J' ? 'CNPJ' : 'CPF';
  }

  formatDocument(): string {
    const client = this.maintenance?.client;
    if (!client?.document) return 'Não cadastrado';
    if (client.personType === 'J') return new CnpjFormatPipe().transform(client.document);
    return new CpfFormatPipe().transform(client.document);
  }

  formatPhone(number: string): string {
    return new PhoneFormatPipe().transform(number);
  }

  whatsappUrl(number: string): string {
    return whatsappUrl(number);
  }

  formatPersonType(): string {
    return this.maintenance?.client.personType === 'J' ? 'Pessoa Jurídica' : 'Pessoa Física';
  }

  getTypeLabel(type: MaintenanceType): string {
    return type === 'WARRANTY' ? 'GARANTIA' : 'PADRÃO';
  }

  getTypeSeverity(type: MaintenanceType): 'info' | undefined {
    return type === 'WARRANTY' ? 'info' : undefined;
  }

  getPaymentStatusSeverity(status: MaintenancePaymentStatus): 'success' | 'warn' | 'danger' {
    if (status === 'PAGO') return 'success';
    if (status === 'PARCIAL') return 'warn';
    return 'danger';
  }

  getExecutionStatusSeverity(status: MaintenanceExecutionStatus): 'warn' | 'success' {
    return status === 'CONCLUIDO' ? 'success' : 'warn';
  }

  getExecutionStatusLabel(status: MaintenanceExecutionStatus): string {
    return status === 'CONCLUIDO' ? 'CONCLUÍDO' : 'PENDENTE';
  }

  get balance(): number {
    if (!this.maintenance) return 0;
    return fromCents(toCents(this.maintenance.totalAmount) - toCents(this.maintenance.paidAmount));
  }

  get paidPercentage(): number {
    if (!this.maintenance || !this.maintenance.totalAmount) return 0;
    return Math.min(
      100,
      Math.round((this.maintenance.paidAmount / this.maintenance.totalAmount) * 100),
    );
  }

  // ── Navegação ─────────────────────────────────────────────────────────

  return(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/manutencao']);
    }
  }

  navigateToServiceOrder(code: string): void {
    this.router.navigate(['/os', code]);
  }

  // ── Ações: Pagamento ──────────────────────────────────────────────────

  formatPaymentMethod(method: string, installments: number | null): string {
    const labels: Record<string, string> = {
      DINHEIRO: 'Dinheiro',
      PIX: 'PIX',
      CARTAO_DEBITO: 'Cartão de Débito',
      CARTAO_CREDITO: 'Cartão de Crédito',
    };
    const label = labels[method] ?? method;
    if (method === 'CARTAO_CREDITO' && installments && installments > 1) {
      return `${label} ${installments}x`;
    }
    return label;
  }

  openCreatePaymentDialog(): void {
    this.paymentDialogMode = 'create';
    this.paymentDialogPayment = null;
    this.paymentDialogVisible = true;
  }

  openEditPaymentDialog(p: MaintenanceDetailPayment): void {
    this.paymentDialogMode = 'edit';
    this.paymentDialogPayment = {
      id: p.id,
      amount: p.amount,
      paymentDate: p.paymentDate,
      method: p.method as ServiceOrderPayment['method'],
      installments: p.installments,
    };
    this.paymentDialogVisible = true;
  }

  confirmDeletePayment(event: Event, p: MaintenanceDetailPayment): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Excluir pagamento de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)} (${this.toDate(p.paymentDate).toLocaleDateString('pt-BR')})?`,
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.maintenanceService.deletePayment(this.maintenance!.id, p.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Pagamento excluído com sucesso!',
            });
            this.reload();
          },
        });
      },
    });
  }

  // ── Ações: Execução ───────────────────────────────────────────────────

  formatAssemblers(assemblers: { id: string; name: string }[]): string {
    return assemblers.map((a) => a.name).join(', ');
  }

  openExecutionDialog(): void {
    this.executionDialogVisible = true;
  }

  confirmDeleteExecution(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Excluir execução de ${this.toDate(this.maintenance!.executionDate!).toLocaleDateString('pt-BR')}?`,
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.maintenanceService.deleteExecution(this.maintenance!.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Execução excluída com sucesso!',
            });
            this.reload();
          },
        });
      },
    });
  }
}
