# Introduction

Servihelper aims to:

- Provide an universal app to create and share assignments on Windows, Mac and Linux.
- Web app is not possible today as it needs access to the filesystem to be free.
- 1 repository of code for all 3 platforms.
- Provide free development cost _(no apple id)_ free distribution _(github)_ free use and colaboration mechanism between diferent assignment actors without middleware servers _(import and export)_ this comes at a cost, the user must download new versions instead of auto updating.
- Be accessible in as many languages as possible.

## Language

Servihelper uses transloco and transloco locale for dates. And date-fns for statistics locales.
These files must be updated when adding a new language:

- src/assets/i18n/all-locales
- app/transloco/translocoRoot.module.ts
- app/assignment/customDateAdapter.ts
- app/statistics/assistant-count/assistant-count.component.ts
- app/statistics/global-count/global-count.component.ts
- app/statistics/principal-count/principal-count.component.ts

Language files must be sorted when adding keys with the scripts/sort-i18json.js

## Lazy load

Servihelper doesnt use lazy load as it is a desktop app and network is not an issue.

## Build

Currently using electron-builder for windows and mac apple, the version of the app generated is in the ./app/package.json version field

- For windows use script `prepare:publish:windows`
- For mac use script `prepare:publish:mac:universal`

## Fonts

The available fonts for pdf are in resources, Meiryo for japanese, malgun for korean, simsun for simplified chinese and notosans for all the others.
The base64 fonts are in resources/base64fonts and not in assets because is not needed that each user has the base64 fonts
they are already imported as base64 in the pdfService and in main chunk.
The fonts are converted to base64 using the parallax \jsPDF\fontconverter\fontconverter.html
