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

function editFolder(currentName, button) {
    const folderParts = currentName.split("/")
    const currentFolderName = folderParts.pop() // Получаем имя папки
    const currentDirectory = folderParts.join("/") || "" // Если корень, передаем ""

    const newName = prompt("Введите новое имя для папки:", currentFolderName)

    if (!newName || newName.trim() === "") {
        alert("Ошибка: Название папки не может быть пустым!")
        return
    }

    let apiUrl = currentDirectory
        ? `/edit_directory/${encodeURIComponent(currentDirectory)}/${encodeURIComponent(currentFolderName)}/`
        : `/edit_directory/${encodeURIComponent(currentFolderName)}/` // 📌 Корневые папки

    fetch(apiUrl, {
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


document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".delete-media-btn").forEach(button => {
        button.addEventListener("click", function () {
            let mediaPath = this.getAttribute("data-media")
            let csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value

            if (confirm("Вы уверены, что хотите удалить этот файл?")) {
                fetch(`/delete_media/${encodeURIComponent(mediaPath)}/`, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": csrfToken
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            location.reload()  // Перезагрузка страницы после удаления
                        } else {
                            alert("Ошибка: " + data.error)
                        }
                    })
                    .catch(error => console.error("Ошибка:", error))
            }
        })
    })
})

