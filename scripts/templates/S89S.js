const { PDFDocument } = require("pdf-lib");
const fs = require("fs-extra");
const path = require("path");
/* s89s fields are:

principal, assistant, date, bibleReadingCheck, initialCallCheck,
initialCallText, returnVisitCheck, returnVisitText, bibleStudyCheck, talkCheck, otherCheck,
otherText, mainHallCheck, auxiliaryHallCheck, auxiliaryHall2Check */

//The values that we want
const assignTypesNames = {
  principal: "principal",
  assistant: "assistant",
  date: "date",
  bibleReadingCheck: "bibleReadingCheck",
  initialCallCheck: "initialCallCheck",
  initialCallText: "initialCallText",
  returnVisitCheck: "returnVisitCheck",
  returnVisitText: "returnVisitText",
  bibleStudyCheck: "bibleStudyCheck",
  talkCheck: "talkCheck",
  otherCheck: "otherCheck",
  otherText: "otherText",
  mainHallCheck: "mainHallCheck",
  auxiliaryHallCheck: "auxiliaryHallCheck",
  auxiliaryHall2Check: "auxiliaryHall2Check",
};

//The default values that are in the pdf form
const defaultPdfFields = {
  principal: "900_1_Text",
  assistant: "900_2_Text",
  date: "900_3_Text",
  bibleReadingCheck: "900_4_CheckBox",
  initialCallCheck: "900_5_CheckBox",
  initialCallText: "900_6_Text",
  returnVisitCheck: "900_7_CheckBox",
  returnVisitText: "900_8_Text",
  bibleStudyCheck: "900_9_CheckBox",
  talkCheck: "900_10_CheckBox",
  otherCheck: "900_11_CheckBox",
  otherText: "900_12_Text",
  mainHallCheck: "900_13_CheckBox",
  auxiliaryHallCheck: "900_14_CheckBox",
  auxiliaryHall2Check: "900_15_CheckBox",
};

const availableLangs = [
  "bn",
  "ca",
  "de",
  "el",
  "en",
  "es",
  "fr",
  "hi",
  "it",
  "ja",
  "ko",
  "nl",
  "pl",
  "pt",
  "ro",
  "ru",
  "tr",
  "zhCN",
];

for (const lang of availableLangs) {
  try {
    const templatePath = path.join("./src/assets/templates", lang, "pdf", "S89S.pdf");

    const pdfFile = fs.readFileSync(templatePath);

    PDFDocument.load(pdfFile).then((s89sPdf) => {
      const fields = s89sPdf.getForm().getFields();

      for (let field of fields) {
        switch (field.getName()) {
          case defaultPdfFields.principal:
            field.acroField.setPartialName(assignTypesNames.principal);
            break;
          case defaultPdfFields.assistant:
            field.acroField.setPartialName(assignTypesNames.assistant);
            break;
          case defaultPdfFields.date:
            field.acroField.setPartialName(assignTypesNames.date);
            break;
          case defaultPdfFields.bibleReadingCheck:
            field.acroField.setPartialName(assignTypesNames.bibleReadingCheck);
            break;
          case defaultPdfFields.initialCallCheck:
            field.acroField.setPartialName(assignTypesNames.initialCallCheck);
            break;
          case defaultPdfFields.initialCallText:
            field.acroField.setPartialName(assignTypesNames.initialCallCheck);
            break;
          case defaultPdfFields.returnVisitCheck:
            field.acroField.setPartialName(assignTypesNames.returnVisitCheck);
            break;
          case defaultPdfFields.returnVisitText:
            field.acroField.setPartialName(assignTypesNames.returnVisitText);
            break;
          case defaultPdfFields.bibleStudyCheck:
            field.acroField.setPartialName(assignTypesNames.bibleStudyCheck);
            break;
          case defaultPdfFields.talkCheck:
            field.acroField.setPartialName(assignTypesNames.talkCheck);
            break;
          case defaultPdfFields.otherCheck:
            field.acroField.setPartialName(assignTypesNames.otherCheck);
            break;
          case defaultPdfFields.otherText:
            field.acroField.setPartialName(assignTypesNames.otherText);
            break;
          case defaultPdfFields.mainHallCheck:
            field.acroField.setPartialName(assignTypesNames.mainHallCheck);
            break;
          case defaultPdfFields.auxiliaryHallCheck:
            field.acroField.setPartialName(assignTypesNames.auxiliaryHallCheck);
            break;
          case defaultPdfFields.auxiliaryHall2Check:
            field.acroField.setPartialName(assignTypesNames.auxiliaryHall2Check);
            break;
          default:
            console.error(`Field ${field.getName()} not found`);
        }
      }
    });
  } catch (e) {
    console.error(e);
  }
}
