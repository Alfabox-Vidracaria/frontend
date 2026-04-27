import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SHARED_CRUD_IMPORTS } from '../../constants/shared-crud-imports';
import { ServiceOrderService } from '../../services/service-order.service';
import { ProductService } from '../../services/product.service';
import { OsItemsInputComponent } from '../os-items-input/os-items-input';
import { ServiceOrderDetailItem, UpdateItems } from '../../models/service-order.model';

/** Estrutura mínima emitida pelo (saved) para o pai atualizar a view. */
export interface EditItemsResult {
  items: ServiceOrderDetailItem[];
  observation: string | null;
  totalAmount: number;
}

@Component({
  selector: 'app-edit-items-dialog',
  standalone: true,
  imports: [...SHARED_CRUD_IMPORTS, OsItemsInputComponent, InputNumberModule, TextareaModule],
  templateUrl: './edit-items-dialog.html',
  styleUrl: './edit-items-dialog.scss',
})
export class EditItemsDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly serviceOrderService = inject(ServiceOrderService);
  private readonly productService = inject(ProductService);
  private readonly messageService = inject(MessageService);

  // ── Inputs / Outputs ──────────────────────────────────────────────────

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** UUID da OS. */
  @Input() orderId = '';

  /** Itens atuais da OS para pré-preencher. */
  @Input() items: ServiceOrderDetailItem[] = [];

  /** Observação atual. */
  @Input() observation: string | null = null;

  /** Valor total atual. */
  @Input() totalAmount: number | null = null;

  /** Emite o resultado após salvar com sucesso. */
  @Output() saved = new EventEmitter<EditItemsResult>();

  // ── ViewChild ─────────────────────────────────────────────────────────

  @ViewChild(OsItemsInputComponent) osItemsInput!: OsItemsInputComponent;

  // ── Estado interno ────────────────────────────────────────────────────

  saving = false;

  // ── Dialog cadastrar produto ──────────────────────────────────────────

  productDialogVisible = false;
  productDialogSaving = false;

  productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
  });

  // ── Formulário ────────────────────────────────────────────────────────

  readonly form = this.fb.group({
    items: [
      [] as {
        id?: string | null;
        productId: string | null;
        quantity: number | null;
        amount: number | null;
        details: string | null;
      }[],
    ],
    observation: [null as string | null, Validators.maxLength(500)],
    totalAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.productForm.reset();

      // Pré-preenche com os dados atuais da OS
      this.form.reset({
        items: this.items.map((item) => ({
          id: item.id,
          productId: item.product?.id ?? null,
          quantity: item.quantity,
          amount: item.amount,
          details: item.details,
        })),
        observation: this.observation,
        totalAmount: this.totalAmount,
      });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  isProductDialogInvalid(field: string): boolean {
    const ctrl = this.productForm.get(field);
    return !!(ctrl?.invalid && (ctrl.touched || ctrl.dirty));
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  // ── Produto ───────────────────────────────────────────────────────────

  openCreateProductDialog(): void {
    this.productForm.reset();
    this.productDialogVisible = true;
  }

  saveProduct(): void {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) return;

    this.productDialogSaving = true;
    this.productService.create({ name: this.productForm.getRawValue().name }).subscribe({
      next: () => {
        this.productDialogSaving = false;
        this.productDialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Produto cadastrado',
          detail: 'O produto foi cadastrado e já está disponível para seleção.',
        });
        this.osItemsInput?.reloadProducts();
      },
      error: () => {
        this.productDialogSaving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível cadastrar o produto.',
        });
      },
    });
  }

  // ── Salvar ────────────────────────────────────────────────────────────

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const payload: UpdateItems = {
      items: (raw.items ?? []).map((item) => ({
        id: item.id ?? null,
        productId: item.productId ?? null,
        quantity: item.quantity ?? null,
        amount: item.amount ?? null,
        details: item.details ?? null,
      })),
      observation: raw.observation?.trim() || null,
      totalAmount: raw.totalAmount as number,
    };

    this.saving = true;
    this.serviceOrderService.updateItems(this.orderId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Itens atualizados',
          detail: 'Os itens e o valor total foram salvos com sucesso.',
        });

        // Reconstrói a estrutura para o pai atualizar a view localmente
        const updatedItems: ServiceOrderDetailItem[] = payload.items.map((item, index) => ({
          id: item.id ?? '',
          sequence: index,
          quantity: item.quantity,
          amount: item.amount,
          details: item.details,
          product: null, // O pai fará reload() para obter os nomes atualizados
        }));

        this.saved.emit({
          items: updatedItems,
          observation: payload.observation,
          totalAmount: payload.totalAmount,
        });
        this.close();
      },
      error: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível salvar as alterações. Tente novamente.',
        });
      },
    });
  }
}
