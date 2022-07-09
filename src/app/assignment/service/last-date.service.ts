import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

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
