# FLYBOX _reloaded_
[![Build Status](https://travis-ci.org/makakoa/flybox_reloaded.svg?branch=m2_dev)](https://travis-ci.org/makakoa/flybox_reloaded)
##### "Next Generation Emailing"

##To Do: (priority: task)  
####1 : Attachment handling  
####1 : Clean up Angular (organize into services)  
#####2 : Change flybox username/password   
#####2 : Bug fixes and audit  
#####2 : More implementation of display name  
#####2 : Search capabilities  
#####2 : Error catching (email import, others)  
######3 : Add members to existing box criteria on email import  
######3 : Add analytics page/capabilities  
######3 : Importing outbox/email acct search  
######3 : Contacts features  

*Priority Scale*  
_1: Needs to be done before v1_  
_2: Should be done before v1_  
_3: Can be done after v1_  

Debt/bugs:  
- Test all front end functions
- BUG: going from box -> compose -> box -> compose doesn't work
- Sent link needs a url prefix
- Sent emails don't have threads to them
- BUG: Account page cancel edit doesn't work
- Box add member function needs user check + guest key
- BUG: Importing lots of emails imports twice
- No am/pm on time stamps
- email thread not really being handled
- edit and delete not working perfectly
- html/text being saved

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
