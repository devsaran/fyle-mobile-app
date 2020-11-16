import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-my-expenses-search-filter',
  templateUrl: './my-expenses-search-filter.component.html',
  styleUrls: ['./my-expenses-search-filter.component.scss'],
})
export class MyExpensesSearchFilterComponent implements OnInit {

  @Input() filters: Partial<{
    state: string;
    date: string;
    customDateStart: Date;
    customDateEnd: Date;
    sortParam: string;
    sortDir: string;
  }>;

  fg: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.fg = this.fb.group({
      state: [this.filters && this.filters.state],
      date: [this.filters && this.filters.date],
      customDateStart: [this.filters && this.filters.customDateStart],
      customDateEnd: [this.filters && this.filters.customDateEnd]
    });

    this.fg.validator = this.customDatevalidator;
  }

  customDatevalidator(formGroup: FormGroup) {
    if (formGroup.value.date &&
      formGroup.value.date === 'CUSTOMDATE' &&
      (formGroup.controls.customDateStart.value === null ||
        formGroup.controls.customDateEnd.value === null)) {
      return {
        error: 'custom date input is required when custom dates are selected'
      };
    }
  }

  save() {
    if (this.fg.value.date !== 'CUSTOMDATE') {
      this.fg.controls.customDateStart.reset();
      this.fg.controls.customDateEnd.reset();
    }

    this.modalController.dismiss({
      filters: this.fg.value
    });
  }

  cancel() {
    this.modalController.dismiss();
  }

  clearAll() {
    this.fg.reset();
  }
}