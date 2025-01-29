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
        uploadButton.classList.remove('btn-secondary')
        uploadButton.classList.add('btn-success')
        uploadButton.disabled = false
    } else {
        uploadButton.classList.remove('btn-success')
        uploadButton.classList.add('btn-secondary')
        uploadButton.disabled = true
    }
}

/** Функция переключения состояния кнопки "Создать папку" */
document.addEventListener("DOMContentLoaded", function () {
    console.log("JS загружен!")

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

function editFolder(currentName, button) {
    const folderParts = currentName.split("/")
    const currentFolderName = folderParts[folderParts.length - 1]  // только имя папки
    const newName = prompt("Введите новое имя для папки:", currentFolderName)

    if (!newName || newName.trim() === "") {
        alert("Ошибка: Название папки не может быть пустым!")
        return
    }

    const currentDirectory = new URLSearchParams(window.location.search).get("directory") || ""

    fetch(`/edit_directory/${encodeURIComponent(currentDirectory)}/${encodeURIComponent(currentFolderName)}/`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCSRFToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ new_name: newName.trim() })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                button.closest("li").querySelector("a").textContent = newName
                alert("Папка успешно переименована!")
                location.reload()
            } else {
                alert("Ошибка: " + data.error)
            }
        })
        .catch(error => console.error("Ошибка:", error))
}

function getCSRFToken() {
    return document.querySelector("[name=csrfmiddlewaretoken]").value
}

function getCSRFToken() {
    return document.querySelector("[name=csrfmiddlewaretoken]").value
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
                            this.closest("li").remove()
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
            'X-CSRFToken': getCSRFToken(),
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                button.closest("li").remove()
            } else {
                alert("Ошибка удаления папки")
            }
        })
        .catch(error => console.error("Ошибка:", error))
}

function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value
}
