#manage.py uses RACK_ENV to determine the settings file to use
from pinry.settings import *
from pinry.settings.production import *
import os
import urlparse

print '--Staging Settings Loading'

#DEBUG
DEBUG = True
TEMPLATE_DEBUG = DEBUG
SEND_TEST_EMAIL = True

#LOGIN CONTROLL
ALLOW_NEW_REGISTRATIONS = False
INVITE_MODE = True
PUBLIC = False

#HEROKU
db_url = urlparse.urlparse(os.environ["DATABASE_URL"])
DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': db_url.path[1:],
    'HOST': db_url.hostname,
    'PORT': db_url.port,
    'USER': db_url.username,
    'PASSWORD': db_url.password,
  }
}
