#models.py
from django.db import models

class Funcionario(models.Model):
    nome = models.CharField(max_length=255)
    cargo = models.CharField(max_length=100)
    salario = models.DecimalField(max_digits=10, decimal_places=2)
    # Outros campos relevantes

class Projeto(models.Model):
    nome = models.CharField(max_length=255)
    descricao = models.TextField()
    funcionarios = models.ManyToManyField(Funcionario)
    # Outros campos relevantes

class CalculoPrecificacao(models.Model):
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE)
    total_servico_prestado = models.DecimalField(max_digits=10, decimal_places=2)
    preco_venda_com_impostos = models.DecimalField(max_digits=10, decimal_places=2)
    # Outros campos e cálculos relevantes
