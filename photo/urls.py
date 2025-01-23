from django.urls import path
from . import views

app_name = 'photo'

urlpatterns = [
    path('', views.index, name='index'),
    path('create_directory/', views.create_directory, name='create_directory'),
    path('delete_directory/<str:directory>/', views.delete_directory, name='delete_directory'),
    path('edit_directory/<str:directory>/', views.edit_directory, name='edit_directory'),
    path('upload_photo/<str:directory>/', views.upload_photo, name='upload_photo'),
]
