$(document).ready(function() {
    $('#calcular-btn').on('click', function () {
        $('#avancarModal').modal('hide');
        $('#resultadosModal').modal('show');

        // Função para calcular valores com base em cargosValues
        function calcularValores(cargosValues) {
            const resultados = [];

            console.log('Iniciando cálculo de valores com cargosValues:', cargosValues);

            // Organize os valores por cargo
            cargosValues.forEach(item => {
                const cargo = item.cargo;
                const campo = item.campo;
                const valor = parseFloat(item.valor.replace('.', '').replace(',', '.')) || 0;

                console.log(`Processando cargo: ${cargo}, campo: ${campo}, valor: ${valor}`);

                let resultado = resultados.find(r => r.cargo === cargo);

                if (!resultado) {
                    resultado = { cargo };
                    resultados.push(resultado);
                }

                resultado[campo] = valor;
                console.log(`Resultado atualizado para cargo ${cargo}:`, resultado);
            });

            // Retornar resultados sem adicionar valores padrão
            const resultadosFormatados = resultados.map(resultado => {
                console.log('Resultado antes de formatação:', resultado);
                return {
                    cargo: resultado.cargo,
                    salarioBase: resultado['Salário Base'] || 0,
                    salarioComDissidioProporcional: resultado['Salário com Dissídio Proporcional'] || 0,
                    decimoTerceiroSalario: resultado['13. Salário'] || 0,
                    ferias: resultado['Férias'] || 0,
                    horasExtras: resultado['Horas Extras'] || 0,
                    gratificacao: resultado['Gratificação'] || 0,
                    fgts: resultado['FGTS'] || 0,
                    assistenciaMedica: resultado['Ass. Médica'] || 0,
                    assistenciaOdontologica: resultado['Ass. Odont.'] || 0,
                    seguroVida: resultado['Seguro Vida'] || 0,
                    valeRefeicao: resultado['Val. Refeição'] || 0,
                    valeAlimentacao: resultado['Vale Alimentação'] || 0,
                    valeTransporte: resultado['Vale Transporte'] || 0,
                    gympass: resultado['Gympass'] || 0,
                    reembolso: resultado['Reembolso'] || 0,
                    comissao: resultado['Comissão'] || 0,
                    auxilioCreche: resultado['Auxílio Creche'] || 0
                };
            });

            console.log('Resultados formatados:', resultadosFormatados);
            return resultadosFormatados;
        }

        // Função para gerar a tabela com os resultados
        function gerarTabela() {
            const valoresCalculados = calcularValores(cargosValues);
            let tabelaHtml = '';

            console.log('Valores calculados:', valoresCalculados);

            valoresCalculados.forEach(calculo => {
                tabelaHtml += `
                    <tr>
                        <td>${calculo.cargo.replace(/_/g, ' ')}</td>
                        <td>
                            Salário Base: ${calculo.salarioBase.toFixed(2).replace('.', ',')}<br>
                            Salário com Dissídio Proporcional: ${calculo.salarioComDissidioProporcional.toFixed(2).replace('.', ',')}<br>
                            13º Salário: ${calculo.decimoTerceiroSalario.toFixed(2).replace('.', ',')}<br>
                            Férias: ${calculo.ferias.toFixed(2).replace('.', ',')}<br>
                            Horas Extras: ${calculo.horasExtras.toFixed(2).replace('.', ',')}<br>
                            Gratificação: ${calculo.gratificacao.toFixed(2).replace('.', ',')}<br>
                            FGTS: ${calculo.fgts.toFixed(2).replace('.', ',')}<br>
                            Assistência Médica: ${calculo.assistenciaMedica.toFixed(2).replace('.', ',')}<br>
                            Assistência Odontológica: ${calculo.assistenciaOdontologica.toFixed(2).replace('.', ',')}<br>
                            Seguro Vida: ${calculo.seguroVida.toFixed(2).replace('.', ',')}<br>
                            Vale Refeição: ${calculo.valeRefeicao.toFixed(2).replace('.', ',')}<br>
                            Vale Alimentação: ${calculo.valeAlimentacao.toFixed(2).replace('.', ',')}<br>
                            Vale Transporte: ${calculo.valeTransporte.toFixed(2).replace('.', ',')}<br>
                            Gympass: ${calculo.gympass.toFixed(2).replace('.', ',')}<br>
                            Reembolso: ${calculo.reembolso.toFixed(2).replace('.', ',')}<br>
                            Comissão: ${calculo.comissao.toFixed(2).replace('.', ',')}<br>
                            Auxílio Creche: ${calculo.auxilioCreche.toFixed(2).replace('.', ',')}
                        </td>
                    </tr>
                `;
            });

            $('#cargoTabela').html(tabelaHtml);

            console.log('Tabela HTML gerada:', tabelaHtml);
        }
        gerarTabela();
    });
});
