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

        const dadosCargos = { /* Seus dados aqui */ };

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
                            conteudo += `
                                <tr>
                                    <td><h6 for="${campo}_${tipo}_${quantidade}">${campo}</h6></td>
                                    <td>
                                        <div class="input-group">
                                            <span class="input-group-text">R$</span>
                                            <input type="text" id="${campo}_${tipo}_${quantidade}" class="form-control" value="${valorFormatado}">
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

        let tiposDeCargos = [ /* Seus tipos de cargos aqui */ ];

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

    $('#calcular-btn').on('click', function () {
        $('#avancarModal').modal('hide');

        let hoje = new Date();
        let dia = hoje.getDate().toString().padStart(2, '0');
        let mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
        let ano = hoje.getFullYear();
        let dataHojeFormatada = `${dia}/${mes}/${ano}`;

        let dissidioDia = 1;
        let dissidioMes = 8;
        let dtDissidio = new Date(ano, dissidioMes - 1, dissidioDia);

        if (hoje >= dtDissidio) {
            dtDissidio.setFullYear(ano + 1);
        } else {
            dtDissidio.setFullYear(ano);
        }

        let diaDissidio = dtDissidio.getDate().toString().padStart(2, '0');
        let mesDissidio = (dtDissidio.getMonth() + 1).toString().padStart(2, '0');
        let anoDissidio = dtDissidio.getFullYear();
        let dataDissidioFormatada = `${diaDissidio}/${mesDissidio}/${anoDissidio}`;

        let ipca = parseFloat($('#id_ipca').val()) || 0;
        let qtdFuncionarios = parseInt($('#id_qtd_funcionario_cliente').val()) || 0;
        let lucroDesejado = parseFloat($('#id_lucro_desejado').val()) || 0;

        let dias = Math.ceil((dtDissidio - hoje) / (1000 * 60 * 60 * 24));
        let meses = dias / 30;

        let indiceReajuste = ((ipca * meses) / 12) / 100 + 1;

        let totalSalarioComBeneficios = 0;

        // Itera sobre os cargos salvos para somar os valores
        for (const [tipo, valores] of Object.entries(dadosCargosSalvos)) {
            for (const [quantidade, campos] of Object.entries(valores)) {
                for (const [campo, valor] of Object.entries(campos)) {
                    let valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
                    totalSalarioComBeneficios += valorNumerico;
                }
            }
        }

        $('#resultado-salario').text(`R$ ${totalSalarioComBeneficios.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        $('#resultado-dissidio').text(`Data do próximo dissídio: ${dataDissidioFormatada}`);

        $('#resultados-body-content').html(`
            <p>IPCA: ${ipca}</p>
            <p>Quantidade de Funcionários: ${qtdFuncionarios}</p>
            <p>Lucro Desejado: ${lucroDesejado}</p>
        `);

        $('#resultadosModal').modal('show');
    });
});