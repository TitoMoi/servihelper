![logo](./pictures/servihelper-logo.png)

# Introduction

Servihelper is an executable app that runs on the machine _(Windows, Mac or Linux)_

The program is free.

Your data is managed internally on the local device with .json and .gz files, so it never goes to the internet.

Its purpose is for help the Jehovah's witnesses to:

- Create and manage all kind of assignments _(Also public speech assignments)_
- Territory creation and distribution.

The purpose of Servihelper is:

- Provide a free cost for the user _(you)_ and a free cost for the developer _(me)_
- Also provide a very friendly user interface.

## Download links

Download app section: [Download for Windows, Mac or Linux](https://github.com/TitoMoi/servihelper/releases).

## The executable is not recognized on Mac

Thats because i dont have an Apple developer Id _(i have to pay for it)_, you need to trust the binary manually, go to:

mac -> security tab -> general tab and below the section are the instructions to allow it.

<img src="./pictures/allow-mac.png" alt= "allow-mac">

More help: [Open a Mac app from an unidentified developer](https://support.apple.com/en-gb/guide/mac-help/mh40616/mac)

## Example images

Native, general purpose assignment slip:

<img src="./pictures/assignment-example.png" alt= "example" width="300" height="320">

S89 slip with theme if is return visit or initial call:

<img src="./pictures/assignment-s89-example.png" alt= "example" width="330" height="420">

## Example territory images

Overview:
<img src="./pictures/map.png" alt= "map-overview">

Edition:
<img src="./pictures/map-update.png" alt= "map-update">

Heatmap:
<img src="./pictures/map-heatmap.png" alt= "map-heatmap">

## Languages

Available interface languages are at the end of the page.

In case your language is not supported, the native sheet _(assignment)_ to distribute can be customized so you can add your language when distributing.

## What cannot be done or implemented?

Diferent persons working _at the same time_ and being free is not possible.

But it's possible to work one after another.

**Free mode**:

_(All the next scenarios have no sync process, all imported files from person one will override the existing ones of person two)_

1. Export the app data from administrator one and importing in the app of the administrator two _(not recommended)_

   - Do not activate online mode
   - Do not use shared folder _(google drive or others...)_
   - _(Easy, no complexity but an overhead to understand wich and where is the latest copy)_

2. Enable built in online mode with a shared folder _(google drive, one drive... also not recommended)_

   - Required setup inside Servihelper in the config section to configure the shared folder.
   - Required knowledge of how to install and run google drive app _(or other solution)_
   - Your responsability to ensure that all files are sync before working.
   - Warning: Sometimes data is not updated on real time. _(some complexity but later has no overhead, just check you are online and google drive is working and sync)_

3. Use **only** google drive _(or other solution)_ to centralize and share copies of servihelper. 

   - Do not enable online mode.
   - Required knowledge of how to install and run google drive app _(or other solution)_
   - Your responsability to ensure that you have the last backup before working.
   - Import the last backup, work locally and export it to the shared folder. _(little complexity and a bit of overhead later, on finish you have to save your backup to the shared folder and notify, **this is the most robust approach and the one i recommend**)_  

**Paid mode**:
Configure a remote desktop and avoid the need to export and import data manually. This requires a person with medium/advanced skills and a bit of overhead to configure _(not recommended)_

[Guide to configure a remote desktop with kamatera](./KAMATERA.md)

## ¿Can I distribute it?

Yes, although it is recommended that you distribute the download link, as a new version may have come out with some correction or new feature.

## ¿How do I distribute the assignments?

- Digital distribution:
  - In the assignments section, an icon sheet appears in the -Image- column. Click, watch the preview and copy to clipboard. Then paste on whatsapp.
  - On report section select "multiple sheets and s89 slips" and click "generate png files" button for native or s89 slips, it will create a folder for each participant with his assignments.

- Print:
  - On the reports section select "multiple sheets" there is a print button for the native slips.
  - On generating the s89 slips you can open the pdf and print it.

## ¿How do I distribute the territories?

- There is a link that you can distribute for each territory.
- You can also distribute a pdf _(more friendly)_

## When selecting the participant for the assignment, a number is displayed next to it, what is it?

It is the number of times the participant has participated in that type of assignment with that role _(principal or assistant)_

## ¿How do I report a bug or ask for a feature?

You can use github issues or send me an email to servihelper@gmail.com

## ¿Can it be translated to my language?

Yes, send me the file located on assets/i18n/en.json translated attached by email and the name of the language.

## Im a developer, can i contribute?

Yes, fix, perf, refactor, test and docs are welcome.

### Available languages

- English
- Spanish
- French
- Catalan
- Portuguese
- Italian
- German
- Deutch
- Greek
- Romanian
- Polish
- Turkish
- Russian
- Japanese
- Korean
- Chinese simplified
- Hindi
- Bengali
