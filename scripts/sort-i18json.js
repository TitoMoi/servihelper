const sortJson = require("sort-json");
const fs = require("fs-extra");

const i18nFileNames = fs.readdirSync("./src/assets/i18n/");
console.log(i18nFileNames);

i18nFileNames.forEach((filename) => {
  sortJson.overwrite("./src/assets/i18n/" + filename);
});
