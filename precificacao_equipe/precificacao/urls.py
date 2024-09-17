# precificacao/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.calculo_precificacao, name='precificacao-equipe'),
    path('precificacao-equipe/', views.calculo_precificacao, name='precificacao-equipe'),
]