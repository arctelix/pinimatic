#from pinry.core.admins import *

#handle signals from third party apps
from django.contrib.auth.models import User
from ..pins.models import Pin
from django.contrib.comments.models import Comment
from django.db.models.signals import post_save
from follow.signals import followed
from django.contrib.comments.signals import comment_was_posted, comment_was_flagged

from django.contrib.sites.models import Site
from django.conf import settings
from django.dispatch import receiver
from django.core.mail import send_mail

from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.template import Context

#prevent syncdb errors
try:
    site = Site.objects.get_current()
    site_name = site.name
    site_url = 'http://%s/' % site.domain
except:
    from django.db import connection
    connection.close()


#REFERENCE: notification.send(users, label, extra_context=None, sender=None)
#           send_observation_notices_for(observed, label, xcontext=None, exclude=None)
#           observe(observed, observer, labels)
#TODO: when notification is imported before  functions with DEBUG=Flase on heroku we get an import error
#but works with DEBUG=T/F on dev server?

@receiver(followed, sender=User, dispatch_uid='follow.user')
def user_follow_handler(user, target, instance, **kwargs):
    '''
    user: the user who acted
    target: the user that has been followed
    instance: the follow object
    '''
    from notification import models as notification
    notification.send_observation_notices_for(target, "followed", {"from_user": user, "owner": target}, [user])
    if user != target:
        notification.send([target], "followed", {"from_user": user}, sender=user)
        notification.observe(target, user, "followed")
        notification.observe(target, user, "new")
        notification.observe(target, user, "favorited")
        notification.observe(target, user, "commented")

@receiver(followed, sender=Pin, dispatch_uid='follow.pin')
def pin_favorite_handler(user, target, instance, **kwargs):
    '''
    user: the user who acted
    target: the pin that has been followed
    instance: the follow object
    '''
    from notification import models as notification
    #notify pin's followers
    notification.send_observation_notices_for(target, "favorited", {"from_user": user, "owner": target.submitter}, [user])
    #notify user's followers
    notification.send_observation_notices_for(user, "favorited", {"from_user": user, "owner": target.submitter}, [user], sender=target)
    if user != target.submitter:
        #notify pin's owner
        notification.send([target.submitter], "favorited", {"from_user": user}, sender=target)
        #make user observe new comments
        notification.observe(target, user, "commented")
        #make user observe new favorites
        notification.observe(target, user, "favorited")
    #TODO:get signal for unfollow pin & user to unobserve the pin favs and comments or is this handles automatically?
    
@receiver(post_save, sender=Comment, dispatch_uid='comment.user')
def pin_comment_handler(sender, *args, **kwargs):
    comment = kwargs.pop('instance', None)
    print comment
    user = comment.user
    target = comment.content_object
    from notification import models as notification
    #notify pin followers
    notification.send_observation_notices_for(target, "commented", {"from_user": user, "owner":target.submitter}, [user])
    #notify user's followers
    notification.send_observation_notices_for(user, "commented", {"from_user": user, "alter_desc":True, "owner":target.submitter}, [user], sender=target)
    if user != target.submitter:
        #notify pin's owner
        notification.send([target.submitter], "commented", {"from_user": user}, sender=target)
        #make comment user observe new comments
        notification.observe(target, user, "commented")
        
@receiver(post_save, sender=Pin, dispatch_uid='id')
def new_pin_handler(sender, *args, **kwargs):
    pin = kwargs.pop('instance', None)
    user = pin.submitter
    target = pin
    from notification import models as notification
    #notify user's followers
    notification.send_observation_notices_for(user, "new", {"from_user": user, "owner": target.submitter}, [user], sender=target)

       