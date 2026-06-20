(() => {
    const onlyNumbers = (value) => value.replace(/\D/g, '');

    const formatCpf = (value) => {
        const digits = onlyNumbers(value).slice(0, 11);
        return digits
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };

    const formatCnpj = (value) => {
        const digits = onlyNumbers(value).slice(0, 14);
        return digits
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    };

    const documentInputs = document.querySelectorAll('input[name="cpf"], input[name="cnpj"], input[name="cpfCnpj"]');
    const customerType = document.querySelector('select[name="tipo"]');

    const applyMask = (input) => {
        const isCnpj = input.name === 'cnpj'
            || (input.name === 'cpfCnpj' && (customerType?.value === 'juridica' || onlyNumbers(input.value).length > 11));
        input.value = isCnpj ? formatCnpj(input.value) : formatCpf(input.value);
        input.maxLength = isCnpj ? 18 : 14;
        input.inputMode = 'numeric';
    };

    documentInputs.forEach((input) => {
        applyMask(input);
        input.addEventListener('input', () => applyMask(input));
    });

    customerType?.addEventListener('change', () => {
        const input = document.querySelector('input[name="cpfCnpj"]');
        if (input) applyMask(input);
    });
})();
