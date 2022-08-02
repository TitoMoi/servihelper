import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: "root",
})
export class LastDateService {
  #lastDate: Date = new Date();

  lastDateSub$: BehaviorSubject<Date> = new BehaviorSubject(
    new Date(this.#lastDate)
  );
  lastDate$: Observable<Date> = this.lastDateSub$.asObservable();

  set lastDate(date: Date) {
    this.#lastDate = date;
    this.lastDateSub$.next(date);
  }
}
