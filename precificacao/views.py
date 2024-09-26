from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from datetime import datetime
import json
from django.views.decorators.csrf import csrf_exempt
import locale
from reportlab.lib.pagesizes import letter
from fpdf import FPDF
import pandas as pd

# Define o local como Brasil para formatação monetária
locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')

def calcular_indice_reajuste(ipca):
    dtHoje = datetime.today()
    dtDissidio = datetime(dtHoje.year + 1, 8, 1) if (dtHoje.month > 8 or (dtHoje.month == 8 and dtHoje.day >= 1)) else datetime(dtHoje.year, 8, 1)
    dias_ate_dissidio = (dtDissidio - dtHoje).days
    meses_ate_dissidio = dias_ate_dissidio / 30.44  # Média de dias por mês
    indice_reajuste = (1 + (ipca * meses_ate_dissidio / 12))

    #print(f"Índice de reajuste calculado: {indice_reajuste}")
    return indice_reajuste

def processar_dados_entrada(dados_cargos_salvos):
    try:
        qtd_funcionarios_str = dados_cargos_salvos.get("qtd_funcionario_cliente", '').strip()
        lucro_desejado_str = dados_cargos_salvos.get("lucro_desejado", '').strip()
        ipca_str = dados_cargos_salvos.get("ipca", '').strip()

        #print(f"Qtd funcionários (str): {qtd_funcionarios_str}, Lucro desejado (str): {lucro_desejado_str}, IPCA (str): {ipca_str}")

        qtd_funcionarios = int(qtd_funcionarios_str.replace('.', '').replace(',', '')) if qtd_funcionarios_str else 0
        lucro_desejado = float(lucro_desejado_str.replace(',', '.')) if lucro_desejado_str else 0
        ipca = float(ipca_str.replace(',', '.')) / 100 if ipca_str else 0

        return qtd_funcionarios, lucro_desejado, ipca
    except ValueError as e:
        print(f"Erro ao processar os dados: {e}")
        raise ValueError(f"Erro ao processar os dados de entrada: {e}")

def formatar_monetario(valor):
    try:
        return locale.currency(valor, grouping=True)
    except Exception as e:
        print(f"Erro ao formatar valor monetário: {e}")
        return valor
    
def formatar_cargo(cargo):
    # Substitui os underscores por espaços e divide o cargo em palavras
    palavras = cargo.replace('_', ' ').split()
    
    # Capitaliza a primeira letra de cada palavra
    palavras_formatadas = [palavra.capitalize() for palavra in palavras]
    
    # Junta as palavras de volta em uma string
    return ' '.join(palavras_formatadas)

@csrf_exempt
def salvar_pdf(request):
    if request.method == 'POST':
        try:
            dados_pdf = json.loads(request.body.decode('utf-8'))
            nome_cliente = dados_pdf.get('nome_cliente')
            numero_proposta = dados_pdf.get('numero_proposta')

            # Ler planilha de índices
            planilha_indices = pd.read_excel(r'\\10.1.1.2\ti\BaseCalculos\PrecificacaoEquipe.xlsx', sheet_name='Índice Informatec')

            resultados = request.session.get('resultados', [])
            if not resultados:
                return JsonResponse({'status': 'error', 'message': 'Nenhum resultado encontrado.'}, status=400)
            
            input_iniciais = request.session.get('input_iniciais', [])
            if not input_iniciais:
                return JsonResponse({'status': 'error', 'message': 'Nenhum input iniciais encontrado.'}, status=400)

            lucro_desejado = input_iniciais.get('lucro_desejado', 'N/A')
            qtd_funcionarios = input_iniciais.get('qtd_funcionarios', 'N/A')

            # Encontrar o índice Informatec correto
            for i in range(5, 10):  
                indice_informatec_celula = planilha_indices.iloc[i-1, 0]
                if pd.isna(indice_informatec_celula):
                    continue
                indice_informatec_celula = float(indice_informatec_celula) 
                if indice_informatec_celula == lucro_desejado:
                    indice_informatec = float(planilha_indices.iloc[i-1, 1])
                    break
            else:
                indice_informatec = 1.9935  # Valor padrão caso não encontre

            # Formatar lucro desejado
            if isinstance(lucro_desejado, (int, float)):
                lucro_desejado_formatado = f"{lucro_desejado:.2f}".rstrip('0').rstrip('.')
            else:
                lucro_desejado_formatado = lucro_desejado

            # Criar PDF
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", size=12)

            # Adicionar conteúdo ao PDF
            pdf.cell(200, 10, f'Proposta: {numero_proposta} | Cliente: {nome_cliente}', ln=True)
            pdf.cell(200, 10, f'Lucro Desejado: {lucro_desejado_formatado}%', ln=True)
            pdf.cell(200, 10, f'Índice Informatec: {indice_informatec:.4f}', ln=True)

            # Exibir custo de mão de obra direta da equipe
            custo_mo_equipe = 0  
            for cargo in resultados:
                total_str = cargo.get('total', '0,00').replace('R$ ', '').strip()
                total = float(total_str.replace('.', '').replace(',', '.'))

                porcento_input_sem_ajuste = cargo.get('valor', 'N/A')
                
                if isinstance(porcento_input_sem_ajuste, (float, int)):
                    porcento_input = str(int(porcento_input_sem_ajuste))
                    custo_mo = total * (porcento_input_sem_ajuste / 100)
                else:
                    porcento_input = str(porcento_input_sem_ajuste).rstrip('.0')
                    custo_mo = 0

                custo_mo_equipe += custo_mo

            pdf.cell(200, 10, f'Custo M.O Direta - Equipe: {formatar_monetario(custo_mo_equipe)}', ln=True)

            indice_despesa = float(planilha_indices.iloc[9, 1])
            pdf.cell(200, 10, f'índice Despesa: {indice_despesa:.4f}', ln=True)

            despesas = indice_despesa * custo_mo_equipe
            pdf.cell(200, 10, f'Despesas: {formatar_monetario(despesas)}', ln=True)

            faturamento_liquido = indice_informatec * custo_mo_equipe
            pdf.cell(200, 10, f'Faturamento Líquido: {formatar_monetario(faturamento_liquido)}', ln=True)

            lucro = faturamento_liquido - despesas - custo_mo_equipe
            pdf.cell(200, 10, f'Lucro: {formatar_monetario(lucro)}', ln=True)

            imposto = float(planilha_indices.iloc[10, 1]) / 100

            # Formatar o valor para exibição no PDF
            imposto_formatado = f'{imposto * 100:.2f}'.replace('.', ',')
            pdf.cell(200, 10, f'Imposto: {imposto_formatado}%', ln=True)

            valor_proposta = faturamento_liquido / (1 - imposto)
            pdf.cell(200, 10, f'Valor da Proposta: {formatar_monetario(valor_proposta)}', ln=True)

            valor_proposta_base_por_func = valor_proposta / qtd_funcionarios
            pdf.cell(200, 10, f'Valor da Proposta Base por Func.: {formatar_monetario(valor_proposta_base_por_func)}', ln=True)

            valor_proposta_10porcento = valor_proposta * 1.1
            pdf.cell(200, 10, f'Valor Proposta + 10% Negociação: {formatar_monetario(valor_proposta_10porcento)}', ln=True)

            valor_proposta_10porcento_por_func = valor_proposta_base_por_func * 1.1
            pdf.cell(200, 10, f'Valor Proposta + 10% Negociação por Func.: {formatar_monetario(valor_proposta_10porcento_por_func)}', ln=True)

            # Adicionar outra linha em branco para separar
            pdf.cell(200, 10, '', ln=True)

            pdf.cell(200, 10, f'Número de Funcionários: {qtd_funcionarios}', ln=True)
            pdf.cell(200, 10, 'Equipe e Percentuais:', ln=True)
            for cargo in resultados:
                porcento_input_sem_ajuste = cargo.get('valor', 'N/A')
                porcento_input = str(int(porcento_input_sem_ajuste)) if isinstance(porcento_input_sem_ajuste, (float, int)) else str(porcento_input_sem_ajuste).rstrip('.0')

                pdf.cell(200, 10, f'Cargo: {formatar_cargo(cargo["cargo"])} - {porcento_input}%', ln=True)

            # Gerar PDF
            response = HttpResponse(pdf.output(dest='S').encode('latin1'), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename=Precificacao_Equipe_Proposta_{numero_proposta}_{nome_cliente}.pdf'
            return response

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        
@csrf_exempt
def calculo_precificacao(request):
    if request.method == 'POST':
        try:
            dados_cargos_salvos = json.loads(request.body.decode('utf-8'))
            #print('Dados recebidos no backend:', dados_cargos_salvos)

            if not isinstance(dados_cargos_salvos, dict):
                raise ValueError("Dados recebidos não são um dicionário.")

            qtd_funcionarios, lucro_desejado, ipca = processar_dados_entrada(dados_cargos_salvos)
            indice_reajuste = calcular_indice_reajuste(ipca)

            resultados = []

            for cargo, dados in dados_cargos_salvos.items():
                if isinstance(dados, dict):
                    for chave, item in dados.items():

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

                        # Adiciona o número do cargo nos resultados
                        cargo_com_quantidade = f"{cargo} {chave}"

                        # Adiciona o valor nos resultados
                        resultados.append({
                            'cargo': cargo_com_quantidade,
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
                            'total': formatar_monetario(total),
                        })
                        inputs_iniciais = {
                            'qtd_funcionarios': qtd_funcionarios,
                            'lucro_desejado': lucro_desejado,
                            'indice_reajuste': indice_reajuste
                        }

            context = {
                'qtd_funcionarios': qtd_funcionarios,
                'lucro_desejado': formatar_monetario(lucro_desejado),
                'ipca': ipca,
                'indice_reajuste': indice_reajuste,
                'resultados': resultados
            }

            request.session['resultados'] = resultados
            request.session['input_iniciais'] = inputs_iniciais
            print(f"Inputs Iniciais: {inputs_iniciais}")
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