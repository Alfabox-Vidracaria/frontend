import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOrdersSellers } from './service-orders-sellers';

describe('ServiceOrdersSellers', () => {
  let component: ServiceOrdersSellers;
  let fixture: ComponentFixture<ServiceOrdersSellers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceOrdersSellers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceOrdersSellers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
