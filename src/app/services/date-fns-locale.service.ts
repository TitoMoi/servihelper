import { Injectable } from '@angular/core';
import {
  bn,
  ca,
  de,
  el,
  enGB,
  es,
  fr,
  hi,
  hr,
  it,
  ja,
  ko,
  nl,
  pl,
  pt,
  ro,
  ru,
  tr,
  zhCN
} from 'date-fns/locale';

@Injectable({
  providedIn: 'root'
})
export class DateFnsLocaleService {
  locales;
  constructor() {
    //Key is the locale as servihelper understands, right is date-fns, most of them are the same
    this.locales = {
      es,
      ca,
      en: enGB,
      pt,
      de,
      fr,
      it,
      ru,
      ja,
      ko,
      hr,
      zhCN,
      hi,
      el,
      bn,
      nl,
      ro,
      tr,
      pl
    };
  }
}
