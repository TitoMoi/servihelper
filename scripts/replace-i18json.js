/**
 * This script replaces the missing keys that transloco adds with the English keys.
 * Then, using the vsc google translate plugin to manually translate it.
 * Translation is not perfect, but at least there is no extra manual effort to support all languages.
 */

const fs = require("fs-extra");
const path = require("path");

const i18nPath = "./src/assets/i18n/";

//Get a list of i18n files except the english file.
const i18nFileNames = fs.readdirSync(i18nPath).filter((file) => file !== "en.json");

const enFile = fs.readJSONSync(path.join(i18nPath, "en.json"));

for (let i18nFilename of i18nFileNames) {
  const langFile = fs.readJSONSync(path.join(i18nPath, i18nFilename));

  for (let [key, value] of Object.entries(langFile)) {
    /* Check if there is a value begining with "Missing" as this is what transloco puts on missing keys */
    if (value.startsWith("Missing")) {
      //Put the English value for that key.
      langFile[key] = enFile[key];
    }
  }
  fs.writeJSONSync(path.join(i18nPath, i18nFilename), langFile);
}
