from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import setup_user_email
from django.conf import settings
from invitation.models import InvitationKey
from invitation.forms import InvitationKeyForm
from invitation.backends import InvitationBackend

is_key_valid = InvitationKey.objects.is_key_valid

class AccountAdapter(DefaultAccountAdapter):

    def is_open_for_signup(self, request):
        """
        Checks whether or not the site is open for signups.

        Next to simply returning True/False you can also intervene the
        regular flow by raising an ImmediateHttpResponse
        """
        print '--is open for signup--'
        print request.session.items()
        invitation_key = request.session.get('invitation_key', False)
        invitation_email = request.session.get('invitation_email', False)
        social_login = request.session.get('socialaccount_sociallogin', False)
        if social_login:
            user = social_login.account.user
            social_email = user.email
        else:
            social_email = False
        if getattr(settings, 'ALLOW_NEW_REGISTRATIONS', False):
            if getattr(settings, 'INVITE_MODE', False):
                if invitation_key:
                    if is_key_valid(invitation_key):
                        self.stash_email_verified(request, invitation_email)
                        if social_email and invitation_email == social_email:
                            self.stash_email_verified(request, social_email)
                            is_verified = self.is_email_verified(request, user.email)
                            print 'social_email: ',social_email, is_verified
                            #save verifed email address (need user object...)
                            '''
                            from allauth.account.models import EmailAddress
                            print '------is open for sign up - set up verified email------'
                            email_address = EmailAddress.objects.create(user=user,
                                                email=user.email,
                                                verified=is_verified,
                                                primary=True)
                            '''
                        print 'invitation_email: ',invitation_email
                        return True
                    else:
                        template_name = 'invitation/wrong_invitation_key.html'
                        raise ImmediateHttpResponse(direct_to_template(request, template_name, extra_context)) 
            else:
                return True
        else:
            return False

class SocialAccountAdapter(DefaultSocialAccountAdapter):

    def pre_social_login(self, request, sociallogin):
        print '----custom---------pre_social_login---------------------'
        """
        Invoked just after a user successfully authenticates via a
        social provider, but before the login is actually processed
        (and before the pre_social_login signal is emitted).

        You can use this hook to intervene, e.g. abort the login by
        raising an ImmediateHttpResponse
        
        Why both an adapter hook and the signal? Intervening in
        e.g. the flow from within a signal handler is bad -- multiple
        handlers may be active and are executed in undetermined order.
        """
        # add sociallogin to session, because sometimes it's not there...
        request.session['socialaccount_sociallogin'] = sociallogin

