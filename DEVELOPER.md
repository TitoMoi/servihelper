# Introduction

Servihelper aims to:

- Provide an universal app to create and share assignments or territories on Windows, Mac and Linux.
- Web app is not possible today as it needs access to the filesystem to be free.
- 1 repository of code for all 3 platforms _(windows, apple, linux)_
- It's provided with free development cost _(no apple id)_ with free distribution _(github)_ free use and free colaboration between diferent administrator actors using the function of import and export files.
- The administrator user must download new versions when they are available and work all together with the same version.
- Be accessible and provided in as many languages as possible.

## Development Setup

- After cloning the repository, create a folder "assets" in root _(This is for development and do not modify the originals)_
- Copy all src/assets content into the new created root _"assets"_ folder.

## Language

Servihelper uses transloco and transloco locale for dates. And date-fns for statistics locales.
These files must be updated when adding a new language:

- src/assets/i18n/all-locales
- app/transloco/translocoRoot.module.ts
- app/assignment/customDateAdapter.ts
- app/statistics/assistant-count/assistant-count.component.ts
- app/statistics/global-count/global-count.component.ts
- app/statistics/principal-count/principal-count.component.ts

Language files must be sorted when adding keys with the command: `node scripts/sort-i18json.js`

- It's NOT possible to remove extra keys with `transloco-keys-manager extract --remove-extra-keys` because some keys are not in the template.

- It's possible to add the missing keys to all the other files with `npm run i18n:find:add`

## Lazy load

Servihelper doesnt use angular lazy load as it is a desktop app and network is not an issue.

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

- The static map is under folder ./docs. Github pages publishes it with CI/CD when the branch `map` has changes on folder docs.
- Do not create commits on branch map, develop only in `main` branch and merge it to `map` branch.

## Migrate process

- migration.json only exists when the program imports in offline mode.
- Do not create migration.json on src/assets and do not add it to src/assets/backup/source

## Fonts

The available fonts for pdf are in ./src/app/resources:

- Meiryo for japanese
- malgun for korean
- simsun for simplified chinese
- notosans for all the others.

  The base64 fonts are in resources/base64fonts and not in assets because is not needed that each user has the base64 fonts.

  They are already imported as base64 in the pdfService and in main chunk.

  The fonts are converted to base64 using the parallax \jsPDF\fontconverter\fontconverter.html

### Templates

The templates are word and pdf.

The key diference is the mantainance.

| original pdf vs emulated pdf | original | emulated    |     |     |
| ---------------------------- | -------- | ----------- | --- | --- |
| number of templates          | N        | 0 - is code |     |     |
| Immediate change             | No       | Yes         |     |     |
| Translation effort           | No       | Yes         |     |     |
| Template check if exists     | Yes      | No          |     |     |

Clearly, the emulated version is more mantainable as we do not depend on third persons or new pdf version
that cannot be manipulated.

## Reminders (experimental)

It is possible to send a reminder with the google event old api _(can be disabled at any moment)_: https://support.google.com/calendar/thread/128416249/calendar-url-generator-which-parameters?hl=en

## To keep in mind

On `image-assignment.component.ts` we use the class `fw-bold` from bootstrap. Do not remove it as it is used to show the image name in bold when the image is selected.

On `assignment.component.ts` we do a fake pagination.

To reload `assignment.component.ts` we do a navigation to home and then we navigate back to assignment but to his child create: `assignment/create` this is because navigating only to assignment the routes become inestable, it seems its because the inner `router-outlet` in assignment component, but navigating to a direct children doesnt harm the routing.
We navigate to the children and click on cancel button and we are back to assignment list.

The translation values for the assign type keys and room keys are in `src/assets/i18n` this is a dependency on the translation. The administrator can give a name to the assign type and room keys and this initial translation wont be used anymore.

On development, the images of the maps doesnt load if we edit a territory, its looking into `src/app/assets/source/images` you can put there images but remove them later so they dont get uploaded in a commit.

It's possible to create new assign types in the assets folder, its prepared to create them and assign new references for all the participants.
