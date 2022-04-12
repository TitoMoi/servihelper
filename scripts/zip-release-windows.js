const AdmZip = require("adm-zip");
const fs = require("fs-extra");

const package = fs.readJsonSync("./package.json");

var zip = new AdmZip();

zip.addLocalFolder("./release/win-unpacked");

zip.writeZip("./release/" + "servihelper-" + package.version + ".zip", (e) =>
  console.log("zip creado")
);
