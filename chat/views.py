from django.shortcuts import render, redirect
from chat.models import Online


def index(request):
    o = Online.objects.get(pk=1)

    context = {
        'people_online': o.online
    }

    if request.method == 'POST':
        return redirect('chat:room')

    return render(request, 'chat/index.html', context)


def room(request):
    o = Online.objects.get(pk=1)
    context = {
        'people_online': o.online
    }

    return render(request, 'chat/room.html', context)
