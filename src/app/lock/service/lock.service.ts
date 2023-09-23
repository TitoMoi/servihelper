import { Injectable } from "@angular/core";
import { LockInterface } from "app/lock/model/lock.model";
import { ConfigService } from "app/config/service/config.service";
import { readJSONSync, writeJson, writeJsonSync } from "fs-extra";
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
    if (this.isOnline) {
      try {
        this.#lock = readJSONSync(this.configService.lockPath);
        return this.#lock;
      } catch (e) {
        //This should never happen, prevent a death file
        this.#lock = {
          lock: false,
          timestamp: new Date(),
        };
        this.saveLockToFile(true);
        return this.#lock;
      }
    }
  }

  /** Set lock to true */
  takeLock() {
    this.#lock.lock = true;
    this.saveLockToFile();
  }

  /** Set lock to false */
  releaseLock(exit: boolean = false) {
    this.#lock.lock = false;
    this.saveLockToFile(exit);
  }

  updateTimestamp() {
    this.#lock.timestamp = new Date();
    this.saveLockToFile();
  }

  takeLockAndTimestamp() {
    this.#lock.lock = true;
    this.#lock.timestamp = new Date();
    this.saveLockToFile();
  }

  /**
   * When the lock remains true, after 20 minuts without timestamp allow the app to take it.
   * If the user is away 10 minuts the lock is released and the app is closed.
   * So, if we encounter a lock true and a timestamp above 20 min we must take the app.
   */
  checkDeathEnd(): boolean {
    if (
      this.#lock.lock &&
      intervalToDuration({
        start: new Date(this.#lock.timestamp),
        end: new Date(),
      }).minutes > 20
    ) {
      return true;
    }
    return false;
  }

  /* checkTimer(){
    if(this.#lock.timestamp)
  } */

  /** Save the lock only if we are online */
  saveLockToFile(exit: boolean = false) {
    if (this.isOnline) {
      if (exit) {
        //Make sure the file is saved
        writeJsonSync(this.configService.lockPath, this.#lock);
      }
      writeJson(this.configService.lockPath, this.#lock);
    }
  }
}
