from django.db import models
import uuid


class Chat(models.Model):
    id = models.AutoField(auto_created=True, primary_key=True,
                          serialize=False, verbose_name='ID')


class Online(models.Model):
    online = models.IntegerField(verbose_name='Number of people online')
