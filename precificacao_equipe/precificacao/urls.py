# precificacao/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.calculo_precificacao, name='precificacao-equipe'),
    path('precificacao-equipe/', views.calculo_precificacao, name='precificacao-equipe'),
    path('salvar_pdf/', views.salvar_pdf, name='salvar_pdf'),
]