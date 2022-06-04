const AdmZip = require("adm-zip");
const fs = require("fs-extra");

const package = fs.readJsonSync("./package.json");

var zip = new AdmZip();

zip.addLocalFile("./release/servihelper-"+package.version +"-arm64.dmg");

zip.writeZip("./release/" + "servihelper-" + package.version + ".zip", (e) =>
  console.log("zip creado")
);
