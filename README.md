# FLYBOX _reloaded_
[![Build Status](https://travis-ci.org/makakoa/flybox_reloaded.svg?branch=m2_dev)](https://travis-ci.org/makakoa/flybox_reloaded)
##### "Next Generation Emailing"

To Do: 
- Attachment handling
- Search flybox
- Search email
- Variable importing
- Change flybox username/password
- Delete account (front end)
- Analytics
- Contacts

Bugs: Things that won't work
- sent link needs a url prefix
- account page cancel edit doesn't work
- importing lots of emails imports twice

Debt: Things that might not work later
- test all front end functions
- email thread not really being handled
- guest box ui

Improvements: Things that could work better
- sent emails don't have threads to them
- box add member function needs user check + guest key
- no am/pm on time stamps
- error catching

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
init {token}  
read
send:post {post}  
edit:post {post}  
init:guest {token}  
update:account  
join:box  

Logging Index: fly[ _ ]
-----------
a - account routes  
b - box routes  
i - imap/fetcher  
m - mailer/smtp  
p - passport  
s - socket routes  
u - user routes  
