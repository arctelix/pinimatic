#manage.py uses RACK_ENV to determine the settings file to use
from pinry.settings import *
import os
import urlparse

print '--Production Settings Loading'

DEBUG = False
#TEMPLATE_DEBUG = DEBUG

ADMINS = [('admin', os.environ.get("EMAIL_HOST_USER"))]

#LOGIN CONTROLL
ALLOW_NEW_REGISTRATIONS = True
INVITE_MODE = True
INVITATIONS_PER_USER = 0

#EMAIL
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
SEND_TEST_EMAIL = False

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

#Security
HTTPS_SUPPORT = True
SECRET_KEY = os.environ.get('SECRET_KEY')

#HOST (only use in settings file for TEMP URL)
HOST_NAME = os.environ.get('HOST_NAME')
"""
SITE_URL = 'http://'+HOST_NAME
SSL_SITE_URL = 'https://'+HOST_NAME
"""

DEFAULT_FILE_STORAGE = 'pinry.settings.s3utils.MediaS3BotoStorage'
STATICFILES_STORAGE = 'pinry.settings.s3utils.StaticS3BotoStorage'
COMPRESS_STORAGE = STATICFILES_STORAGE 
#STATICFILES_STORAGE = 'pinry.settings.s3utils.CachedS3BotoStorage'

AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
print 'AWS_STORAGE_BUCKET_NAME: ', AWS_STORAGE_BUCKET_NAME
S3_URL = '//%s.s3.amazonaws.com/' % AWS_STORAGE_BUCKET_NAME
#TODO: temp measure to stop static files from expiring. How to controll the expiration date...
AWS_QUERYSTRING_EXPIRE = 63115200 #2 years
AWS_QUERYSTRING_AUTH = True

MEDIA_URL = S3_URL+'media/'
MEDIA_ROOT = S3_URL+'media/'
STATIC_URL = S3_URL+'static/'
STATIC_ROOT = S3_URL+'static/'
TMP_ROOT = os.path.join(SITE_ROOT, 'media/tmp/')
TMP_URL = 'http://%s/media/tmp/' % HOST_NAME

''' This is now a context processor and does not need to be here???
STATIC_PREFIX used to prepend full url to STATIC_URL when static files are hosted locally.
- use {{STATIC_PREFIX}}{{STATIC_URL}} for static items rendered outside base site context (bookmarklet)
- STATIC_PREFIX MUST BE = '' on production.
'''
#STATIC_PREFIX = ''

COMPRESS_ENABLED = True
COMPRESS_URL = STATIC_URL
COMPRESS_ROOT = STATIC_ROOT
COMPRESS_OFFLINE = False
"""COMPRESS_OFFLINE issue:
Compressing... Error: An error occured during rendering /app/pinry/pins/templates/pins/bmbase.html: '/static/vendor/boot
strap/2.0.3/css/bootstrap.css' isn't accessible via COMPRESS_URL ('http://pinry.s3.amazonaws.com/static/') and can't be
compressed
"""
