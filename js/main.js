// Envolve todo o código em uma função para evitar poluir o escopo global
(function() {
    'use strict';

    /* 1. LÓGICA DE SPA (SINGLE PAGE APPLICATION)
     * Carrega o conteúdo das outras páginas dinamicamente.
     */
    const initSpa = () => {
        const navLinks = document.querySelectorAll('header nav a');
        const mainContent = document.querySelector('main');

        const loadPageContent = async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Página não encontrada.');
                const pageText = await response.text();
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(pageText, 'text/html');
                const newMainContent = newDoc.querySelector('main').innerHTML;
                mainContent.innerHTML = newMainContent;
                
                // Re-inicializa os scripts do formulário na nova página
                initFormScripts();

            } catch (error) {
                console.error("Erro ao carregar a página:", error);
                mainContent.innerHTML = `<h2>Erro ao carregar o conteúdo.</h2>`;
            }
        };

        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const href = link.getAttribute('href');
                window.history.pushState({}, '', href);
                loadPageContent(href);
            });
        });
    };

    /* 2. SISTEMA DE VERIFICAÇÃO DE FORMULÁRIO
     * Agrupa todas as funcionalidades relacionadas ao formulário.
     */
    const initFormScripts = () => {
        const form = document.getElementById('form-cadastro');
        if (!form) return; // Só executa se o formulário existir

        // Funcionalidade 2.1: Restringir campos para aceitar apenas números
        initNumericOnlyInputs(form);

        // Funcionalidade 2.2: Validar o formulário no envio
        form.setAttribute('novalidate', true);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const feedbackDiv = document.getElementById('form-feedback');
            
            // Limpa mensagens antigas
            feedbackDiv.style.display = 'none';
            feedbackDiv.textContent = '';
            
            const isFormValid = validateAllFields(form);

            if (isFormValid) {
                showFeedbackMessage('Cadastro enviado com sucesso!', 'success');
                form.reset();
                clearAllErrors(form); // Garante que as bordas voltem ao normal
            } else {
                showFeedbackMessage('Por favor, corrija os campos destacados.', 'error');
            }
        });
    };

    // Função que força os campos a aceitarem apenas números
    const initNumericOnlyInputs = (form) => {
        const numericFields = form.querySelectorAll('#cpf, #cep, #telefone');
        numericFields.forEach(field => {
            field.addEventListener('input', () => {
                // Remove qualquer caractere que não seja um dígito
                field.value = field.value.replace(/\D/g, '');
            });
        });
    };

    // Função principal que valida todos os campos
    const validateAllFields = (form) => {
        let allValid = true;
        clearAllErrors(form);

        const fields = form.querySelectorAll('input[required], select[required]');
        fields.forEach(field => {
            const fieldId = field.id;
            let errorMessage = '';

            if (!field.value.trim()) {
                errorMessage = 'Este campo é obrigatório.';
            } else if (field.type === 'email' && !isValidEmail(field.value)) {
                errorMessage = 'Por favor, insira um e-mail válido.';
            } else if (fieldId === 'cpf' && !isValidCPF(field.value)) {
                errorMessage = 'CPF inválido (deve conter 11 dígitos).';
            } else if (fieldId === 'telefone' && field.value.length < 10) {
                errorMessage = 'O telefone deve ter no mínimo 10 dígitos.';
            } else if (fieldId === 'cep' && field.value.length !== 8) {
                errorMessage = 'O CEP deve ter 8 dígitos.';
            }

            if (errorMessage) {
                showFieldError(field, errorMessage);
                allValid = false;
            }
        });
        return allValid;
    };


    /* 3. FUNÇÕES AUXILIARES DE VALIDAÇÃO E FEEDBACK
     */
    
    // Mostra a mensagem principal de sucesso ou erro
    const showFeedbackMessage = (message, type) => {
        const feedbackDiv = document.getElementById('form-feedback');
        feedbackDiv.textContent = message;
        feedbackDiv.className = type; // 'success' ou 'error'
        feedbackDiv.style.display = 'block';

        // Esconde a mensagem após 4 segundos
        setTimeout(() => {
            feedbackDiv.style.display = 'none';
        }, 4000);
    };
    
    // Mostra a mensagem de erro específica abaixo de cada campo
    const showFieldError = (field, message) => {
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = message;
        field.parentElement.appendChild(errorSpan);
        field.classList.add('error-field');
    };

    // Limpa todas as mensagens de erro dos campos
    const clearAllErrors = (form) => {
        form.querySelectorAll('.error-message').forEach(span => span.remove());
        form.querySelectorAll('.error-field').forEach(field => field.classList.remove('error-field'));
    };
    
    // Funções de validação específicas
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidCPF = (cpf) => /^\d{11}$/.test(cpf.replace(/[^\d]+/g, ''));


    /* 4. INICIALIZAÇÃO
     * Aguarda o DOM estar pronto para executar os scripts.
     */
    document.addEventListener('DOMContentLoaded', () => {
        initSpa();
        initFormScripts(); // Executa para a página inicial
    });

})();