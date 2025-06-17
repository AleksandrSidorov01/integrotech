document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const errorElement = document.getElementById('error');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            body: formData
        });
        const result = await response.text();
        if (errorElement) {
            errorElement.innerText = result;
        }
    } catch (error) {
        if (errorElement) {
            errorElement.innerText = 'Ошибка при отправке запроса';
        }
    }
});

// integrotexalex2025
// integrotech