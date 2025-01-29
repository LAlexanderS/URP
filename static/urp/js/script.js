function showPhotoCarousel(index) {
    // Активируем соответствующий слайд
    const carousel = new bootstrap.Carousel(document.querySelector('#photoCarousel'))
    carousel.to(index) // Переход на слайд с заданным индексом
}

document.querySelectorAll('.photo-card img').forEach((img, index) => {
    img.addEventListener('click', () => showPhotoCarousel(index))
})


function toggleUploadButton(input) {
    const uploadButton = document.getElementById('uploadButton')
    if (input.files.length > 0) {
        uploadButton.classList.remove('btn-secondary') // Убираем серый цвет
        uploadButton.classList.add('btn-success') // Добавляем зелёный цвет
        uploadButton.disabled = false // Делаем кнопку активной
    } else {
        uploadButton.classList.remove('btn-success') // Убираем зелёный цвет
        uploadButton.classList.add('btn-secondary') // Добавляем серый цвет
        uploadButton.disabled = true // Делаем кнопку неактивной
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("JS загружен!")

    /** Функция переключения состояния кнопки "Создать папку" */
    function toggleCreateButton() {
        const createButton = document.getElementById('createButton')
        const newDirectory = document.getElementById('new_directory')

        if (!createButton) {
            console.error("Ошибка: Кнопка 'Создать папку' не найдена!")
            return
        }
        if (!newDirectory) {
            console.error("Ошибка: Поле ввода папки 'new_directory' не найдено!")
            return
        }

        console.log("Введено в поле папки:", newDirectory.value)

        if (newDirectory.value.trim() !== '') {
            createButton.classList.remove('btn-secondary')
            createButton.classList.add('btn-success')
            createButton.removeAttribute("disabled")
        } else {
            createButton.classList.remove('btn-success')
            createButton.classList.add('btn-secondary')
            createButton.setAttribute("disabled", "true")
        }
    }

    /** Подключаем события */
    let newDirInput = document.getElementById("new_directory")
    if (newDirInput) {
        newDirInput.addEventListener("input", toggleCreateButton)
    } else {
        console.warn("Поле ввода новой папки не найдено!")
    }
})


function editFolder(currentName) {
    const newName = prompt('Введите новое имя для папки:', currentName)

    // Проверяем, ввел ли пользователь новое имя
    if (newName && newName.trim() !== currentName.trim()) {
        // Создаем форму для отправки данных POST-запросом
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = `/edit_directory/${encodeURIComponent(currentName)}/`

        // Добавляем CSRF-токен
        const csrfInput = document.createElement('input')
        csrfInput.type = 'hidden'
        csrfInput.name = 'csrfmiddlewaretoken'
        csrfInput.value = '{{ csrf_token }}' // Убедитесь, что токен передается корректно в шаблон
        form.appendChild(csrfInput)

        // Добавляем поле с новым именем
        const nameInput = document.createElement('input')
        nameInput.type = 'hidden'
        nameInput.name = 'new_name'
        nameInput.value = newName.trim()
        form.appendChild(nameInput)

        // Добавляем форму на страницу и отправляем
        document.body.appendChild(form)
        form.submit()
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".delete-folder").forEach(button => {
        button.addEventListener("click", function () {
            let folderPath = this.getAttribute("data-folder").trim()
            if (!folderPath) return

            if (confirm(`Удалить папку ${folderPath.split("/").pop()}?`)) {
                fetch(`/delete_directory/${encodeURIComponent(folderPath)}/`, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            this.closest("li").remove() // Удаляем элемент списка без перезагрузки
                        } else {
                            alert("Ошибка при удалении")
                        }
                    })
                    .catch(error => console.error("Ошибка:", error))
            }
        })
    })
})

function deleteFolder(directoryName, button) {
    if (!confirm(`Удалить папку "${directoryName}"?`)) {
        return
    }

    fetch(`/delete_directory/${encodeURIComponent(directoryName)}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),  // Получаем CSRF-токен
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                button.closest("li").remove()  // Удаляем элемент из списка
            } else {
                alert("Ошибка удаления папки")
            }
        })
        .catch(error => console.error("Ошибка:", error))
}

function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value
}
