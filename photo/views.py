
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
import os
from django.conf import settings
from urllib.parse import unquote
from django.contrib.auth.decorators import login_required
from urllib.parse import unquote

MEDIA_ROOT = settings.MEDIA_ROOT

from datetime import datetime

from django.conf import settings

def index(request):
    # Получаем текущую директорию из GET-параметров
    current_directory = request.GET.get('directory', '').lstrip('/')  # Убираем начальный слеш, если есть
    current_directory_path = os.path.normpath(os.path.join(MEDIA_ROOT, current_directory))

    # Убедимся, что текущая директория находится внутри MEDIA_ROOT
    if not current_directory_path.startswith(MEDIA_ROOT):
        return HttpResponse("Invalid directory path", status=400)

    # Проверяем, что директория существует
    if not os.path.exists(current_directory_path):
        os.makedirs(current_directory_path)

    # Получаем список директорий и их дату создания
    directories = [
        {
            'name': d,
            'creation_time': os.stat(os.path.join(current_directory_path, d)).st_ctime,
            'creation_date': datetime.fromtimestamp(os.stat(os.path.join(current_directory_path, d)).st_ctime).strftime('%d.%m.%Y %H:%M')
        }
        for d in os.listdir(current_directory_path)
        if os.path.isdir(os.path.join(current_directory_path, d))
    ]

    # Сортируем папки по дате создания в обратном порядке (сначала новые)
    directories = sorted(directories, key=lambda x: x['creation_time'], reverse=True)

    photos = [
        f for f in os.listdir(current_directory_path)
        if os.path.isfile(os.path.join(current_directory_path, f))
    ]

    # Передаём MEDIA_URL в шаблон
    return render(request, 'photo/index.html', {
        'current_directory': current_directory,  # Отправляем относительный путь
        'directories': directories,
        'photos': photos,
        'MEDIA_URL': settings.MEDIA_URL,  # Передаём MEDIA_URL
    })


@login_required
@csrf_exempt
def create_directory(request):
    if request.method == 'POST':
        current_directory = request.POST.get('current_directory', '').lstrip('/')
        directory_name = request.POST.get('directory_name')
        
        # Формируем путь для новой папки внутри текущей директории
        new_dir_path = os.path.normpath(os.path.join(MEDIA_ROOT, current_directory, directory_name))

        # Проверка на попытку выхода за пределы MEDIA_ROOT
        if not new_dir_path.startswith(MEDIA_ROOT):
            return HttpResponse("Invalid directory path", status=400)

        if not os.path.exists(new_dir_path):
            os.makedirs(new_dir_path)

        return redirect(f"{reverse('photo:index')}?directory={current_directory}")


import shutil
from django.http import JsonResponse

@login_required
@csrf_exempt
def delete_directory(request, directory):
    """Удаляет папку вместе со всеми вложенными файлами и папками через AJAX"""
    if request.method == 'POST':
        directory = unquote(directory).strip('/')
        dir_path = os.path.normpath(os.path.join(MEDIA_ROOT, directory))

        if not dir_path.startswith(MEDIA_ROOT):
            return JsonResponse({"error": "Ошибка: путь выходит за пределы MEDIA_ROOT"}, status=400)

        if os.path.exists(dir_path) and os.path.isdir(dir_path):
            shutil.rmtree(dir_path)  # ✅ Удаляем всю папку со всеми файлами и вложенными папками

        return JsonResponse({"success": True})  # Отправляем успешный ответ без редиректа




    
import logging

logger = logging.getLogger(__name__)

@login_required
@csrf_exempt
def upload_photo(request, directory):
    directory = unquote(directory)  # Декодируем путь
    if directory == 'root':
        directory = ''  # Корневая директория

    if request.method == 'POST' and request.FILES.getlist('photos'):
        current_directory = directory.lstrip('/')
        files = request.FILES.getlist('photos')
        directory_path = os.path.join(MEDIA_ROOT, current_directory)

        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

        for photo in files:
            file_path = os.path.join(directory_path, photo.name)
            with open(file_path, 'wb') as f:
                for chunk in photo.chunks():
                    f.write(chunk)

        return redirect(f"{reverse('photo:index')}?directory={directory}")

@login_required
@csrf_exempt
def edit_directory(request, directory):
    """Переименовывает вложенную папку"""
    if request.method == 'POST':
        directory = unquote(directory).lstrip('/')
        current_directory = os.path.dirname(directory)
        new_name = request.POST.get('new_name').strip()

        current_path = os.path.normpath(os.path.join(MEDIA_ROOT, directory))
        new_path = os.path.normpath(os.path.join(MEDIA_ROOT, current_directory, new_name))

        # Проверяем безопасность пути
        if not current_path.startswith(MEDIA_ROOT) or not new_path.startswith(MEDIA_ROOT):
            return HttpResponse("Ошибка: путь выходит за пределы MEDIA_ROOT", status=400)

        if os.path.exists(current_path) and not os.path.exists(new_path):
            os.rename(current_path, new_path)

        return redirect(f"{reverse('photo:index')}?directory={current_directory}")





