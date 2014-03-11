# ![Pinimatic](https://github.com/arctelix/pinimatic/raw/master/logo.png)


Pinimatic is a self-hosted, [Pinterest][0] inspired by [Wookmark][1] and
built on top of Django. Originally started as [Pinry][2], I greatly expanded upon the basic
Pinry it to make a fully functional, socially integrated, pinboard site.  Pinimatic is currently in 
Alpha/Development, some upgrades may be ugly/not work till v1.0.0 is released.

![Pinimatic Screenshot](https://github.com/arctelix/pinimatic/raw/master/screenshot.png)

## Getting Started

### 1) Have virtualenv and pip installed. You may also need to have the build dependencies for PIL installed.

- Note: On windows you must install the appropriate windows binary version of Pillow for your system.
  They can be found at: http://www.lfd.uci.edu/~gohlke/pythonlibs/
  *Remember to change the install directory to your virtual environment. 

- Note: On Ubuntu you can get the build deps by running
  `sudo apt-get build-dep python-imaging`.

### 2) Installation:

    $ git clone git://github.com/arctelix/Pinimatic.git
    $ cd Pinimatic
    $ virtualenv .
    $ Scripts\activate (activate your virtual env)

### 3) Pinimatic has three different customizable configurations, at the leaset you must follow the instructions for  development:

#### Development

Pinimatic is configured out of the box to run on django's built in development server on port 5000.
You may change the port in the settings.  The database is set up for PostgreSQL, but settings for sqLite
are there as well.

- The following settings must be configured in settings/env.py (you will need to create this file)
 - To use PostressSQL set: DB_PASSWORD
 - To enable sending email set: ```EMAIL_HOST_PASSWORD```, ```EMAIL_HOST_USER```
- SSL support is enabled by default.  For this to work you must configure 
[stunnel][3] or similar to handle SSL for your development server.  Other wise in ```settings/__init__.py``` set ```HTTPS_SUPPORT = False``` and skip the Stunnel setup. 

Stunnel: Setup your stunnel.conf (all other settings must be commented out):

    ;DJANGO
    fips = no
    cert = stunnel.pem
    sslVersion = SSLv3
    [https]
    accept=5443
    connect=5000
    TIMEOUTclose=1

#### Production

Pinimatic is configured to run on Heroku with Gunicorn in the production environment.
You must configure heroku as follows:
- Create a Heroku account and add postgreSQL to your account.
- Create amazon S3 account and set up a bucket.
- Set Heroku env variable ```RACK_ENV = production```
- Set Heroku env variable ```SECRET_KEY = any random string```
- Set Heroku env variables for the database: ```DB_USER```, ```DB_PASSWORD```, ```DB_NAME```
- Set Heroku env variables for email: ```EMAIL_HOST_PASSWORD```,```EMAIL_HOST_USER```
  according to your email smtp server.
- set Heroku env variables ```AWS_ACCESS_KEY_ID```, ```AWS_SECRET_ACCESS_KEY```, ```S3_BUCKET_NAME```
  according to your amazon S3 bucket.

#### Staging
Pinimatic is configured to run on Heroku with the built in development server in the 
staging environment. You must configure heroku the same as above with the following changes:
- Set Heroku env variable ```RACK_ENV = staging```

### 4) Install requirements and initilize the database:

NOTE: If you are useing postgreSQL (default), you must make sure you have postreSQL on your system environment variable PATH.

***Install requirements for windows:***
NOTE: If you ARE useing postgreSQL and do not have postgreSQL configured on your system install it now. You will have to manually coppy psycopg2 into lib/site-packages.  [HERE][4] is more info.


    $ pip install -r requirements-win.txt
    
***Install requirements for all other operating systems:***
NOTE: If you are not useing postgreSQL and do not have postgreSQL configured on your system pip will fail when installing psycopg2==2.5. To avoid this, you can remove psycopg2==2.5 from requirements.txt before installing.

    $ pip install -r requirements.txt

***Initilize the database (everybody):***

    $ python manage.py syncdb
    $ python manage.py migrate
    
***Run the server on port 5000 unless you changed it in settings:***

    $ python manage.py runserver 0.0.0.0:5000
    
NOTE: If you are installing with an existing database for pinimatic and have a migration fail because it exists already , then fake the migration ex: ```$ ./manage.py migrate appname xxxx --fake```

### 5) Quick Settings

There are a few settings provided specific to Pinimatic that allow you to get some
of the most requested functionality easily. (Pinimatic/settings/__init__.py)

 + **SITE_NAME=**: For quickly changing the name Pinimatic to something you prefer.
 + **ALLOW_NEW_REGISTRATIONS=**: Set to False to prevent people from registering.
 + **PUBLIC=**: Set False to require people to register before viewing pins.
  - (Note: Setting PUBLIC to False allows new registrations and login. 
 + **INVITE_MODE=**: Set to true to allow new registrations by invitation only.
  - See [https://github.com/arctelix/django-invitation.git] for more information on invitation settings.
 + **ALLAUTH:**: Many settings available for customization of login and signup.
  - See [https://github.com/arctelix/django-allauth.git] for more information on allauth settings.
 + **EAMIL:**: Several settings as per your email smtp server requirements.
 + **P3P_COMPACT=**: Set acording to your privacy policy
 + **HTTPS_SUPPORT=**: Set True if your server has SSL support

 
## Current Features
  
### Current Pin Features
 + Pin Tagging
 + User groups
 + Filter pin views
 + User profiles
 + Add images via Bookmarklet
 + Add images via Upload
 + Add images via URL
 + Delete & Edit Pins
 + Favorite / Follow pins
 + Follow users
 + Re-Pining
 + Comment on pins
 + Tag auto recognition
 + Tag auto suggest
 + Notifications by email and website
 
### Current User Account Features
 + User contact form for feedback & support
 + User profile pages with stats
 + Support for multiple Social Connections 
 + Support for multiple Email Addresses with verification & primary setting
 + Local User Accounts & Social Account Connections
 + Notification management

### Current Admin Features 
 + Invitation Only Mode for new registrations
 + Block all new registrations even with valid invitations
 + Send Bulk email to users via admin actions in user model
 + Send Bulk invitations to a list of email addresses (specific to recipient)
 + Generate Bulk invitation codes with specific number of uses
 + Superusers have control over all users pins while browsing the site.
 
### Current Security & Compatability Features
 + SSL implimented in all environments, including development for testing.
 + P3P implimented (please edit the policy acording to your privacy policy)
 
### Roadmap
 + Public / Private pins
 + Non-image URL pinning


## License (Simplified BSD)

Copyright (c) Simplex Studio (arctelix)
Copyright (c) Isaac Bythewood

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


[0]: http://pinterest.com/
[1]: http://www.wookmark.com/
[2]: https://github.com/overshard/pinry
[3]: https://www.stunnel.org/index.html
[4]: http://www.stickpeople.com/projects/python/win-psycopg/index.2.5.1.html
