const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc_sJpZ-t2y-Mt_HsDADgh4-et7OGLGFqZNXseLRQlGwciWoQ/formResponse';
const ENTRY_SURNAME = 'entry.138719531';
const ENTRY_AMOUNT = 'entry.1949578643';

const CBR_API_URL = 'https://www.cbr-xml-daily.ru/daily_json.js';

let currentCNYRate = null;

// Загрузка курса при старте
async function loadExchangeRate() {
    try {
        const response = await fetch(CBR_API_URL);
        const data = await response.json();

        currentCNYRate = data.Valute.CNY.Value;

        document.getElementById('rateInfo').textContent =
            `Курс ЦБ РФ: 1 CNY = ${currentCNYRate.toFixed(4)} RUB`;
    } catch (error) {
        document.getElementById('rateInfo').textContent = 'Не удалось загрузить курс';
        console.error('CBR API error:', error);
    }
}

// Отправка в Google Forms
async function submitToGoogleForm(surname, yuanAmount) {
    const formData = new URLSearchParams();
    formData.append(ENTRY_SURNAME, surname);
    formData.append(ENTRY_AMOUNT, yuanAmount.toFixed(2));

    const response = await fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        mode: 'no-cors', // Важно для обхода CORS
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    });

    return true;
}

// Обработчик формы
document.getElementById('converterForm')
    .addEventListener('submit', async (e) => {
    e.preventDefault();

    const surname = document.getElementById('surname').value.trim();
    const rubles = parseFloat(document.getElementById('rubles').value);
    const resultDiv = document.getElementById('result');
    const btn = document.getElementById('submitBtn');

    if (!currentCNYRate) {
        showResult('error', 'Курс валют не загружен. Попробуйте позже.');
        return;
    }

    // UI обновления
    btn.disabled = true;
    resultDiv.classList.remove('show', 'success', 'error');

    try {
        // Конвертация
        const yuanAmount = rubles / currentCNYRate;

        // Отправка в Google Forms
        await submitToGoogleForm(surname, yuanAmount);

        // Успех
        showResult('success',
            `Готово!<br><br>
                    <strong>${rubles.toFixed(2)} RUB</strong> = 
                    <strong>${yuanAmount.toFixed(2)} CNY</strong><br>
                    <small>Данные отправлены в форму</small>`
        );

        // Очистка формы
        e.target.reset();

    } catch (error) {
        showResult('error', `Ошибка: ${error.message}`);
        console.error('Submission error:', error);
    } finally {
        btn.disabled = false;
    }
});

function showResult(type, message) {
    const resultDiv = document.getElementById('result');
    resultDiv.className = `result show ${type}`;
    resultDiv.innerHTML = message;
}

// Инициализация
loadExchangeRate().then();