import { Injectable } from "@angular/core";
import { LockInterface } from "app/lock/model/lock.model";
import { ConfigService } from "app/config/service/config.service";
import { readJSONSync, writeJson } from "fs-extra";
import { intervalToDuration } from "date-fns";
import { OnlineService } from "app/online/service/online.service";

@Injectable({
  providedIn: "root",
})
export class LockService {
  #lock: LockInterface = undefined;

  isOnline = this.onlineService.getOnline().isOnline;

  constructor(private configService: ConfigService, private onlineService: OnlineService) {}

  /**
   * @returns LockInterface
   */
  getLock(): LockInterface {
    this.#lock = readJSONSync(this.configService.lockPath);
    return this.#lock;
  }

  /** Set lock to true */
  takeLock() {
    this.#lock.lock = true;
    this.saveLockToFile();
  }

  /** Set lock to false */
  releaseLock() {
    this.#lock.lock = false;
    this.saveLockToFile();
  }

  updateTimestamp() {
    this.#lock.timestamp = new Date();
    this.saveLockToFile();
  }

  /**
   * When the lock remains true, after 20 minuts without timestamp allow the app to take it.
   * If the user is away 10 minuts the lock is released and the app is closed.
   * So, if we encounter a lock true and a timestamp above 20 min we must take the app.
   */
  checkDeathEnd() {
    console.log(this.#lock.lock);
    if (
      this.#lock.lock &&
      intervalToDuration({
        start: new Date(this.#lock.timestamp),
        end: new Date(),
      }).minutes > 20
    ) {
      this.releaseLock();
    }
  }

  /* checkTimer(){
    if(this.#lock.timestamp)
  } */

  /** Save the lock only if we are online */
  saveLockToFile() {
    if (this.isOnline) writeJson(this.configService.lockPath, this.#lock);
  }
}
