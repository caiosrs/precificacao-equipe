$(document).ready(function () {
    $('#calcular-btn').on('click', function () {
        // Oculta a modal atual (avancarModal)
        $('#avancarModal').modal('hide');

        // Pega a data atual
        let hoje = new Date();
        let dia = hoje.getDate().toString().padStart(2, '0');
        let mes = (hoje.getMonth() + 1).toString().padStart(2, '0'); // Meses começam do 0
        let ano = hoje.getFullYear();
        let dataHojeFormatada = `${dia}/${mes}/${ano}`;

        // Define a data de dissídio
        let dissidioDia = 1;
        let dissidioMes = 8; // Agosto
        let dtDissidio = new Date(ano, dissidioMes - 1, dissidioDia);

        // Verifica se a data atual passou da data de dissídio
        if (hoje >= dtDissidio) {
            // Se já passou, define o ano do dissídio para o ano seguinte
            dtDissidio.setFullYear(ano + 1);
        } else {
            // Caso contrário, mantém o ano atual
            dtDissidio.setFullYear(ano);
        }

        // Formata a data de dissídio
        let diaDissidio = dtDissidio.getDate().toString().padStart(2, '0');
        let mesDissidio = (dtDissidio.getMonth() + 1).toString().padStart(2, '0');
        let anoDissidio = dtDissidio.getFullYear();
        let dataDissidioFormatada = `${diaDissidio}/${mesDissidio}/${anoDissidio}`;

        // Captura os valores dos campos
        let ipca = parseFloat($('#id_ipca').val());
        let qtdFuncionarios = parseInt($('#id_qtd_funcionario_cliente').val());
        let lucroDesejado = parseFloat($('#id_lucro_desejado').val());

        // Cálculo dos dias e meses
        let dias = Math.ceil((dtDissidio - hoje) / (1000 * 60 * 60 * 24));
        let meses = dias / 30;

        // Cálculo do índice de reajuste
        let indiceReajuste = ((ipca * meses) / 12) / 100 + 1;

        // Atualiza o conteúdo da modal com os resultados
        $('#resultados-modal-body-content').html(`
            <p>Data de Hoje: ${dataHojeFormatada}</p>
            <p>Data de Dissídio: ${dataDissidioFormatada}</p>
            <p>Diferença em Dias: ${dias}</p>
            <p>Número de Meses: ${meses.toFixed(2)}</p>
            <p>Índice de Reajuste: ${indiceReajuste.toFixed(4)}</p>
        `);

        // Exibe a modal de resultados (resultadosModal)
        $('#resultadosModal').modal('show');
    });
});
