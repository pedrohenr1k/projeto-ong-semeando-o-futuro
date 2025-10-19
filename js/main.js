// Envolve todo o código em uma função para evitar poluir o escopo global
(function() {
    'use strict';

    /**
     * 1. LÓGICA DE SPA (SINGLE PAGE APPLICATION)
     * Carrega o conteúdo das outras páginas dinamicamente.
     */
    const initSpa = () => {
        // Seleciona apenas os links de navegação que não são externos
        const navLinks = document.querySelectorAll('header nav a[href^="/"], header nav a[href^="."]');
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
                
                // Re-inicializa os scripts do formulário na nova página, se houver
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

    /**
     * 2. SISTEMA DE VERIFICAÇÃO DE FORMULÁRIO
     * Agrupa todas as funcionalidades relacionadas ao formulário.
     */
    const initFormScripts = () => {
        const form = document.getElementById('form-cadastro');
        if (!form) return; // Só executa se o formulário existir

        initNumericOnlyInputs(form);

        form.setAttribute('novalidate', true);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const feedbackDiv = document.getElementById('form-feedback');
            
            feedbackDiv.style.display = 'none';
            feedbackDiv.textContent = '';
            
            const isFormValid = validateAllFields(form);

            if (isFormValid) {
                showFeedbackMessage('Cadastro enviado com sucesso!', 'success');
                form.reset();
                clearAllErrors(form);
            } else {
                showFeedbackMessage('Por favor, corrija os campos destacados.', 'error');
            }
        });
    };

    const initNumericOnlyInputs = (form) => {
        const numericFields = form.querySelectorAll('#cpf, #cep, #telefone');
        numericFields.forEach(field => {
            field.addEventListener('input', () => {
                field.value = field.value.replace(/\D/g, '');
            });
        });
    };

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

    /**
     * 3. CONTROLE DE TEMA (MODO ESCURO)
     * Gerencia a troca de tema e salva a preferência do usuário.
     */
    const initThemeSwitcher = () => {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return; // Só executa se o seletor existir

        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.documentElement.setAttribute('data-theme', currentTheme);
            if (currentTheme === 'dark') themeToggle.checked = true;
        }

        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    };

    /**
     * 4. FUNÇÕES AUXILIARES DE FEEDBACK
     */
    const showFeedbackMessage = (message, type) => {
        const feedbackDiv = document.getElementById('form-feedback');
        if(!feedbackDiv) return;
        feedbackDiv.textContent = message;
        feedbackDiv.className = type;
        feedbackDiv.style.display = 'block';

        setTimeout(() => {
            feedbackDiv.style.display = 'none';
        }, 4000);
    };
    
    const showFieldError = (field, message) => {
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = message;
        field.parentElement.appendChild(errorSpan);
        field.classList.add('error-field');
    };

    const clearAllErrors = (form) => {
        form.querySelectorAll('.error-message').forEach(span => span.remove());
        form.querySelectorAll('.error-field').forEach(field => field.classList.remove('error-field'));
    };
    
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidCPF = (cpf) => /^\d{11}$/.test(cpf.replace(/[^\d]+/g, ''));

    /**
     * 5. INICIALIZAÇÃO GERAL
     * Aguarda o DOM estar pronto para executar os scripts.
     */
    document.addEventListener('DOMContentLoaded', () => {
        initSpa();
        initFormScripts(); // Executa para a página carregada inicialmente
        initThemeSwitcher(); // Executa para a página carregada inicialmente
    });

})();