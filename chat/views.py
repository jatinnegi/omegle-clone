from django.shortcuts import render, redirect


def index(request):
    context = {}

    if request.method == 'POST':
        return redirect('chat:room')

    return render(request, 'chat/index.html', context)


def room(request):
    context = {}

    return render(request, 'chat/room.html', context)
