import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailMaintenance } from './detail-maintenance';

describe('DetailMaintenance', () => {
  let component: DetailMaintenance;
  let fixture: ComponentFixture<DetailMaintenance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailMaintenance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailMaintenance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
