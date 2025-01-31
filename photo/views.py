
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
import os
from django.conf import settings
from urllib.parse import unquote
from django.contrib.auth.decorators import login_required
from urllib.parse import unquote
from datetime import datetime
from django.conf import settings
import shutil
from django.http import JsonResponse
import logging
import json

MEDIA_ROOT = settings.MEDIA_ROOT

def index(request):
    current_directory = request.GET.get('directory', '').lstrip('/')
    current_directory_path = os.path.normpath(os.path.join(MEDIA_ROOT, current_directory))

    # Проверка безопасности пути
    if not current_directory_path.startswith(MEDIA_ROOT):
        return HttpResponse("Invalid directory path", status=400)

    # Создание директории, если её нет
    if not os.path.exists(current_directory_path):
        os.makedirs(current_directory_path)

    # Получаем список директорий
    directories = [
        {
            'name': d,
            'creation_time': os.stat(os.path.join(current_directory_path, d)).st_ctime,
            'creation_date': datetime.fromtimestamp(os.stat(os.path.join(current_directory_path, d)).st_ctime).strftime('%d.%m.%Y %H:%M')
        }
        for d in os.listdir(current_directory_path)
        if os.path.isdir(os.path.join(current_directory_path, d))
    ]

    # Сортируем папки по дате создания (от новых к старым)
    directories = sorted(directories, key=lambda x: x['creation_time'], reverse=True)

    # Разделяем фото и видео
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
    video_extensions = {'.mp4', '.webm', '.mov', '.avi', '.mkv'}

    photos = []
    videos = []

    for file in os.listdir(current_directory_path):
        file_path = os.path.join(current_directory_path, file)
        if os.path.isfile(file_path):
            ext = os.path.splitext(file)[1].lower()
            if ext in image_extensions:
                photos.append(file)
            elif ext in video_extensions:
                videos.append(file)

    return render(request, 'photo/index.html', {
        'current_directory': current_directory,
        'directories': directories,
        'photos': photos,
        'videos': videos,  # Передаем видео отдельно
        'MEDIA_URL': settings.MEDIA_URL,
    })

@login_required
@csrf_exempt
def create_directory(request):
    if request.method == 'POST':
        current_directory = request.POST.get('current_directory', '').lstrip('/')
        directory_name = request.POST.get('directory_name')
        
        # путь для новой папки
        new_dir_path = os.path.normpath(os.path.join(MEDIA_ROOT, current_directory, directory_name))
        if not new_dir_path.startswith(MEDIA_ROOT):
            return HttpResponse("Invalid directory path", status=400)

        if not os.path.exists(new_dir_path):
            os.makedirs(new_dir_path)

        return redirect(f"{reverse('photo:index')}?directory={current_directory}")

@login_required
@csrf_exempt
def delete_directory(request, directory):
    if request.method == 'POST':
        directory = unquote(directory).strip('/')
        dir_path = os.path.normpath(os.path.join(MEDIA_ROOT, directory))

        if not dir_path.startswith(MEDIA_ROOT):
            return JsonResponse({"error": "Ошибка: путь выходит за пределы MEDIA_ROOT"}, status=400)

        if os.path.exists(dir_path) and os.path.isdir(dir_path):
            shutil.rmtree(dir_path)

        return JsonResponse({"success": True})

logger = logging.getLogger(__name__)

@login_required
@csrf_exempt
def upload_photo(request, directory):
    directory = unquote(directory)  # Декодируем путь
    if directory == 'root':
        directory = ''

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
def edit_directory(request, current_directory, directory):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            new_name = data.get("new_name", "").strip()

            if not new_name:
                return JsonResponse({"error": "Новое имя не может быть пустым"}, status=400)

            current_directory = unquote(current_directory).strip("/")
            directory = unquote(directory).strip("/")

            current_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, current_directory, directory))
            new_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, current_directory, new_name))

            if not current_path.startswith(settings.MEDIA_ROOT) or not new_path.startswith(settings.MEDIA_ROOT):
                return JsonResponse({"error": "Некорректный путь"}, status=400)

            if not os.path.exists(current_path):
                return JsonResponse({"error": "Исходная папка не найдена"}, status=404)

            if os.path.exists(new_path):
                return JsonResponse({"error": "Папка с таким именем уже существует"}, status=400)

            os.rename(current_path, new_path)

            return JsonResponse({"success": True, "new_name": new_name})
        except json.JSONDecodeError:
            return JsonResponse({"error": "Ошибка обработки запроса"}, status=400)


def custom_404_view(request, exception):
    return render(request, 'error/404.html', status=404)



