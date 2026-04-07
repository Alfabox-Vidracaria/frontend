import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Assembler } from './assembler';

describe('Assembler', () => {
  let component: Assembler;
  let fixture: ComponentFixture<Assembler>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Assembler]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Assembler);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
