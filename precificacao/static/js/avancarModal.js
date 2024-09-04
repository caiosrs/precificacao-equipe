// Define um array global para armazenar os valores dos inputs
let cargosValues = [];

$(document).ready(function() {
    $('#avancar-btn').on('click', function () {
        console.log('Botão "Avançar" clicado');
        
        $('#avancarModal').modal('show');
        const modalBodyContent = $('#modal-body-content');

        modalBodyContent.empty();
        console.log('Conteúdo da modal limpo');

        // Array para armazenar cargos e suas quantidades
        const cargos = [
            { id: 'coordenador_junior_fields', label: 'Coordenador Júnior', values: [4391.39, 4606.02, 383.83, 127.94, '', '', 409.42, 450.00, 21.96, 7.27, 574.20, 600.00, 200.00, 14.73, '', '', ''] },
            { id: 'coordenador_pleno_fields', label: 'Coordenador Pleno', values: [5018.73, 5264.02, 438.67, 146.22, '', '', 467.91, 450.00, 21.96, 7.27, 574.20, 600.00, 200.00, 14.73, '', '', ''] },
            { id: 'coordenador_senior_fields', label: 'Coordenador Sênior', values: [5646.07, 5922.02, 493.50, 164.50, '', '', 526.40, 450.00, 21.96, 7.27, 574.20, 600.00, 200.00, 14.73, '', '', ''] },
            { id: 'analista_junior_fields', label: 'Analista Júnior', values: [2625.62, 2753.95, 229.50, 76.50, '', '', 244.80, 450.00, 21.96, 7.27, 574.20, 0.00, 200.00, 14.73, '', '', ''] },
            { id: 'analista_pleno_fields', label: 'Analista Pleno', values: [3034.26, 3182.56, 265.21, 88.40, '', '', 282.89, 450.00, 21.96, 7.27, 574.20, 0.00, 200.00, 14.73, '', '', ''] },
            { id: 'analista_senior_fields', label: 'Analista Sênior', values: [3513.11, 3684.81, 307.07, 102.35, '', '', 327.54, 450.00, 21.96, 7.27, 574.20, 0.00, 200.00, 14.73, '', '', ''] },
            { id: 'assistente_fields', label: 'Assistente', values: [2160.59, 2266.18, 188.85, 62.95, '', '', 201.44, 450.00, 21.96, 7.27, 574.20, 0.00, 200.00, 14.73, '', '', ''] },
            { id: 'auxiliar_fields', label: 'Auxiliar', values: [1819.86, 1908.81, 159.07, 53.02, '', '', 169.67, 450.00, 21.96, 7.27, 574.20, 0.00, 200.00, 14.73, '', '', ''] }
        ];

        const inputLabels = [
            'Salário Base', 'Salário com Dissídio Proporcional', '13. Salário', 'Férias',
            'Horas Extras', 'Gratificação', 'FGTS', 'Ass. Médica', 'Ass. Odont.', 
            'Seguro Vida', 'Val. Refeição', 'Vale Alimentação', 'Val. Transp', 
            'Gympass', 'Reembolso', 'Comissão', 'Auxílio Creche'
        ];

        let hasCargos = false;

        function formatNumber(num) {
            if (num === '') return '0,00';
            return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        cargosValues = []; // Limpa o array global
        console.log('Array cargosValues limpo:', cargosValues);

        cargos.forEach(cargo => {
            const fieldsDiv = $(`#${cargo.id}`);
            console.log(`Verificando campos para ${cargo.label} com ID ${cargo.id}`);
            const inputs = fieldsDiv.find('input');
            console.log(`Número de inputs encontrados: ${inputs.length}`);
            
            if (inputs.length > 0) {
                inputs.each(function (index) {
                    // Adicionar título do cargo seguido do número sequencial
                    const title = $('<div>').addClass('mb-2 mt-3').html(`<strong>${cargo.label} ${index + 1}:</strong>`);
                    modalBodyContent.append(title);

                    const inputRow = $('<div>').addClass('row');

                    // Criar inputs para cada campo do cargo
                    inputLabels.forEach((label, i) => {
                        const colDiv = $('<div>').addClass('col-6 col-md-4 col-lg-3 mb-3');
                        const formGroup = $('<div>').addClass('form-group');
                        const inputLabel = $('<label>').addClass('form-label').text(label);
                        const input = $('<input>')
                            .attr('type', 'text')
                            .addClass('form-control')
                            .attr('placeholder', '0,00')
                            .attr('id', `${cargo.id}_${label.replace(/[\s\.]/g, '_').toLowerCase()}_${index + 1}`)
                            .attr('name', `${cargo.id}_${label.replace(/[\s\.]/g, '_').toLowerCase()}_${index + 1}`)
                            .val(formatNumber(cargo.values[i]));

                        formGroup.append(inputLabel, input);
                        colDiv.append(formGroup);
                        inputRow.append(colDiv);
                    });

                    modalBodyContent.append(inputRow);
                });

                hasCargos = true;
            }
        });

        if (!hasCargos) {
            modalBodyContent.html('<p>Nenhum cargo adicionado.</p>');
            console.log('Nenhum cargo adicionado.');
        }
        
        console.log('Array cargosValues final:', cargosValues);
    });

    $('#calcular-btn').on('click', function () {
        console.log('Botão "Confirmar" clicado');

        cargosValues = []; // Limpa o array global para armazenar os valores atualizados
        console.log('Array cargosValues limpo:', cargosValues);

        // Coleta os valores atualizados dos inputs
        $('.modal-body').find('input').each(function () {
            const input = $(this);
            const cargoLabel = input.closest('.row').prev('div').text().split(' ')[0]; // Obtém o label do cargo
            const inputLabel = input.prev('label').text();
            const inputValue = input.val();

            cargosValues.push({
                cargo: cargoLabel,
                campo: inputLabel,
                valor: inputValue
            });

            console.log(`Campo ${inputLabel} para ${cargoLabel}: ${inputValue} ID: ${input.attr('id')}`);
        });

        console.log('Array cargosValues final com valores atualizados:', cargosValues);
        $('#avancarModal').modal('hide');
    });
});
