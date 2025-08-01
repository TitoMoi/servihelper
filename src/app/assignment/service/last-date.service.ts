import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LastDateService {
  //The last date for the dash property, we need to keep track as between pagination we loose this information
  lastDashedDate: Date = undefined;

  #lastDate: Date = new Date();

  // eslint-disable-next-line @typescript-eslint/member-ordering
  lastDateSub$: BehaviorSubject<Date> = new BehaviorSubject(new Date(this.#lastDate));
  // eslint-disable-next-line @typescript-eslint/member-ordering
  lastDate$: Observable<Date> = this.lastDateSub$.asObservable();

  set lastDate(date: Date) {
    this.#lastDate = date;
    this.lastDateSub$.next(date);
  }
}
