const { PDFDocument } = require("pdf-lib");
const fs = require("fs-extra");
const path = require("path");

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

//The values that we want first slip
const assignTypesNames1 = {
  principal: "principal1",
  assistant: "assistant1",
  date: "date1",
  bibleReadingCheck: "bibleReadingCheck1",
  initialCallCheck: "initialCallCheck1",
  initialCallText: "initialCallText1",
  returnVisitCheck: "returnVisitCheck1",
  returnVisitText: "returnVisitText1",
  bibleStudyCheck: "bibleStudyCheck1",
  talkCheck: "talkCheck1",
  otherCheck: "otherCheck1",
  otherText: "otherText1",
  mainHallCheck: "mainHallCheck1",
  auxiliaryHallCheck: "auxiliaryHallCheck1",
  auxiliaryHall2Check: "auxiliaryHall2Check1",
};
//The values that we want second sip
const assignTypesNames2 = {
  principal: "principal2",
  assistant: "assistant2",
  date: "date2",
  bibleReadingCheck: "bibleReadingCheck2",
  initialCallCheck: "initialCallCheck2",
  initialCallText: "initialCallText2",
  returnVisitCheck: "returnVisitCheck2",
  returnVisitText: "returnVisitText2",
  bibleStudyCheck: "bibleStudyCheck2",
  talkCheck: "talkCheck2",
  otherCheck: "otherCheck2",
  otherText: "otherText2",
  mainHallCheck: "mainHallCheck2",
  auxiliaryHallCheck: "auxiliaryHallCheck2",
  auxiliaryHall2Check: "auxiliaryHall2Check2",
};
//The values that we want third slip
const assignTypesNames3 = {
  principal: "principal3",
  assistant: "assistant3",
  date: "date3",
  bibleReadingCheck: "bibleReadingCheck3",
  initialCallCheck: "initialCallCheck3",
  initialCallText: "initialCallText3",
  returnVisitCheck: "returnVisitCheck3",
  returnVisitText: "returnVisitText3",
  bibleStudyCheck: "bibleStudyCheck3",
  talkCheck: "talkCheck3",
  otherCheck: "otherCheck3",
  otherText: "otherText3",
  mainHallCheck: "mainHallCheck3",
  auxiliaryHallCheck: "auxiliaryHallCheck3",
  auxiliaryHall2Check: "auxiliaryHall2Check3",
};

//The values that we want fourth slip
const assignTypesNames4 = {
  principal: "principal4",
  assistant: "assistant4",
  date: "date4",
  bibleReadingCheck: "bibleReadingCheck4",
  initialCallCheck: "initialCallCheck4",
  initialCallText: "initialCallText4",
  returnVisitCheck: "returnVisitCheck4",
  returnVisitText: "returnVisitText4",
  bibleStudyCheck: "bibleStudyCheck4",
  talkCheck: "talkCheck4",
  otherCheck: "otherCheck4",
  otherText: "otherText4",
  mainHallCheck: "mainHallCheck4",
  auxiliaryHallCheck: "auxiliaryHallCheck4",
  auxiliaryHall2Check: "auxiliaryHall2Check4",
};

//The default values that are in the pdf form
const defaultPdfFields1 = {
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

//The default values that are in the pdf form
const defaultPdfFields2 = {
  principal: "900_16_Text",
  assistant: "900_17_Text",
  date: "900_18_Text",
  bibleReadingCheck: "900_19_CheckBox",
  initialCallCheck: "900_20_CheckBox",
  initialCallText: "900_21_Text",
  returnVisitCheck: "900_22_CheckBox",
  returnVisitText: "900_23_Text",
  bibleStudyCheck: "900_24_CheckBox",
  talkCheck: "900_25_CheckBox",
  otherCheck: "900_26_CheckBox",
  otherText: "900_27_Text",
  mainHallCheck: "900_28_CheckBox",
  auxiliaryHallCheck: "900_29_CheckBox",
  auxiliaryHall2Check: "900_30_CheckBox",
};

//The default values that are in the pdf form
const defaultPdfFields3 = {
  principal: "900_31_Text",
  assistant: "900_32_Text",
  date: "900_33_Text",
  bibleReadingCheck: "900_34_CheckBox",
  initialCallCheck: "900_35_CheckBox",
  initialCallText: "900_36_Text",
  returnVisitCheck: "900_37_CheckBox",
  returnVisitText: "900_38_Text",
  bibleStudyCheck: "900_39_CheckBox",
  talkCheck: "900_40_CheckBox",
  otherCheck: "900_41_CheckBox",
  otherText: "900_42_Text",
  mainHallCheck: "900_43_CheckBox",
  auxiliaryHallCheck: "900_44_CheckBox",
  auxiliaryHall2Check: "900_45_CheckBox",
};

//The default values that are in the pdf form
const defaultPdfFields4 = {
  principal: "900_46_Text",
  assistant: "900_47_Text",
  date: "900_48_Text",
  bibleReadingCheck: "900_49_CheckBox",
  initialCallCheck: "900_50_CheckBox",
  initialCallText: "900_51_Text",
  returnVisitCheck: "900_52_CheckBox",
  returnVisitText: "900_53_Text",
  bibleStudyCheck: "900_54_CheckBox",
  talkCheck: "900_55_CheckBox",
  otherCheck: "900_56_CheckBox",
  otherText: "900_57_Text",
  mainHallCheck: "900_58_CheckBox",
  auxiliaryHallCheck: "900_59_CheckBox",
  auxiliaryHall2Check: "900_60_CheckBox",
};

for (const lang of availableLangs) {
  try {
    const templatePath = path.join("./src/assets/templates", lang, "pdf", "S89S.pdf");

    const pdfFile = fs.readFileSync(templatePath);

    PDFDocument.load(pdfFile).then((s89sPdf) => {
      const fields = s89sPdf.getForm().getFields();

      for (let field of fields) {
        switch (field.getName()) {
          case defaultPdfFields1.principal:
            field.acroField.setPartialName(assignTypesNames1.principal);
            break;
          case defaultPdfFields1.assistant:
            field.acroField.setPartialName(assignTypesNames1.assistant);
            break;
          case defaultPdfFields1.date:
            field.acroField.setPartialName(assignTypesNames1.date);
            break;
          case defaultPdfFields1.bibleReadingCheck:
            field.acroField.setPartialName(assignTypesNames1.bibleReadingCheck);
            break;
          case defaultPdfFields1.initialCallCheck:
            field.acroField.setPartialName(assignTypesNames1.initialCallCheck);
            break;
          case defaultPdfFields1.initialCallText:
            field.acroField.setPartialName(assignTypesNames1.initialCallCheck);
            break;
          case defaultPdfFields1.returnVisitCheck:
            field.acroField.setPartialName(assignTypesNames1.returnVisitCheck);
            break;
          case defaultPdfFields1.returnVisitText:
            field.acroField.setPartialName(assignTypesNames1.returnVisitText);
            break;
          case defaultPdfFields1.bibleStudyCheck:
            field.acroField.setPartialName(assignTypesNames1.bibleStudyCheck);
            break;
          case defaultPdfFields1.talkCheck:
            field.acroField.setPartialName(assignTypesNames1.talkCheck);
            break;
          case defaultPdfFields1.otherCheck:
            field.acroField.setPartialName(assignTypesNames1.otherCheck);
            break;
          case defaultPdfFields1.otherText:
            field.acroField.setPartialName(assignTypesNames1.otherText);
            break;
          case defaultPdfFields1.mainHallCheck:
            field.acroField.setPartialName(assignTypesNames1.mainHallCheck);
            break;
          case defaultPdfFields1.auxiliaryHallCheck:
            field.acroField.setPartialName(assignTypesNames1.auxiliaryHallCheck);
            break;
          case defaultPdfFields1.auxiliaryHall2Check:
            field.acroField.setPartialName(assignTypesNames1.auxiliaryHall2Check);
            break;

          //2 SLIP
          case defaultPdfFields2.principal:
            field.acroField.setPartialName(assignTypesNames2.principal);
            break;
          case defaultPdfFields2.assistant:
            field.acroField.setPartialName(assignTypesNames2.assistant);
            break;
          case defaultPdfFields2.date:
            field.acroField.setPartialName(assignTypesNames2.date);
            break;
          case defaultPdfFields2.bibleReadingCheck:
            field.acroField.setPartialName(assignTypesNames2.bibleReadingCheck);
            break;
          case defaultPdfFields2.initialCallCheck:
            field.acroField.setPartialName(assignTypesNames2.initialCallCheck);
            break;
          case defaultPdfFields2.initialCallText:
            field.acroField.setPartialName(assignTypesNames2.initialCallCheck);
            break;
          case defaultPdfFields2.returnVisitCheck:
            field.acroField.setPartialName(assignTypesNames2.returnVisitCheck);
            break;
          case defaultPdfFields2.returnVisitText:
            field.acroField.setPartialName(assignTypesNames2.returnVisitText);
            break;
          case defaultPdfFields2.bibleStudyCheck:
            field.acroField.setPartialName(assignTypesNames2.bibleStudyCheck);
            break;
          case defaultPdfFields2.talkCheck:
            field.acroField.setPartialName(assignTypesNames2.talkCheck);
            break;
          case defaultPdfFields2.otherCheck:
            field.acroField.setPartialName(assignTypesNames2.otherCheck);
            break;
          case defaultPdfFields2.otherText:
            field.acroField.setPartialName(assignTypesNames2.otherText);
            break;
          case defaultPdfFields2.mainHallCheck:
            field.acroField.setPartialName(assignTypesNames2.mainHallCheck);
            break;
          case defaultPdfFields2.auxiliaryHallCheck:
            field.acroField.setPartialName(assignTypesNames2.auxiliaryHallCheck);
            break;
          case defaultPdfFields2.auxiliaryHall2Check:
            field.acroField.setPartialName(assignTypesNames1.auxiliaryHall2Check);
            break;

          //3 SLIP
          case defaultPdfFields3.principal:
            field.acroField.setPartialName(assignTypesNames3.principal);
            break;
          case defaultPdfFields3.assistant:
            field.acroField.setPartialName(assignTypesNames3.assistant);
            break;
          case defaultPdfFields3.date:
            field.acroField.setPartialName(assignTypesNames3.date);
            break;
          case defaultPdfFields3.bibleReadingCheck:
            field.acroField.setPartialName(assignTypesNames3.bibleReadingCheck);
            break;
          case defaultPdfFields3.initialCallCheck:
            field.acroField.setPartialName(assignTypesNames3.initialCallCheck);
            break;
          case defaultPdfFields3.initialCallText:
            field.acroField.setPartialName(assignTypesNames3.initialCallCheck);
            break;
          case defaultPdfFields3.returnVisitCheck:
            field.acroField.setPartialName(assignTypesNames3.returnVisitCheck);
            break;
          case defaultPdfFields3.returnVisitText:
            field.acroField.setPartialName(assignTypesNames3.returnVisitText);
            break;
          case defaultPdfFields3.bibleStudyCheck:
            field.acroField.setPartialName(assignTypesNames3.bibleStudyCheck);
            break;
          case defaultPdfFields3.talkCheck:
            field.acroField.setPartialName(assignTypesNames3.talkCheck);
            break;
          case defaultPdfFields3.otherCheck:
            field.acroField.setPartialName(assignTypesNames3.otherCheck);
            break;
          case defaultPdfFields3.otherText:
            field.acroField.setPartialName(assignTypesNames3.otherText);
            break;
          case defaultPdfFields3.mainHallCheck:
            field.acroField.setPartialName(assignTypesNames3.mainHallCheck);
            break;
          case defaultPdfFields3.auxiliaryHallCheck:
            field.acroField.setPartialName(assignTypesNames2.auxiliaryHallCheck);
            break;
          case defaultPdfFields2.auxiliaryHall2Check:
            field.acroField.setPartialName(assignTypesNames1.auxiliaryHall2Check);
            break;

          //4 SLIP
          case defaultPdfFields4.principal:
            field.acroField.setPartialName(assignTypesNames4.principal);
            break;
          case defaultPdfFields4.assistant:
            field.acroField.setPartialName(assignTypesNames4.assistant);
            break;
          case defaultPdfFields4.date:
            field.acroField.setPartialName(assignTypesNames4.date);
            break;
          case defaultPdfFields4.bibleReadingCheck:
            field.acroField.setPartialName(assignTypesNames4.bibleReadingCheck);
            break;
          case defaultPdfFields4.initialCallCheck:
            field.acroField.setPartialName(assignTypesNames4.initialCallCheck);
            break;
          case defaultPdfFields4.initialCallText:
            field.acroField.setPartialName(assignTypesNames4.initialCallCheck);
            break;
          case defaultPdfFields4.returnVisitCheck:
            field.acroField.setPartialName(assignTypesNames4.returnVisitCheck);
            break;
          case defaultPdfFields4.returnVisitText:
            field.acroField.setPartialName(assignTypesNames4.returnVisitText);
            break;
          case defaultPdfFields4.bibleStudyCheck:
            field.acroField.setPartialName(assignTypesNames4.bibleStudyCheck);
            break;
          case defaultPdfFields4.talkCheck:
            field.acroField.setPartialName(assignTypesNames4.talkCheck);
            break;
          case defaultPdfFields4.otherCheck:
            field.acroField.setPartialName(assignTypesNames4.otherCheck);
            break;
          case defaultPdfFields4.otherText:
            field.acroField.setPartialName(assignTypesNames4.otherText);
            break;
          case defaultPdfFields4.mainHallCheck:
            field.acroField.setPartialName(assignTypesNames3.mainHallCheck);
            break;
          case defaultPdfFields3.auxiliaryHallCheck:
            field.acroField.setPartialName(assignTypesNames2.auxiliaryHallCheck);
            break;
          case defaultPdfFields2.auxiliaryHall2Check:
            field.acroField.setPartialName(assignTypesNames1.auxiliaryHall2Check);
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
