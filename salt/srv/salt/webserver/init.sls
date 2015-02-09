# Install or check Apache installation
apache2:
  pkg:
    - installed

# Ensure service is started at beginning or restarted upon configuration changes
apache2_restart:
  service.running:
    - name: apache2
    - enable: True
    - reload: True
    - require:
      - pkg: apache2
    - watch:
      - pkg: apache2
      - file: /etc/apache2/sites-available/010-meteor.conf
      - file: /etc/apache2/sites-enabled/010-meteor.conf

# Create a directory for Meteor static assets
/var/www/meteor:
  file.directory:
    - makedirs: True
    - user: meteor
    - group: meteor
    - mode: 755

# Set a simple test page
/var/www/meteor/test.html:
  file.managed:
    - source: salt://webserver/test.html
    - skip_verify: True
    - user: meteor
    - group: meteor
    - mode: 644
    - require:
      - file: /var/www/meteor

# Create the Meteor's configuration for Apache
/etc/apache2/sites-available/010-meteor.conf:
  file.managed:
    - source: salt://webserver/010-meteor.conf
    - skip_verify: True
    - mode: 644

# Enable Meteor's configuration
/etc/apache2/sites-enabled/010-meteor.conf:
  file.symlink:
    - target: /etc/apache2/sites-available/010-meteor.conf
    - require:
      - file: /etc/apache2/sites-available/010-meteor.conf