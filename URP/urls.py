from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from photo.views import custom_404_view
from django.urls import re_path
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('photo.urls', namespace='photo')),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

handler404 = custom_404_view

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
