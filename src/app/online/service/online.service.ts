import { Injectable, inject } from '@angular/core';
import { OnlineInterface } from 'app/online/model/online.model';
import { ConfigService } from 'app/config/service/config.service';
import { readJSONSync, writeJsonSync } from 'fs-extra';
import { BehaviorSubject, Observable, fromEvent, map, merge, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineService {
  private configService = inject(ConfigService);

  private onlineSubject$: BehaviorSubject<OnlineInterface> = new BehaviorSubject(undefined);
  /**Like the private online object but public and observable */
  online$: Observable<OnlineInterface> = this.onlineSubject$.asObservable();
  #online: OnlineInterface;

  //Check if has access to internet
  #networkStatus$ = new BehaviorSubject(false);
  //We dont want the status "false" we want a true if the condition is meet
  netStatusOffline$ = this.#networkStatus$.pipe(
    map(status => this.#online.isOnline && status === false)
  );
  netStatusOnline$ = this.#networkStatus$.pipe(
    map(status => this.#online.isOnline && status === true)
  );

  prepareCheckInternetAccess() {
    if (this.#online.isOnline) {
      merge(of(null), fromEvent(window, 'online'), fromEvent(window, 'offline'))
        .pipe(map(() => navigator.onLine))
        .subscribe(status => this.#networkStatus$.next(status));
    }
  }

  /**
   *
   * @returns OnlineInterface
   */
  getOnline(): OnlineInterface {
    this.#online = readJSONSync(this.configService.onlinePath);
    this.onlineSubject$.next(this.#online);
    return this.#online;
  }

  /**
   * @param online the object to replace
   */
  updateOnline(online: OnlineInterface) {
    //update online
    this.#online = online;
    this.onlineSubject$.next(online);
    this.saveOnlineToFile();
  }

  saveOnlineToFile() {
    //Write rooms back to file
    writeJsonSync(this.configService.onlinePath, this.#online);
  }
}
