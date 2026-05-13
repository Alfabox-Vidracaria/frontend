export type MaintenancePaymentMethod = 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX';

export interface MaintenancePayment {
  id: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  method: MaintenancePaymentMethod;
  installments: number | null;
  maintenanceId: string;
}

export interface CreateMaintenancePayment {
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  method: MaintenancePaymentMethod;
  installments?: number | null;
}

export interface UpdateMaintenancePayment {
  amount?: number;
  paymentDate?: string; // YYYY-MM-DD
  method?: MaintenancePaymentMethod;
  installments?: number | null;
}
