import os
import socket
from django.contrib.messages import constants as messages

print '--General Settings Loading'

'''
BASIC SETTINGS
'''
DEBUG = True
TEMPLATE_DEBUG = DEBUG
# Changes the naming on the front-end of the website.
SITE_NAME = 'Pinimatic'
# Infroms javaScript of current api name.
API_NAME = 'v1'
# Set acording to django-sites config
SITE_ID = 1
# Set to False to force users to login before seeing any pins. 
PUBLIC = True
# Set acording to your privacy policy. 
P3P_COMPACT = 'CP="NOI OUR NID PSA"'

''' 
HTTPS & PORTS 
Required for development server only
- You must run the development server with the ports specified below
- to handle http & https redirects. They are not needed in a production env.
- ie: python manage.py runserver 0.0.0.0:5000, forman uses 5000 by default.
- set stunnel or similar SSL proxy to handle the SSL requests on the port specified.
'''
HTTP_DEV_PORT = '5000'
HTTPS_DEV_PORT= '5443'
HTTPS_SUPPORT = True

"""
SECURITY WARNING: If the headder specified in SECURE_PROXY_SSL_HEADER is not supported on your production
server you must limit this settings value to the developemnt environment ONLY!!!!
"""
#For request.is_secure() with heroku & dev server
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
#These paths will be forced to HTTPS and all others will be forced to HTTP
SECURE_REQUIRED_PATHS = (
    '/admin/',
    '/accounts/',
    '/management/',
    '/contact/',
)
#Do not force HTTP or HTTPS on these paths
SECURE_IGNORED_PATHS = (
    '/api/',
    '/bookmarklet/',
    '/static/',
    '/media/',
    '/ajax/',
)
'''
LOGIN & LOGOUT
'''
# Set true to allow new registratoins / false will block even with valid invitation
ALLOW_NEW_REGISTRATIONS = True
LOGIN_URL = '/accounts/login/'
LOGIN_REDIRECT_URL = '/'
# TODO: Not working possible version issue: 
ACCOUNT_LOGOUT_REDIRECT_URL ='/login/'
''' 
ALLAUTH
'''
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = LOGIN_URL
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = '/user/all/'
ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 3
ACCOUNT_USERNAME_MIN_LENGTH = 3
ACCOUNT_PASSWORD_MIN_LENGTH =6
ACCOUNT_ADAPTER ="pinry.core.accountadapter.AccountAdapter"
SOCIALACCOUNT_ADAPTER ="pinry.core.accountadapter.SocialAccountAdapter"
'''
INVITATIONS
'''
INVITE_MODE = True
ACCOUNT_INVITATION_DAYS = 30
ACCOUNT_ACTIVATION_DAYS = 20
INVITATIONS_PER_USER = 5
INVITATION_USE_ALLAUTH = True
''' 
USERS
'''
DEFAULT_USER_GROUP = 'basic'
''' 
NOTIFICATION
'''
#KEY_WORD_TO_URL_TRANSLATIONS = {'pin':'your'}
#NOTIFICATION_CONTENT_TYPE_TRANSLATIONS = {'user':'you'}
NOTIFICATION_OTHER_KEY_WORDS = {'you':'/user/'}
#NOTIFICATION_CHECK_FOR_SENDER_NAMES = {'pin':['submitter','/user/']}
#NOTIFICATION_OBSERVED_SPLITS = {{
''' 
LOCATION
'''
TIME_ZONE = 'America/New_York'
LANGUAGE_CODE = 'en-us'
USE_I18N = True
USE_L10N = True
USE_TZ = True
""" This is now a context processor
STATIC_PREFIX = SITE_URL: used to prepend full url to STATIC_URL when static files are hosted locally.
- use {{STATIC_PREFIX}}{{STATIC_URL}} for static items rendered outside base site context (bookmarklet)
- STATIC_PREFIX MUST BE = '' on production.
"""
'''
 PATHS & URLS
'''
RACK_ENV = os.environ.get("RACK_ENV", False)

#ONLY USE FOR DEV SERVER MEDIA URL
import socket
try:
    HOST_IP = socket.gethostbyname(socket.gethostname())
except:
    HOST_IP = localhost

"""MOVED TO: core.context_processors.py
HOST_NAME = os.environ.get('HOST_NAME', SITE_IP)
SITE_URL = 'http://'+HOST_NAME+':'+HTTP_DEV_PORT
SSL_SITE_URL = 'https://'+HOST_NAME+':'+HTTPS_DEV_PORT
"""
ROOT_URLCONF = 'pinry.urls'
INTERNAL_IPS = ['127.0.0.1']
SITE_ROOT = os.path.join(os.path.realpath(os.path.dirname(__file__)), '../../')
MEDIA_ROOT = os.path.join(SITE_ROOT, 'media/')
MEDIA_URL = 'http://'+HOST_IP+':'+HTTP_DEV_PORT+'/media/'
TMP_ROOT = os.path.join(SITE_ROOT, 'media/tmp/')
TMP_URL = '/media/tmp/'
from pinry.core.utils import safe_base_url
STATIC_ROOT = os.path.join(SITE_ROOT, 'static/')
STATIC_URL = '/static/'
#Uplaoded images path
IMAGES_PATH = 'pins/pin/originals/'
'''
Django Compressor Settings
'''
COMPRESS_ENABLED = True
COMPRESS_URL = STATIC_URL
COMPRESS_ROOT = STATIC_ROOT
COMPRESS_OFFLINE = False
#COMPRESS_STORAGE = STATICFILES_STORAGE
'''
API
'''
API_LIMIT_PER_PAGE = 30
'''
EMAIL
'''
#TODO: impiment this in all email, currently only in admin send_email
EMAIL_RECIPIANT_NAME = 'first_name'
DEFAULT_FROM_EMAIL = 'Pinimatic <pinimatic@gmail.com>'
EMAIL_USE_TLS = True
EMAIL_PORT = '587'
EMAIL_HOST = 'smtp.gmail.com'
#test onserver start
SEND_TEST_EMAIL = False

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)
MIDDLEWARE_CLASSES = (
    'pinry.core.middleware.DevHttpsMiddleware',
    'pinry.core.middleware.SecureRequiredMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    #'django.contrib.auth.middleware.RemoteUserMiddleware',
    'pinry.core.middleware.CustomHeaderMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'pinry.core.middleware.Public',
    'pinry.core.middleware.AllowOriginMiddleware', 
    'pinry.core.middleware.AjaxMessaging',
    'pinry.core.middleware.P3PHeaderMiddleware',
    #'pinry.core.middleware.SessionNextMiddleware',
    
)
TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.core.context_processors.request",
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages",
    "pinry.core.context_processors.template_settings",
    "pinry.core.context_processors.urls",
    "pinry.core.context_processors.staticPrefix",
    "pinry.core.context_processors.redirects",
    "allauth.account.context_processors.account",
    "allauth.socialaccount.context_processors.socialaccount",
    "invitation.context_processors.remaining_invitations",
    "notification.context_processors.notification",
) 

COMPRESS_CSS_FILTERS = ['compressor.filters.css_default.CssAbsoluteFilter', 'compressor.filters.cssmin.CSSMinFilter']



AUTHENTICATION_BACKENDS = (
    # Needed to login by username in Django admin, regardless of `allauth`
    "django.contrib.auth.backends.ModelBackend",

    # `allauth` specific authentication methods, such as login by e-mail
    "allauth.account.auth_backends.AuthenticationBackend",
)

MESSAGE_TAGS = {
    messages.WARNING: 'alert click',
    messages.ERROR: 'alert alert-error fade-out click',
    messages.SUCCESS: 'alert alert-success fade-out click',
    messages.INFO: 'alert alert-info click',
}

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.sites',
    'django.contrib.humanize',
    'south',
    'compressor',
    'taggit',
    'pinry.vendor',
    'pinry.core',
    'pinry.pins',
    'pinry.api',
    'pinry.bookmarklet',
    'pinry.allauthtemplates',
    'storages',
    'django.contrib.comments',
    'follow',
    'gunicorn',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    # ... include social providers you want to enable:
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.linkedin',
    #'allauth.socialaccount.providers.twitter',
    'invitation',
    'notification',
)
SOCIALACCOUNT_PROVIDERS ={ 
    'facebook':
        { 'SCOPE': ['email', 'publish_stream'],
          'AUTH_PARAMS': { },
          'METHOD': 'js_sdk'},
    'linkedin':
        { 'SCOPE': ['r_emailaddress', 'r_basicprofile'] }
    }