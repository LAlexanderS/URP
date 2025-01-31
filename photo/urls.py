from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

app_name = 'photo'

urlpatterns = [
    path('', views.index, name='index'),
    path('create_directory/', views.create_directory, name='create_directory'),
    path('delete_directory/<path:directory>/', views.delete_directory, name='delete_directory'),
    path('edit_directory/<path:current_directory>/<path:directory>/', views.edit_directory, name='edit_directory'),
    path('upload_photo/<path:directory>/', views.upload_photo, name='upload_photo'),
    path('delete_photo/<path:photo_path>/', views.delete_photo, name='delete_photo'),

    # Авторизация
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),
]
