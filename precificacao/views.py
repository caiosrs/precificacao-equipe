from django.shortcuts import render
import pandas as pd
from datetime import datetime
import json

# Definir o caminho para o arquivo Excel
ExcelPrecificacao = r'\\10.1.1.2\ti\BaseCalculos\PrecificacaoEquipe.xlsx'

def ler_planilha():
    try:
        df = pd.read_excel(ExcelPrecificacao, sheet_name='Índice Informatec', header=None)
        df = df.iloc[5:10, 0:2]
        df.columns = ['Lucratividade desejada', 'Índice']
        df = df.reset_index(drop=True)
        indice_informatec = df
        return indice_informatec
    except Exception as e:
        print(f"Erro ao ler o arquivo Excel: {e}")
        return None

# Obter o dia de hoje
dia_hoje = datetime.now()

# Data do dissídio
data_dissidio = datetime.strptime('01_08_2024', '%d_%m_%Y')

# Calcular a diferença em dias e meses
dias_hoje_para_dissidio = (dia_hoje - data_dissidio).days
meses_para_dissidio = dias_hoje_para_dissidio / 30

def precificacao_equipe(request):
    return render(request, 'precificacao-equipe.html')

def calculo_precificacao(request):
    lucro_desejado = float(request.POST.get('id_lucro_desejado', '0'))
    ipca = float(request.POST.get('id_ipca', '0'))
    indice_reajuste = (ipca * meses_para_dissidio) / 12 + 1

    cargos_data = json.loads(request.POST.get('cargos_data', '{}'))

    salario_base = []
    salario_dissidio = []
    decimo_terceiro_salario = []
    ferias = []
    fgts = []
    horas_extras = []
    gratificacao = []
    ass_medica = []
    ass_odont = []
    seguro_vida = []
    val_refeicao = []
    vale_alimentacao = []
    val_transp = []
    gympass = []
    reembolso = []
    comissao = []
    auxilio_creche = []

    for cargo, dados in cargos_data.items():
        salario_base_val = float(dados.get('salario_base', '0'))
        decimo_terceiro_salario_val = salario_base_val / 12
        ferias_val = decimo_terceiro_salario_val * 0.33333
        salario_dissidio_val = salario_base_val * indice_reajuste
        fgts_val = (salario_dissidio_val + decimo_terceiro_salario_val + ferias_val) * 0.08

        salario_base.append(salario_base_val)
        salario_dissidio.append(salario_dissidio_val)
        decimo_terceiro_salario.append(decimo_terceiro_salario_val)
        ferias.append(ferias_val)
        fgts.append(fgts_val)
        horas_extras.append(float(dados.get('horas_extras', '0')))
        gratificacao.append(float(dados.get('gratificacao', '0')))
        ass_medica.append(float(dados.get('ass_medica', '0')))
        ass_odont.append(float(dados.get('ass_odont', '0')))
        seguro_vida.append(float(dados.get('seguro_vida', '0')))
        val_refeicao.append(float(dados.get('val_refeicao', '0')))
        vale_alimentacao.append(float(dados.get('vale_alimentacao', '0')))
        val_transp.append(float(dados.get('val_transp', '0')))
        gympass.append(float(dados.get('gympass', '0')))
        reembolso.append(float(dados.get('reembolso', '0')))
        comissao.append(float(dados.get('comissao', '0')))
        auxilio_creche.append(float(dados.get('auxilio_creche', '0')))

    context = {
        'cargos_data': cargos_data,
        'dias_hoje_para_dissidio': dias_hoje_para_dissidio,
        'meses_para_dissidio': meses_para_dissidio,
        'lucro_desejado': lucro_desejado,
        'indice_reajuste': indice_reajuste,
        'salario_base': sum(salario_base),
        'salario_dissidio': sum(salario_dissidio),
        'decimo_terceiro_salario': sum(decimo_terceiro_salario),
        'ferias': sum(ferias),
        'horas_extras': sum(horas_extras),
        'gratificacao': sum(gratificacao),
        'fgts': sum(fgts),
        'ass_medica': sum(ass_medica),
        'ass_odont': sum(ass_odont),
        'seguro_vida': sum(seguro_vida),
        'val_refeicao': sum(val_refeicao),
        'vale_alimentacao': sum(vale_alimentacao),
        'val_transp': sum(val_transp),
        'gympass': sum(gympass),
        'reembolso': sum(reembolso),
        'comissao': sum(comissao),
        'auxilio_creche': sum(auxilio_creche),
        'total': sum(
            salario_base + salario_dissidio + decimo_terceiro_salario + ferias + fgts + horas_extras +
            gratificacao + ass_medica + ass_odont + seguro_vida + val_refeicao + vale_alimentacao +
            val_transp + gympass + reembolso + comissao + auxilio_creche
        ),
    }

    return render(request, 'precificacao-equipe.html', context)
