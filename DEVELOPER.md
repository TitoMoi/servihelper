# Introduction

Servihelper aims to:

- Provide an universal app to create and share assignments on Windows, Mac and Linux.
- Web app is not possible today as it needs access to the filesystem to be free.
- 1 repository of code for all 3 platforms _(windows, apple, linux)_
- It's provided with free development cost _(no apple id)_ with free distribution _(github)_ free use and free colaboration between diferent administrator actors using the function of import and export
- The administrator user must download new versions when they are available and work all together with the same version.
- Be accessible and provided in as many languages as possible.

## Development Setup

- After cloning the repository, create two folders "assets/source" in root.
- Copy only src/assets/source into the new created "assets/source" folder.

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

Servihelper doesnt use angular lazy load as it is a desktop app and network is not an issue.

## Layout

- All pages are wrapper in a bootstrap margin level 3.
- All content uses bootstrap margin level 2 for small laptops and margin level 3 for sibling items.

## Icons

Icons should be added at `app.component.ts` in the array of icons without the extension.

## Local Build

The version of the app is automatically generated in the distributable with only updating the two existing package.json:

- ./package.json
- ./app/package.json

So, before running the build script, update both package.

the `appVersion` property as this version latter is matched with latest tag from github.

When creating the github tag, it must only contain the same version as it is in the `package.json`, do not add any letter, just numbers.

- Before the release, run the script `node scripts/remove-release-folder.js` to clean the folder
- For windows use a windows computer and run script `release:windows`
- For mac use a mac computer and run script `release:mac:universal`
- For linux distributions use a linux computer and run script `release:linux`

## Github Build

- Just push a tag with the same version as in the package.json and a github action will run to create the binaries.
- Download the binaries and create a draft release, upload the binaries.
- The draft release title MUST be the version of the package without any letter, just numbers.

## Static map

- The static map is under folder ./static

## Fonts

The available fonts for pdf are in ./src/app/resources:

- Meiryo for japanese
- malgun for korean
- simsun for simplified chinese
- notosans for all the others.
  The base64 fonts are in resources/base64fonts and not in assets because is not needed that each user has the base64 fonts.

  They are already imported as base64 in the pdfService and in main chunk.

  The fonts are converted to base64 using the parallax \jsPDF\fontconverter\fontconverter.html

## Reminders (experimental)

It is possible to send a reminder with the google event old api _(can be disabled at any moment)_: https://support.google.com/calendar/thread/128416249/calendar-url-generator-which-parameters?hl=en
