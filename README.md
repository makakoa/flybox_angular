# FLYBOX _reloaded_

[![Build Status](https://travis-ci.org/makakoa/flybox_reloaded.svg?branch=m2_dev)](https://travis-ci.org/makakoa/flybox_reloaded)

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
