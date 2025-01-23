function showPhotoCarousel(index) {
    // Активируем соответствующий слайд
    const carousel = new bootstrap.Carousel(document.querySelector('#photoCarousel'));
    carousel.to(index); // Переход на слайд с заданным индексом
}

document.querySelectorAll('.photo-card img').forEach((img, index) => {
    img.addEventListener('click', () => showPhotoCarousel(index));
});
   

function toggleUploadButton(input) {
    const uploadButton = document.getElementById('uploadButton');
    if (input.files.length > 0) {
        uploadButton.classList.remove('btn-secondary'); // Убираем серый цвет
        uploadButton.classList.add('btn-success'); // Добавляем зелёный цвет
        uploadButton.disabled = false; // Делаем кнопку активной
    } else {
        uploadButton.classList.remove('btn-success'); // Убираем зелёный цвет
        uploadButton.classList.add('btn-secondary'); // Добавляем серый цвет
        uploadButton.disabled = true; // Делаем кнопку неактивной
    }
}

function toggleCreateButton() {
    const createButton = document.getElementById('createButton');
    const newDirectory = document.getElementById('new_directory');
    if (newDirectory.value.trim() !== '') {
        createButton.classList.remove('btn-secondary'); // Убираем серый цвет
        createButton.classList.add('btn-success'); // Добавляем зелёный цвет
        createButton.disabled = false; // Делаем кнопку активной
    } else {
        createButton.classList.remove('btn-success'); // Убираем зелёный цвет
        createButton.classList.add('btn-secondary'); // Добавляем серый цвет
        createButton.disabled = true; // Делаем кнопку неактивной
    }
}

function editFolder(currentName) {
    const newName = prompt('Введите новое имя для папки:', currentName);

    // Проверяем, ввел ли пользователь новое имя
    if (newName && newName.trim() !== currentName.trim()) {
        // Создаем форму для отправки данных POST-запросом
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/edit_directory/${encodeURIComponent(currentName)}/`;

        // Добавляем CSRF-токен
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = '{{ csrf_token }}'; // Убедитесь, что токен передается корректно в шаблон
        form.appendChild(csrfInput);

        // Добавляем поле с новым именем
        const nameInput = document.createElement('input');
        nameInput.type = 'hidden';
        nameInput.name = 'new_name';
        nameInput.value = newName.trim();
        form.appendChild(nameInput);

        // Добавляем форму на страницу и отправляем
        document.body.appendChild(form);
        form.submit();
    }
}