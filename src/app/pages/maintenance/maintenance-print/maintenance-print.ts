import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MaintenanceService } from '../../../shared/services/maintenance.service';
import { MaintenanceDetail } from '../../../shared/models/maintenance.model';
import { fromApiDate } from '../../../shared/utils/date.utils';
import { CpfFormatPipe } from '../../../shared/pipes/cpf-format.pipe';
import { CnpjFormatPipe } from '../../../shared/pipes/cnpj-format.pipe';
import { PhoneFormatPipe } from '../../../shared/pipes/phone-format.pipe';

@Component({
  selector: 'app-maintenance-print',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, PhoneFormatPipe],
  templateUrl: './maintenance-print.html',
  styleUrl: './maintenance-print.scss',
})
export class MaintenancePrint implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly maintenanceService = inject(MaintenanceService);

  maintenance: MaintenanceDetail | null = null;

  ngOnInit(): void {
    const stateData = history.state?.maintenanceData as MaintenanceDetail | undefined;
    if (stateData?.id) {
      this.maintenance = stateData;
      this.schedulePrint();
    } else {
      const code = this.route.snapshot.paramMap.get('code')!;
      this.maintenanceService.findByCode(code).subscribe({
        next: (data) => {
          this.maintenance = data;
          this.schedulePrint();
        },
      });
    }
  }

  private schedulePrint(): void {
    setTimeout(() => window.print(), 400);
  }

  // ── Helpers ──────────────────────────────────────────────────────────

  toDate(apiDate: string): Date {
    return fromApiDate(apiDate);
  }

  get isWarranty(): boolean {
    return this.maintenance?.type === 'WARRANTY';
  }

  get documentLabel(): string {
    return this.maintenance?.client.personType === 'J' ? 'CNPJ' : 'CPF';
  }

  formatDocument(): string {
    const client = this.maintenance?.client;
    if (!client?.document) return '';
    if (client.personType === 'J') return new CnpjFormatPipe().transform(client.document);
    return new CpfFormatPipe().transform(client.document);
  }

  get assemblerNames(): string {
    const assemblers = this.maintenance?.assemblers ?? [];
    return assemblers.map((a) => a.name).join(', ');
  }
}
