#precificacao/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('precificacao-equipe/', views.precificacao_equipe, name='precificacao-equipe'),
    path('', views.precificacao_equipe),
]
