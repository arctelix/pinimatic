#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":

    if 'RACK_ENV' in os.environ:
        RACK_ENV = os.environ.get("RACK_ENV")
        print 'RACK_ENV: ', RACK_ENV
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pinry.settings."+RACK_ENV)
    else:
        print 'RACK_ENV not detected using development settings'
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pinry.settings.development")
    
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
