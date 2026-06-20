(() => {
    const shell = document.querySelector('.app-shell');
    const toggle = document.querySelector('[data-sidebar-toggle]');

    if (!shell || !toggle) return;

    const storageKey = 'grill-system-sidebar-collapsed';
    const setCollapsed = (collapsed) => {
        shell.classList.toggle('sidebar-collapsed', collapsed);
        toggle.setAttribute('aria-expanded', String(!collapsed));
        toggle.title = collapsed ? 'Expandir menu' : 'Recolher menu';
    };

    setCollapsed(localStorage.getItem(storageKey) === 'true');

    toggle.addEventListener('click', () => {
        const collapsed = !shell.classList.contains('sidebar-collapsed');
        setCollapsed(collapsed);
        localStorage.setItem(storageKey, String(collapsed));
    });
})();
