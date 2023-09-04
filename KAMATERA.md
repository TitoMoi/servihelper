![logo](./pictures/kamatera-logo.svg)

# Introduction

Kamatera is a third party vendor that allows to create a Desktop environment on the cloud. ☁️

It is like your computer in your home, but accesible for everyone and always running.

This comes with a pay per use or a monthly fee. 💲

For servihelper purposes the lowest requeriments are enough.

## Benefits

Its no longer necessary to export and import files, all administrators can work on the same computer with remote access _(but not at the same time)_

## Guide to setup a desktop ubuntu (linux) environment

⚠️ This guide tries to explain the steps for a non expert person but its better to have a higher knowledge.

🕗 It takes about 1 hour to finish the setup.

### Summary of steps

- Create a kamatera account with a billing card.
- Create the desktop from the kamatera dashboard.
- Enter the desktop and create a new user, root _(administrator)_ is not allowed to run servihelper.
- Download servihelper.
- Give executable permissions to execute.

## Create kamatera account

Go to kamatera webpage: https://www.kamatera.com/ and click on Get Started

![logo](./pictures/kamatera/1.png)

Click on Create free account:

![logo](./pictures/kamatera/2.png)

Click again on create an account:

![logo](./pictures/kamatera/3.png)

After setting up the billing process, go to "My Cloud" section and "Create new Desktop" select your region and your closest country.

Select on "Choose Desktop OS" -> UBUNTU

![logo](./pictures/kamatera/4.png)

Select the last version:

![logo](./pictures/kamatera/5.png)

Select the minimum avaiability, CPU, RAM and storage like in the image, we need at least 20 GB os storage as the system updates itself the first run we dont run out of space:

![logo](./pictures/kamatera/6.png)

Set a easy password and a name for the desktop.

Choose the billing strategy, i would recommend go for a fixed tax.

![logo](./pictures/kamatera/7.png)

The Task is being done, go for a coffee ☕ _(it takes about 15min)_

![logo](./pictures/kamatera/8.png)

After the task is completed, now on Servers section we see our desktop created, click on "Open":

_(If not, refresh the page)_

![logo](./pictures/kamatera/9.png)

A new Section appears, we only need the remote connexion details, go to "Info" section:

![logo](./pictures/kamatera/10.png)

We have here the remote connection ID, the user and the password:

![logo](./pictures/kamatera/11.png)

On Windows, open the application Remote desktop connection:

_(On Mac 🖥️ you can download the app from the app store)_

![logo](./pictures/kamatera/12.png)

Put the id, with the dots between the numbers and connect:

![logo](./pictures/kamatera/13.png)

This warning is because is a new connection, we need to trust it, click on "do not ask again" and click on "connect":

![logo](./pictures/kamatera/14.png)

The same, click on do not ask again and "Yes":

![logo](./pictures/kamatera/15.png)

Now we are on the kamatera servers, put the username root and the password we got before:

![logo](./pictures/kamatera/16.png)

We are in our remote desktop! Before everything we need to create a new user, thats because servihelper doesnt run with the root _(administrator)_ user.

Open the terminal that its on the bottom bar:
![logo](./pictures/kamatera/17.png)

When the terminal is open, we are going to create the new user, write the next lines:

`sudo useradd -m servihelper`

![logo](./pictures/kamatera/18.png)

Next we need to add a password, close the console and open it again and write the next lines:

`sudo passwd servihelper`

![logo](./pictures/kamatera/19.png)

It will require a password, dont worry if you dont see anything while typing the password, its a security measure:

_(Dont go hard this password will be shared later with other administrators)_

![logo](./pictures/kamatera/20.png)

The successful message when the password is set:

![logo](./pictures/kamatera/21.png)

Now close the remote connection window, on top right just close the connection, and open again the remote desktop application, now we are going to put the new created user with his password:

![logo](./pictures/kamatera/22.png)

Once inside we see some warnings, just skip them all:

![logo](./pictures/kamatera/23.PNG)

Now open the browser, its in the bottom bar right to the terminal we opened before, it will prompt a first run message, just accept and navigate to servihelper: https://github.com/TitoMoi/servihelper

Click on Releases:

![logo](./pictures/kamatera/24.png)

Download the latest release, the linux version:

![logo](./pictures/kamatera/25.png)

Once downloaded open the folder, right click and "Show in folder" _(its in the download folder)_

![logo](./pictures/kamatera/26.png)

Now right click on the downloaded file and click on "Extract Here" it will generate a new folder:

![logo](./pictures/kamatera/27.png)

Drag the new created folder to the desktop:

![logo](./pictures/kamatera/28.png)

Then open the folder and scroll down until we find the "servihelper.AppImage" _(in the image is just servihelper)_

![logo](./pictures/kamatera/29.png)

Right click and click on "Properties"

![logo](./pictures/kamatera/30.png)

Go to permission tab and click the bottom check "Allow this file to run as a program"

_(On linux all files are just simple files)_

![logo](./pictures/kamatera/31.png)

Close the menu and double click Servihelper.AppImage, it will open servihelper and you are ready to go! 🎉

Now share the adress, the user servihelper and the password with the other administrators so they can connect with the remote desktop application.

🚫 Do not share the kamatera user, its the administrator dashboard and the billing process.

🚫 Do not open whatsapp web or other apps on the remote desktop, copy the generated files to your local machine, just copy, go to your local desktop and paste it.

Remember from time to time to make a copy of servihelper files!
