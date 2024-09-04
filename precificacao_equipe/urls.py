#precificacao_equipe/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('precificacao.urls')),  # Inclui as URLs do app
]
