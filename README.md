# FLYBOX _reloaded_
[![Build Status](https://travis-ci.org/makakoa/flybox_reloaded.svg?branch=m2_dev)](https://travis-ci.org/makakoa/flybox_reloaded)
##### "Next Generation Emailing"

##To Do: (priority: task)  
####1 : Add guest box page  
####1 : Wrap pages with app shell(to handle menu bar, socket notifications, etc)  
####1 : Attachment handling  
####1 : Test socket routes  
####1 : Update front end tests  
####1 : UI work  
####1 : Stylable (WYSIWYG) text editor for composing/posting  
#####2 : Handling editing for html/text post editing  
#####2 : Change flybox username/password  
#####2 : More implementation of display name  
#####2 : Sending of link/text (needs guest box)  
#####2 : Live notifications (needs wrapper)  
#####2 : Search capabilities  
#####2 : Error catching (email import, others)  
#####2 : Online/offline socket handling  
######3 : Add members to existing box criteria on email import  
######3 : Add analytics page/capabilities  
######3 : Importing outbox/email acct search  
######3 : Contacts features  

API Routes
-----------
###Users
User login            `GET     /api/users`  
User Creation         `POST    /api/users`  
User check            `POST    /api/user/check`  
Delete account        `DELETE  /api/users`  
###Account
Account info          `GET     /api/`  
Set display name      `PUT     /api/account/name`  
Set current account   `PUT     /api/account/current`  
Add email account     `POST    /api/account/new`  
Edit email account    `PUT     /api/account`  
Delete email account  `DELETE  /api/account/remove/:id`  
###Box
Get box info          `GET     /api/boxes/:boxKey`  
Post to a box         `POST    /api/boxes/:boxKey`  
Leave box             `DELETE  /api/boxes/:boxKey`  
Get inbox             `GET     /api/boxes`  
Create/send a box     `POST    /api/boxes`  
Sync email            `POST    /api/emails/import`  

Socket Routes
-----------
#####init
(takes jwt token)
#####read
#####send:post
(takes post data)
#####edit:post
(takes post data)
