$(document).ready(function () {
    let dadosCargosSalvos = {};

    function sanitizeId(id) {
        return id.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    }

    function formatarValor(valor) {
        if (valor === undefined || valor === null) return 'Não especificado';
        
        // Se valor não for uma string, converta-o para string
        if (typeof valor !== 'string') {
            valor = valor.toString();
        }
        
        let apenasNumeros = valor.replace(/[^\d,]/g, '').replace(',', '.');
        let numero = parseFloat(apenasNumeros);
        return isNaN(numero) ? 'Não especificado' : numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    $('#avancar-btn').on('click', function () {
        let modalBodyContent = '';
        let qtdFuncionarioCliente = $('#qtd_funcionario_cliente').val();
        let lucroDesejado = $('#lucro_desejado').val();
        let ipca = $('#ipca').val();

        console.log('Quantidade de Funcionários:', qtdFuncionarioCliente);
        console.log('Lucro Desejado:', lucroDesejado);
        console.log('IPCA:', ipca);

        const dadosCargos = {
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

                    if (!dadosCargosSalvos[tipo]) {
                        dadosCargosSalvos[tipo] = {};
                    }
                    dadosCargosSalvos[tipo][quantidade] = {};

                    conteudo += `<h5 style="text-align:center;">${tipo.replace('_', ' ').toUpperCase()} ${quantidade} - ${valor} %</h5>`;
                    if (dadosCargos[tipo]) {
                        conteudo += `<table class="table table-bordered"><tbody>`;
                        for (const [campo, valorOriginal] of Object.entries(dadosCargos[tipo])) {
                            let valorFormatado = formatarValor(valorOriginal);
                            let campoId = sanitizeId(`${campo}_${tipo}_${quantidade}`);
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
                            dadosCargosSalvos[tipo][quantidade][campo] = valorFormatado;
                        }
                        conteudo += `</tbody></table>`;
                    }
                });
                return conteudo;
            }
            return '';
        }

        let tiposDeCargos = ['coordenador_junior', 'coordenador_pleno', 'coordenador_senior', 'analista_junior', 'analista_pleno', 'analista_senior', 'assistente', 'auxiliar'];
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

        $('#modal-body-content').html(modalBodyContent);
        $('#avancarModal').modal('show');
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        headers: { 'X-CSRFToken': csrftoken }
    });

    $('#calcular-btn').on('click', function () {
        let dadosParaEnviar = {
            qtd_funcionario_cliente: $('#qtd_funcionario_cliente').val(),
            lucro_desejado: $('#lucro_desejado').val(),
            ipca: $('#ipca').val()
        };

        let tiposDeCargos = ['coordenador_junior', 'coordenador_pleno', 'coordenador_senior', 'analista_junior', 'analista_pleno', 'analista_senior', 'assistente', 'auxiliar'];

        tiposDeCargos.forEach(function (tipo) {
            if (dadosCargosSalvos[tipo]) {
                dadosParaEnviar[tipo] = {};
                Object.keys(dadosCargosSalvos[tipo]).forEach(function (indice) {
                    dadosParaEnviar[tipo][indice] = {};
                    Object.keys(dadosCargosSalvos[tipo][indice]).forEach(function (campo) {
                        let valorCampo = $(`#${sanitizeId(campo + '_' + tipo + '_' + indice)}`).val();
                        dadosParaEnviar[tipo][indice][campo] = valorCampo;
                    });
                });
            }
        });

        console.log('Dados a serem enviados para o backend:', dadosParaEnviar);

        $.ajax({
            type: 'POST',
            url: '/precificacao-equipe/',
            data: JSON.stringify(dadosParaEnviar),
            contentType: 'application/json',
            success: function (response) {
                if (response.status === 'success') {
                    let resultados = response.resultados;
                    let tabelaHtml = '';
        
                    resultados.forEach(resultado => {
                        tabelaHtml += `
                            <div class="table-responsive">
                                <h4 class="text-center"><strong>${resultado.cargo}</strong></h4>
                                <table class="table table-bordered">
                                    <tbody>
                                        <!-- Primeira Linha -->
                                        <tr>
                                            <th>Salário Dissídio</th>
                                            <td>R$ ${formatarValor(resultado.salario_dissidio)}</td>
                                            <th>13º Salário</th>
                                            <td>R$ ${formatarValor(resultado.decimo_terceiro)}</td>
                                        </tr>
                                        <!-- Segunda Linha -->
                                        <tr>
                                            <th>Férias</th>
                                            <td>R$ ${formatarValor(resultado.ferias)}</td>
                                            <th>Horas Extras</th>
                                            <td>R$ ${formatarValor(resultado.horas_extras)}</td>
                                        </tr>
                                        <!-- Terceira Linha -->
                                        <tr>
                                            <th>Gratificação</th>
                                            <td>R$ ${formatarValor(resultado.gratificacao)}</td>
                                            <th>FGTS</th>
                                            <td>R$ ${formatarValor(resultado.fgts)}</td>
                                        </tr>
                                        <!-- Quarta Linha -->
                                        <tr>
                                            <th>Assistência Médica</th>
                                            <td>R$ ${formatarValor(resultado.ass_medica)}</td>
                                            <th>Assistência Odontológica</th>
                                            <td>R$ ${formatarValor(resultado.ass_odonto)}</td>
                                        </tr>
                                        <!-- Quinta Linha -->
                                        <tr>
                                            <th>Seguro Vida</th>
                                            <td>R$ ${formatarValor(resultado.seguro)}</td>
                                            <th>Vale Refeição (VR)</th>
                                            <td>R$ ${formatarValor(resultado.vr)}</td>
                                        </tr>
                                        <!-- Sexta Linha -->
                                        <tr>
                                            <th>Vale Alimentação (VA)</th>
                                            <td>R$ ${formatarValor(resultado.va)}</td>
                                            <th>Vale Transporte (VT)</th>
                                            <td>R$ ${formatarValor(resultado.vt)}</td>
                                        </tr>
                                        <!-- Sétima Linha -->
                                        <tr>
                                            <th>Gympass</th>
                                            <td>R$ ${formatarValor(resultado.gympass)}</td>
                                            <th>Reembolso</th>
                                            <td>R$ ${formatarValor(resultado.reembolso)}</td>
                                        </tr>
                                        <!-- Oitava Linha -->
                                        <tr>
                                            <th>Comissão</th>
                                            <td>R$ ${formatarValor(resultado.comissao)}</td>
                                            <th>Auxílio Creche</th>
                                            <td>R$ ${formatarValor(resultado.aux_creche)}</td>
                                        </tr>
                
                                        <!-- Total -->
                                        <tr class="table-success">
                                            <th colspan="2"><strong>Total</strong></th>
                                            <td colspan="2"><strong>R$ ${formatarValor(resultado.total)}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div><br/>`;   
                    });
        
                    // Inserir a tabela na modal
                    $('#resultadosModal .modal-body').html(tabelaHtml);
                    $('#avancarModal').modal('hide');
                    $('#resultadosModal').modal('show');
                } else {
                    alert('Erro ao calcular precificação: ' + response.message);
                }
            },
            error: function () {
                alert('Erro ao realizar a requisição.');
                console.log('Dados para o backend:', dadosParaEnviar);
            }
        });        
    });
});