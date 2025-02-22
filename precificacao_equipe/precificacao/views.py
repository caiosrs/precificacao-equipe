from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from datetime import datetime
import json
from django.views.decorators.csrf import csrf_exempt
import locale
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import io
import pandas as pd

# Define o local como Brasil para formatação monetária
locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')

def calcular_indice_reajuste(ipca):
    dtHoje = datetime.today()
    dtDissidio = datetime(dtHoje.year + 1, 8, 1) if (dtHoje.month > 8 or (dtHoje.month == 8 and dtHoje.day >= 1)) else datetime(dtHoje.year, 8, 1)
    dias_ate_dissidio = (dtDissidio - dtHoje).days
    meses_ate_dissidio = dias_ate_dissidio / 30.44  # Média de dias por mês
    indice_reajuste = (1 + (ipca * meses_ate_dissidio / 12))

    print(f"Índice de reajuste calculado: {indice_reajuste}")
    return indice_reajuste

def processar_dados_entrada(dados_cargos_salvos):
    try:
        qtd_funcionarios_str = str(dados_cargos_salvos.get("qtd_funcionario_cliente", '')).strip()
        lucro_desejado_str = str(dados_cargos_salvos.get("lucro_desejado", '')).strip()
        ipca_str = str(dados_cargos_salvos.get("ipca", '')).strip()

        print(f"Qtd funcionários (str): {qtd_funcionarios_str}, Lucro desejado (str): {lucro_desejado_str}, IPCA (str): {ipca_str}")

        qtd_funcionarios = int(qtd_funcionarios_str.replace('.', '').replace(',', '')) if qtd_funcionarios_str else 0
        
        lucro_desejado = float(lucro_desejado_str.replace('.', '').replace(',', '.')) if lucro_desejado_str else 0
        ipca = float(ipca_str.replace('.', '').replace(',', '.')) / 100 if ipca_str else 0

        return qtd_funcionarios, lucro_desejado, ipca
    except ValueError as e:
        raise ValueError(f"Erro ao processar os dados de entrada: {e}")

def formatar_monetario(valor):
    try:
        return locale.currency(valor, grouping=True)
    except Exception as e:
        print(f"Erro ao formatar valor monetário: {e}")
        return valor
    
def salvar_pdf(request):
    if request.method == 'POST':
        try:
            dados_cliente_proposta = json.loads(request.body.decode('utf-8'))
            print('Dados recebidos no backend pdf:', dados_cliente_proposta)
            nome_cliente = dados_cliente_proposta.get('nome_cliente')
            numero_proposta = dados_cliente_proposta.get('numero_proposta')

            # Criar o PDF
            buffer = io.BytesIO()
            p = canvas.Canvas(buffer)

            p.drawString(100, 800, f"Nome do Cliente: {nome_cliente}")
            p.drawString(100, 750, f"Numero da Proposta: {numero_proposta}")
            p.drawString(100, 700, "Este é um exemplo de PDF.")
            p.showPage()
            p.save()

            # Enviar PDF como resposta
            pdf = buffer.getvalue()
            buffer.close()
            
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="arquivo.pdf"'
            return response
        except json.JSONDecodeError:
            print("Erro ao decodificar JSON.")
            return JsonResponse({'status': 'error', 'message': 'Erro ao decodificar JSON na função Salvar PDF'}, status=400)
        except ValueError as e:
            print(f"Erro de valor: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
        except Exception as e:
            print(f"Erro ao calcular precificação: {e}")
            return JsonResponse({'status': 'error', 'message': 'Erro interno do servidor'}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': 'Método não permitido'}, status=405)

@csrf_exempt
def calculo_precificacao(request):
    if request.method == 'POST':
        try:
            dados_cargos_salvos = json.loads(request.body.decode('utf-8'))
            print('Dados recebidos no backend:', dados_cargos_salvos)

            if not isinstance(dados_cargos_salvos, dict):
                raise ValueError("Dados recebidos não são um dicionário.")

            qtd_funcionarios, lucro_desejado, ipca = processar_dados_entrada(dados_cargos_salvos)
            indice_reajuste = calcular_indice_reajuste(ipca)

            resultados = []

            for cargo, dados in dados_cargos_salvos.items():
                if isinstance(dados, dict):
                    for chave, item in dados.items():
                        print(f'Processando item: {item}')  # Adicione este log

                        salario_base_str = item.get('Salário Base', '0,00').strip().replace('.', '').replace(',', '.')

                        try:
                            salario_base = float(salario_base_str)
                        except ValueError:
                            salario_base = 0.0

                        salario_dissidio = salario_base * indice_reajuste
                        decimo_terceiro = salario_dissidio / 12
                        ferias = decimo_terceiro * 0.33333

                        def parse_valor(valor_str):
                            return float(valor_str.strip().replace('.', '').replace(',', '.')) if valor_str else 0

                        horas_extras = parse_valor(item.get('Horas Extras', '0,00'))
                        gratificacao = parse_valor(item.get('Gratificação', '0,00'))

                        fgts = (salario_dissidio + decimo_terceiro + ferias) * 0.08

                        ass_medica = parse_valor(item.get('Ass. Médica', '0,00'))
                        ass_odonto = parse_valor(item.get('Ass. Odont.', '0,00'))
                        seguro = parse_valor(item.get('Seguro Vida', '0,00'))
                        vr = parse_valor(item.get('Val. Refeição', '0,00'))
                        va = parse_valor(item.get('Vale Alimentação', '0,00'))
                        vt = parse_valor(item.get('Val. Transporte', '0,00'))
                        gympass = parse_valor(item.get('Gympass', '0,00'))
                        reembolso = parse_valor(item.get('Reembolso', '0,00'))
                        comissao = parse_valor(item.get('Comissão', '0,00'))
                        aux_creche = parse_valor(item.get('Auxílio Creche', '0,00'))

                        # Extrai o valor do cargo do dicionário
                        valor = parse_valor(item.get('valor', '0,00'))

                        # Calcula o total incluindo o valor do cargo
                        total = salario_dissidio + decimo_terceiro + ferias + horas_extras + gratificacao + fgts + ass_medica + ass_odonto + seguro + vr + va + vt + gympass + reembolso + comissao + aux_creche + valor

                        # Adiciona o valor nos resultados
                        resultados.append({
                            'cargo': cargo,
                            'valor': valor,
                            'salario_base': formatar_monetario(salario_base),
                            'salario_dissidio': formatar_monetario(salario_dissidio),
                            'decimo_terceiro': formatar_monetario(decimo_terceiro),
                            'ferias': formatar_monetario(ferias),
                            'horas_extras': formatar_monetario(horas_extras),
                            'gratificacao': formatar_monetario(gratificacao),
                            'fgts': formatar_monetario(fgts),
                            'ass_medica': formatar_monetario(ass_medica),
                            'ass_odonto': formatar_monetario(ass_odonto),
                            'seguro': formatar_monetario(seguro),
                            'vr': formatar_monetario(vr),
                            'va': formatar_monetario(va),
                            'vt': formatar_monetario(vt),
                            'gympass': formatar_monetario(gympass),
                            'reembolso': formatar_monetario(reembolso),
                            'comissao': formatar_monetario(comissao),
                            'aux_creche': formatar_monetario(aux_creche),
                            'total': formatar_monetario(total)
                        })

            context = {
                'qtd_funcionarios': qtd_funcionarios,
                'lucro_desejado': formatar_monetario(lucro_desejado),
                'ipca': ipca,
                'indice_reajuste': indice_reajuste,
                'resultados': resultados
            }

            print(f"Resultados finais: {resultados}")

            return JsonResponse({'status': 'success', 'resultados': resultados})

        except json.JSONDecodeError:
            print("Erro ao decodificar JSON.")
            return JsonResponse({'status': 'error', 'message': 'Erro ao decodificar JSON na Funcao Calculo_precificacao'}, status=400)
        except ValueError as e:
            print(f"Erro de valor: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
        except Exception as e:
            print(f"Erro ao calcular precificação: {e}")
            return JsonResponse({'status': 'error', 'message': 'Erro interno do servidor'}, status=500)

    return render(request, 'precificacao-equipe.html', {})

