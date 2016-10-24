#manage.py uses RACK_ENV to determine the settings file to use
import os
import urlparse
from pinry.settings import *

print '--Development Settings Loading'

HTTPS_SUPPORT = False

# quick toggles to overide init
DEBUG = True
PUBLIC = False
COMPRESS_ENABLED = False

# used in templates without context processors to prfix statc path on development server
EMAIL_STATIC_HOST_PORT = HTTP_DEV_PORT

DATA_SOURCE = 'PRODUCTION'

env_file = None

# Set development environment variables from env.py file
try:
    from pinry.settings.env import vars
    for k, v in vars.items():
        os.environ[k] = v
    env_file = 'pinry/settings/env.py'
except ImportError:
    pass

# Set development environment variables from .env file
try:
    from dotenv import load_dotenv, find_dotenv
    env_file = find_dotenv('.env')
    load_dotenv(env_file)
except ImportError:
    pass

# Confirm environment variable file
if not env_file:
    raise Exception ("Missing and environment file: \n"
                     "option1 : pinry/settings/env.py   with vars = {VARIABLE:'value'}\n"
                     "option2 : pinry/settings/.env     VARIABLE=value")
else:
    print 'Loaded %s environment variables from : %s' % (DATA_SOURCE, env_file)

# Load DATABASE_URL
try:
    var_prefix = "%s_" % DATA_SOURCE[:1] if DATA_SOURCE in ['PRODUCTION', 'STAGING'] else ''
    db_url = urlparse.urlparse(os.environ["%sDATABASE_URL" % var_prefix])
except KeyError as e:
    raise Exception('REQUIRED ENVIRONMENT VARIABLE NOT FOUND: %s' % e)

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

ADMINS = [('admin', os.environ.get("EMAIL_HOST_USER"))]
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
SEND_TEST_EMAIL = True

# Use remote storage for remote database
if not DATA_SOURCE or DATA_SOURCE != 'DEVELOPMENT':

    print 'WARNING: USING REMOTE DATABASE (%s: %s)' \
          % (DATA_SOURCE,  db_url.path[1:])

    AWS_STORAGE_BUCKET_NAME = os.environ.get('%sAWS_STORAGE_BUCKET_NAME' % var_prefix)
    DEFAULT_FILE_STORAGE = 'pinry.settings.s3utils.MediaS3BotoStorage'

    S3_URL = '//%s.s3.amazonaws.com/' % AWS_STORAGE_BUCKET_NAME
    AWS_QUERYSTRING_EXPIRE = 63115200 #2 years
    AWS_QUERYSTRING_AUTH = True

    MEDIA_URL = S3_URL+'media/'
    MEDIA_ROOT = S3_URL+'media/'

    print 'WARNING: USING REMOTE MEDIA BUCKET (%s)' % AWS_STORAGE_BUCKET_NAME

    # # uncomment below to use remote static files
    # STATIC_URL = S3_URL+'static/'
    # STATIC_ROOT = S3_URL+'static/'
    # STATICFILES_STORAGE = 'pinry.settings.s3utils.MediaS3BotoStorage'
    # COMPRESS_STORAGE = STATICFILES_STORAGE


SECRET_KEY = 'fake-key'
