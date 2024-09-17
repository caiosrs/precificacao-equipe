import pandas as pd
from datetime import datetime

ExcelPrecificacao = r'\\10.1.1.2\ti\BaseCalculos\PrecificacaoEquipe.xlsx'

# Função para converter número com vírgula para float
def converter_para_float(valor):
    try:
        valor = valor.replace('.', '').replace(',', '.')
        return float(valor)
    except (AttributeError, ValueError):
        return 0.0

def tratar_input(valor_input, valor_padrao_planilha):
    if valor_input.strip() == "":
        return valor_padrao_planilha
    else:
        try:
            return converter_para_float(valor_input)
        except ValueError:
            return valor_padrao_planilha

# Função para ler a planilha e obter os dados dos cargos
def ler_planilha(ExcelPrecificacao, sheet_name):
    df = pd.read_excel(ExcelPrecificacao, sheet_name=sheet_name)
    return df

# Função para calcular a diferença de dias e reajuste do salário
def calcular_reajuste(ipca, salario_base, horas_extras, gratificacao, reembolso, comissao, aux_creche,
                      ass_medica, ass_odont, seguro_vida, vr, va, vt, gympass, dt_dissidio):
    dt_hoje = datetime.today()

    if dt_hoje >= dt_dissidio:
        dt_dissidio = datetime(dt_hoje.year + 1, 8, 1)

    dias = (dt_dissidio - dt_hoje).days
    meses = dias / 30
    indice_reajuste = ((ipca * meses) / 12) + 1
    salario_com_dissidio = salario_base * indice_reajuste
    decimo_terceiro = salario_com_dissidio / 12
    ferias = (salario_com_dissidio / 12) * 0.33333
    fgts = (salario_com_dissidio + decimo_terceiro + ferias) * 0.08
    total_adicionais = horas_extras + gratificacao + reembolso + comissao + aux_creche
    total_beneficios = ass_medica + ass_odont + seguro_vida + vr + va + vt + gympass
    total_com_adicionais_e_beneficios = salario_com_dissidio + total_adicionais + total_beneficios
    total = salario_com_dissidio + decimo_terceiro + ferias + fgts + total_adicionais + total_com_adicionais_e_beneficios

    return salario_com_dissidio, indice_reajuste, dias, decimo_terceiro, ferias, fgts, total_adicionais, total_com_adicionais_e_beneficios, total_beneficios, total

# Função para formatar os valores com separador decimal como vírgula e milhar como ponto
def formatar_valor(valor):
    return f"{valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

# Ler a planilha
df_cargos = ler_planilha(ExcelPrecificacao, 'Equipe')

# Fase 1: Solicitar quais cargos e quantos de cada um
print("Cargos disponíveis:")
cargos_disponiveis = df_cargos['Cargo'].dropna().unique()
for i, cargo in enumerate(cargos_disponiveis, start=1):
    print(f"{i}. {cargo}")

cargos = {}
for cargo in cargos_disponiveis:
    quantidade = int(input(f"Quantos funcionários para o cargo '{cargo}'? "))
    cargos[cargo] = quantidade

# Fase 2: Solicitar o IPCA
ipca = input("Digite o IPCA (%): ")
try:
    ipca_float = converter_para_float(ipca) / 100  # Converte para percentual
except ValueError:
    print("Valor de IPCA inválido.")
    ipca_float = 0

# Processar cada cargo e seus dados
for cargo, quantidade in cargos.items():
    if quantidade > 0:
        for i in range(1, quantidade + 1):
            cargo_atual = f"{cargo}{i}"
            print(f"\nDados para o cargo '{cargo_atual}':")
            
            salario_base = input(f"Salário Base para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            horas_extras = input(f"Horas Extras para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            gratificacao = input(f"Gratificação para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            reembolso = input(f"Reembolso para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            comissao = input(f"Comissão para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            aux_creche = input(f"Auxílio Creche para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            assistencia_medica = input(f"Assistência Médica para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            assistencia_odontologica = input(f"Assistência Odontológica para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            seguro_vida = input(f"Seguro de Vida para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            vale_refeicao = input(f"Vale Refeição para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            vale_alimentacao = input(f"Vale Alimentação para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            vale_transporte = input(f"Vale Transporte para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            gympass = input(f"Gympass para o cargo '{cargo_atual}' (deixe em branco para usar valor da planilha): ")
            
            # Ler os valores padrão da planilha
            valores_padrao = df_cargos[df_cargos['Cargo'] == cargo].iloc[0]

            # Verificar se o valor é NaN e atribuir o padrão adequado
            salario_base_padrao = valores_padrao['Salário Base'] if 'Salário Base' in valores_padrao and not pd.isna(valores_padrao['Salário Base']) else 0
            horas_extras_padrao = valores_padrao['Horas Extras'] if 'Horas Extras' in valores_padrao and not pd.isna(valores_padrao['Horas Extras']) else 0
            gratificacao_padrao = valores_padrao['Gratificação'] if 'Gratificação' in valores_padrao and not pd.isna(valores_padrao['Gratificação']) else 0
            reembolso_padrao = valores_padrao['Reembolso'] if 'Reembolso' in valores_padrao and not pd.isna(valores_padrao['Reembolso']) else 0
            comissao_padrao = valores_padrao['Comissão'] if 'Comissão' in valores_padrao and not pd.isna(valores_padrao['Comissão']) else 0
            aux_creche_padrao = valores_padrao['Auxílio Creche'] if 'Auxílio Creche' in valores_padrao and not pd.isna(valores_padrao['Auxílio Creche']) else 0
            assistencia_medica_padrao = valores_padrao['Assistência Médica'] if 'Assistência Médica' in valores_padrao and not pd.isna(valores_padrao['Assistência Médica']) else 0
            assistencia_odontologica_padrao = valores_padrao['Assistência Odontológica'] if 'Assistência Odontológica' in valores_padrao and not pd.isna(valores_padrao['Assistência Odontológica']) else 0
            seguro_vida_padrao = valores_padrao['Seguro de Vida'] if 'Seguro de Vida' in valores_padrao and not pd.isna(valores_padrao['Seguro de Vida']) else 0
            vale_refeicao_padrao = valores_padrao['Vale Refeição'] if 'Vale Refeição' in valores_padrao and not pd.isna(valores_padrao['Vale Refeição']) else 0
            vale_alimentacao_padrao = valores_padrao['Vale Alimentação'] if 'Vale Alimentação' in valores_padrao and not pd.isna(valores_padrao['Vale Alimentação']) else 0
            vale_transporte_padrao = valores_padrao['Vale Transporte'] if 'Vale Transporte' in valores_padrao and not pd.isna(valores_padrao['Vale Transporte']) else 0
            gympass_padrao = valores_padrao['Gympass'] if 'Gympass' in valores_padrao and not pd.isna(valores_padrao['Gympass']) else 0


            salario_base_tratado = tratar_input(salario_base, salario_base_padrao)
            horas_extras_tratado = tratar_input(horas_extras, horas_extras_padrao)
            gratificacao_tratado = tratar_input(gratificacao, gratificacao_padrao)
            reembolso_tratado = tratar_input(reembolso, reembolso_padrao)
            comissao_tratado = tratar_input(comissao, comissao_padrao)
            aux_creche_tratado = tratar_input(aux_creche, aux_creche_padrao)
            assistencia_medica_tratado = tratar_input(assistencia_medica, assistencia_medica_padrao)
            assistencia_odontologica_tratado = tratar_input(assistencia_odontologica, assistencia_odontologica_padrao)
            seguro_vida_tratado = tratar_input(seguro_vida, seguro_vida_padrao)
            vale_refeicao_tratado = tratar_input(vale_refeicao, vale_refeicao_padrao)
            vale_alimentacao_tratado = tratar_input(vale_alimentacao, vale_alimentacao_padrao)
            vale_transporte_tratado = tratar_input(vale_transporte, vale_transporte_padrao)
            gympass_tratado = tratar_input(gympass, gympass_padrao)

            dt_dissidio = datetime(datetime.today().year + 1, 8, 1)

            salario_com_dissidio, indice_reajuste, dias, decimo_terceiro, ferias, fgts, total_adicionais, total_com_adicionais_e_beneficios, total_beneficios, total = calcular_reajuste(
                ipca_float, salario_base_tratado, horas_extras_tratado, gratificacao_tratado, reembolso_tratado, comissao_tratado,
                aux_creche_tratado, assistencia_medica_tratado, assistencia_odontologica_tratado, seguro_vida_tratado,
                vale_refeicao_tratado, vale_alimentacao_tratado, vale_transporte_tratado, gympass_tratado, dt_dissidio
            )

            print(f"\nRelatório do cargo '{cargo_atual}':")
            print(f"Salário com Dissídio: {formatar_valor(salario_com_dissidio)}")
            print(f"Índice de Reajuste: {formatar_valor(indice_reajuste * 100)}%")
            print(f"Dias até o Dissídio: {dias}")
            print(f"Décimo Terceiro: {formatar_valor(decimo_terceiro)}")
            print(f"Férias: {formatar_valor(ferias)}")
            print(f"FGTS: {formatar_valor(fgts)}")
            print(f"Total Adicionais: {formatar_valor(total_adicionais)}")
            print(f"Total com Adicionais e Benefícios: {formatar_valor(total_com_adicionais_e_beneficios)}")
            print(f"Total Benefícios: {formatar_valor(total_beneficios)}")
            print(f"Total: {formatar_valor(total)}")
