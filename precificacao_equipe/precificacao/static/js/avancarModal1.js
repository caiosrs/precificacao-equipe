// Função global para sanitizar IDs
function sanitizeId(id) {
    return id.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
}

// Variável global para armazenar os valores dos cargos
let dadosCargosSalvos = {};

$(document).ready(function () {
    $('#avancar-btn').on('click', function () {
        let modalBodyContent = '';

        function formatarValor(valor) {
            if (!valor) return 'Não especificado';

            let apenasNumeros = valor.replace(/[^\d,]/g, '');
            apenasNumeros = apenasNumeros.replace(',', '.');
            let numero = parseFloat(apenasNumeros);

            if (isNaN(numero)) return 'Não especificado';

            return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }    

        const dadosCargos = {
            'coordenador_junior': {
                'Salário Base': '4.391,39',
                'Horas Extras': '0,00',
                'Gratificação': '0,00',
                'Ass. Médica': '450,00',
                'Ass. Odont.': '21,96',
                'Seguro Vida': '7,27',
                'Val. Refeição': '574,20',
                'Vale Alimentação': '600,00',
                'Val. Transporte': '200,00',
                'Gympass': '14,73',
                'Reembolso': '0,00',
                'Comissão': '0,00',
                'Auxílio Creche': '0,00'
            },
            'coordenador_pleno': {
                'Salário Base': '5.018,73',
                'Horas Extras': '0,00',
                'Gratificação': '0,00',
                'Ass. Médica': '450,00',
                'Ass. Odont.': '21,96',
                'Seguro Vida': '7,27',
                'Val. Refeição': '574,20',
                'Vale Alimentação': '600,00',
                'Val. Transporte': '200,00',
                'Gympass': '14,73',
                'Reembolso': '0,00',
                'Comissão': '0,00',
                'Auxílio Creche': '0,00'
            },
            'assistente': {
                'Salário Base': '2.160,59',
                'Horas Extras': '0,00',
                'Gratificação': '0,00',
                'Ass. Médica': '450,00',
                'Ass. Odont.': '21,96',
                'Seguro Vida': '7,27',
                'Val. Refeição': '574,20',
                'Vale Alimentação': '0,00',
                'Val. Transporte': '200,00',
                'Gympass': '14,73',
                'Reembolso': '0,00',
                'Comissão': '0,00',
                'Auxílio Creche': '0,00'
            },
            'analista_junior': {
                'Salário Base': '2.625,62',
                'Horas Extras': '0,00',
                'Gratificação': '0,00',
                'Ass. Médica': '450,00',
                'Ass. Odont.': '21,96',
                'Seguro Vida': '7,27',
                'Val. Refeição': '574,20',
                'Vale Alimentação': '0,00',
                'Val. Transporte': '200,00',
                'Gympass': '14,73',
                'Reembolso': '0,00',
                'Comissão': '0,00',
                'Auxílio Creche': '0,00'
            },
            'analista_pleno': {
                'Salário Base': '3.034,26',
                'Horas Extras': '0,00',
                'Gratificação': '0,00',
                'Ass. Médica': '450,00',
                'Ass. Odont.': '21,96',
                'Seguro Vida': '7,27',
                'Val. Refeição': '574,20',
                'Vale Alimentação': '0,00',
                'Val. Transporte': '200,00',
                'Gympass': '14,73',
                'Reembolso': '0,00',
                'Comissão': '0,00',
                'Auxílio Creche': '0,00'
            },
            'analista_senior': {
                'Salário Base': '3.513,11',
                'Horas Extras': '0,00',
                'Gratificação': '0,00',
                'Ass. Médica': '450,00',
                'Ass. Odont.': '21,96',
                'Seguro Vida': '7,27',
                'Val. Refeição': '574,20',
                'Vale Alimentação': '0,00',
                'Val. Transporte': '200,00',
                'Gympass': '14,73',
                'Reembolso': '0,00',
                'Comissão': '0,00',
                'Auxílio Creche': '0,00'
            },
            'auxiliar': {
                'Salário Base': '1.900,00',
                'Horas Extras': '0,00',
                'Gratificação': '0,00',
                'Ass. Médica': '450,00',
                'Ass. Odont.': '21,96',
                'Seguro Vida': '7,27',
                'Val. Refeição': '574,20',
                'Vale Alimentação': '0,00',
                'Val. Transporte': '200,00',
                'Gympass': '14,73',
                'Reembolso': '0,00',
                'Comissão': '0,00',
                'Auxílio Creche': '0,00'
            },
            'coordenador_senior': {
                'Salário Base': '5.646,07',
                'Horas Extras': '0,00',
                'Gratificação': '0,00',
                'Ass. Médica': '450,00',
                'Ass. Odont.': '21,96',
                'Seguro Vida': '7,27',
                'Val. Refeição': '574,20',
                'Vale Alimentação': '600,00',
                'Val. Transporte': '200,00',
                'Gympass': '14,73',
                'Reembolso': '0,00',
                'Comissão': '0,00',
                'Auxílio Creche': '0,00'
            }
        };

        function gerarConteudoCargos(tipo) {
            let campos = $(`input[data-tipo="${tipo}"]`);
            if (campos.length > 0) {
                let conteudo = '';
        
                campos.each(function () {
                    let quantidade = $(this).attr('name').split('_').pop();
                    let valor = $(this).val();

                    // Salva os valores em uma variável global (dadosCargosSalvos)
                    if (!dadosCargosSalvos[tipo]) {
                        dadosCargosSalvos[tipo] = {};
                    }

                    dadosCargosSalvos[tipo][quantidade] = {};

                    conteudo += `<h5 style="text-align:center;">${tipo.replace('_', ' ').toUpperCase()} ${quantidade} - ${valor} %</h5>`;

                    if (dadosCargos[tipo]) {
                        conteudo += `<table class="table table-bordered"><tbody>`;
                        
                        for (const [campo, valorOriginal] of Object.entries(dadosCargos[tipo])) {
                            const valorFormatado = formatarValor(valorOriginal);
                        
                            let campoId = sanitizeId(`${campo}_${tipo}_${quantidade}`);
                            console.log(`Gerando ID: ${campoId}`);

                            conteudo += `
                                <tr>
                                    <td><h6 for="${campoId}">${campo}</h6></td>
                                    <td>
                                        <div class="input-group">
                                            <span class="input-group-text">R$</span>
                                            <input type="text" id="${campoId}" class="form-control" value="${valorFormatado}">
                                        </div>
                                    </td>
                                </tr>`;
                        
                            // Armazena os valores formatados em dadosCargosSalvos
                            dadosCargosSalvos[tipo][quantidade][campo] = valorFormatado;
                        }
                        
                        conteudo += `</tbody></table>`;
                    } else {
                        conteudo += `<p>Detalhes não disponíveis para este tipo de cargo.</p>`;
                    }
                });
        
                return conteudo;
            }
            return '';
        }

        // Itera sobre os tipos de cargos para gerar o conteúdo
        let tiposDeCargos = [
            'coordenador_junior',
            'coordenador_pleno',
            'coordenador_senior',
            'analista_junior',
            'analista_pleno',
            'analista_senior',
            'assistente',
            'auxiliar'
        ];

        tiposDeCargos.forEach(tipo => {
            let conteudoTipo = gerarConteudoCargos(tipo);
            if (conteudoTipo) {
                modalBodyContent += conteudoTipo;
            }
        });

        if (modalBodyContent === '') {
            modalBodyContent = '<p>Não há cargos adicionados.</p>';
            $('#calcular-btn').prop('disabled', true);
        } else {
            $('#calcular-btn').prop('disabled', false);
        }

        // Atualiza o conteúdo da modal
        $('#modal-body-content').html(modalBodyContent);
        console.log('Valores antes do clique no botão Calcular:', dadosCargosSalvos);
        // Abre a modal
        $('#avancarModal').modal('show');
    });
});

$(document).ready(function () {
    $('#calcular-btn').on('click', function () {
        // Oculta a modal atual (avancarModal)
        $('#avancarModal').modal('hide');

        // Pega a data atual
        let hoje = new Date();
        let dia = hoje.getDate().toString().padStart(2, '0');
        let mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
        let ano = hoje.getFullYear();
        let dataHojeFormatada = `${dia}/${mes}/${ano}`;

        // Define a data de dissídio
        let dissidioDia = 1;
        let dissidioMes = 8; // Agosto
        let dtDissidio = new Date(ano, dissidioMes - 1, dissidioDia);

        // Verifica se a data atual passou da data de dissídio
        if (hoje >= dtDissidio) {
            dtDissidio.setFullYear(ano + 1);
        } else {
            dtDissidio.setFullYear(ano);
        }

        // Formata a data de dissídio
        let diaDissidio = dtDissidio.getDate().toString().padStart(2, '0');
        let mesDissidio = (dtDissidio.getMonth() + 1).toString().padStart(2, '0');
        let anoDissidio = dtDissidio.getFullYear();
        let dataDissidioFormatada = `${diaDissidio}/${mesDissidio}/${anoDissidio}`;

        // Captura os valores dos campos, com fallback para 0
        let ipca = parseFloat($('#id_ipca').val().replace(',', '.')) || 0;

        // Cálculo dos dias e meses
        let dias = Math.ceil((dtDissidio - hoje) / (1000 * 60 * 60 * 24));
        let meses = dias / 30;

        // Cálculo do índice de reajuste
        let indiceReajuste = ((ipca * meses) / 12) / 100 + 1;

        // Formata os números para o padrão brasileiro
        function formatarNumero(numero) {
            return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        //console.log('Valores antes do recalculo:', dadosCargosSalvos);

        function recalcularValoresCargos() {
            for (let tipo in dadosCargosSalvos) {
                for (let quantidade in dadosCargosSalvos[tipo]) {
                    let dados = dadosCargosSalvos[tipo][quantidade];
                    for (let campo in dados) {
                        let valorOriginal = parseFloat(dados[campo].replace('.', '').replace(',', '.'));
                        let valorReajustado = valorOriginal * indiceReajuste;
        
                        // Atualiza o valor formatado com o reajuste
                        dadosCargosSalvos[tipo][quantidade][campo] = formatarNumero(valorReajustado);
        
                        // Atualiza o campo na interface
                        let inputId = `#${sanitizeId(campo)}_${tipo}_${quantidade}`;
                        console.log(`Atualizando valor para ID: ${inputId}`);
                        let $input = $(inputId);
                        if ($input.length > 0) {
                            $input.val(formatarNumero(valorReajustado));
                        } else {
                            console.warn(`Elemento não encontrado: ${inputId}`);
                        }
                    }
                }
            }
            console.log('Valores após recalculo:', dadosCargosSalvos);
        }

        // Atualiza o conteúdo da modal Resultados
        let conteudoCargosSalvos = '<div><h5>Detalhes dos Cargos Salvos:</h5>';
        
        for (const [tipo, valores] of Object.entries(dadosCargosSalvos)) {
            conteudoCargosSalvos += `<h6>${tipo.replace('_', ' ').toUpperCase()}</h6>`;
            for (const [quantidade, campos] of Object.entries(valores)) {
                conteudoCargosSalvos += `<div><h6>${tipo.replace('_', ' ').toUpperCase()} ${quantidade}</h6>`;
                conteudoCargosSalvos += `<table class="table table-bordered"><tbody>`;
                for (const [campo, valor] of Object.entries(campos)) {
                    conteudoCargosSalvos += `
                        <tr>
                            <td>${campo}</td>
                            <td>${valor}</td>
                        </tr>`;
                }
                conteudoCargosSalvos += `</tbody></table></div>`;
            }
        }

        conteudoCargosSalvos += '</div>';

        $('#resultados-modal-body-content').html(`           
            ${conteudoCargosSalvos}
        `);

        $('#resultadosModal').modal('show');
    });
});