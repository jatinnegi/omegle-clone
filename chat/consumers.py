import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .models import Chat, Online


class ChatConsumer(WebsocketConsumer):
    def connect(self):

        try:
            # check if there is an existing chat

            chat = Chat.objects.all()[0]
            self.chat_id = chat.id
            self.room_group_name = f'room_{self.chat_id}'

            chat.delete()

            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name
            )

            self.accept()
            o = Online.objects.get(pk=1)
            o.online = o.online + 1
            o.save()

            content = {
                'command': 'connected_message',
                'message': 'You are now connected to a stranger. Be nice!'
            }
            self.chat_message(content=content)

        except IndexError:
            # if no existing chat then create one

            chat = Chat.objects.create()
            self.chat_id = chat.id
            self.room_group_name = f'room_{self.chat_id}'

            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name
            )

            self.accept()

            o = Online.objects.get(pk=1)
            o.online = o.online + 1
            o.save()

    def disconnect(self, close_code):
        try:
            chat = Chat.objects.get(id=self.chat_id)
            chat.delete()
            o = Online.objects.get(pk=1)
            o.online = o.online - 1
            o.save()

        except Chat.DoesNotExist:
            o = Online.objects.get(pk=1)
            o.online = o.online - 1
            o.save()

        self.chat_message(content={'command': 'disconnect_message'})

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def new_message(self, data):
        username = data['username']
        message = data['message']

        content = {
            'command': 'chat_message',
            'username': username,
            'message': message
        }

        self.chat_message(content=content)

    def disconnect_message(self, data):
        username = data['username']

        content = {
            'command': 'disconnect_message',
            'username': username
        }

        self.chat_message(content=content)

    def user_typing(self, data):
        username = data['username']

        content = {
            'command': 'user_typing',
            'username': username
        }

        self.chat_message(content=content)

    commands = {
        'new_message': new_message,
        'disconnect_message': disconnect_message,
        'user_typing': user_typing
    }

    def receive(self, text_data):
        data = json.loads(text_data)
        self.commands[data['command']](self, data)

    def chat_message(self, content):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_message',
                'message': content
            }
        )

    def send_message(self, event):
        message = event['message']

        self.send(text_data=json.dumps(message))
