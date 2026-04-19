import { Component, Input, OnDestroy, OnInit, forwardRef, inject } from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NgxMaskDirective } from 'ngx-mask';
import { LowerCasePipe } from '@angular/common';
import { ErrorMessageComponent } from '../error-message/error-message';

/**
 * Componente reutilizável de campos múltiplos (ex: telefones).
 *
 * Integra com Reactive Forms via ControlValueAccessor.
 * Emite um array de objetos: [{ id?: string, value: string }]
 *
 * Inputs:
 * - label: rótulo de cada campo (ex: "Telefone")
 * - min / max: quantidade mínima e máxima de itens
 * - scrollHeight: altura a partir da qual cria scroll interno (ex: "200px")
 * - masks: máscara(s) para ngx-mask (ex: "(00) 0000-0000||(00) 00000-0000")
 * - validators: validadores Angular para cada campo individual
 * - placeholder: placeholder do campo
 */
@Component({
  selector: 'app-multi-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    NgxMaskDirective,
    LowerCasePipe,
    ErrorMessageComponent,
  ],
  templateUrl: './multi-input.html',
  styleUrl: './multi-input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MultiInputComponent),
      multi: true,
    },
  ],
})
export class MultiInputComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  @Input() label = 'Item';
  @Input() min = 0;
  @Input() max = 10;
  @Input() scrollHeight: string | null = null;
  @Input() masks = '';
  @Input() validators: ValidatorFn[] = [];
  @Input() placeholder = '';

  formArray!: FormArray<FormGroup>;

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};
  private sub!: Subscription;

  ngOnInit(): void {
    this.formArray = this.fb.array<FormGroup>([]);

    // Garante o mínimo inicial
    for (let i = 0; i < this.min; i++) {
      this.addItem();
    }

    this.sub = this.formArray.valueChanges.subscribe(() => {
      this.emitValue();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ── ControlValueAccessor ──────────────────────────────────────────────

  writeValue(value: { id?: string; number: string }[] | null): void {
    if (!this.formArray) return;

    this.formArray.clear({ emitEvent: false });

    if (value && value.length > 0) {
      value.forEach((item) => {
        this.formArray.push(this.createGroup(item.id, item.number), { emitEvent: false });
      });
    }

    // Garante mínimo
    while (this.formArray.length < this.min) {
      this.addItem(false);
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // ── Validator ─────────────────────────────────────────────────────────

  validate(): ValidationErrors | null {
    if (this.formArray && this.formArray.invalid) {
      return { multiInputInvalid: true };
    }
    return null;
  }

  // ── Ações ─────────────────────────────────────────────────────────────

  addItem(emitEvent = true): void {
    if (this.formArray.length >= this.max) return;
    this.formArray.push(this.createGroup(), { emitEvent });
  }

  removeItem(index: number): void {
    if (this.formArray.length <= this.min) return;
    this.formArray.removeAt(index);
    this.onTouched();
  }

  onFieldBlur(): void {
    this.onTouched();
  }

  get canAdd(): boolean {
    return this.formArray.length < this.max;
  }

  canRemove(): boolean {
    return this.formArray.length > this.min;
  }

  isFieldInvalid(index: number): boolean {
    const control = this.formArray.at(index)?.get('value');
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }

  getControl(index: number): FormControl {
    return this.formArray.at(index).get('value') as FormControl;
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private createGroup(id?: string, value?: string): FormGroup {
    return this.fb.group({
      id: [id ?? null],
      value: [value ?? '', [Validators.required, ...this.validators]],
    });
  }

  private emitValue(): void {
    const raw = this.formArray.getRawValue();
    const mapped = raw.map((item) => ({
      ...(item['id'] ? { id: item['id'] } : {}),
      number: item['value'],
    }));
    this.onChange(mapped);
  }
}
