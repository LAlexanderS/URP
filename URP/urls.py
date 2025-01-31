from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from photo.views import custom_404_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('photo.urls', namespace='photo')),

    # Обслуживание медиа-файлов, если DEBUG = False
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

handler404 = custom_404_view

# Обслуживание статических и медиа-файлов только при DEBUG = True
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
