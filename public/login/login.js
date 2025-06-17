document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorElement = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                body: formData
            });
            const result = await response.text();
            if (errorElement) {
                errorElement.innerText = result;
                if (response.status === 200) {
                    window.location.href = '/panel';
                }
            }
        } catch (error) {
            if (errorElement) {
                errorElement.innerText = 'Ошибка при отправке запроса';
            }
        }
    });
});