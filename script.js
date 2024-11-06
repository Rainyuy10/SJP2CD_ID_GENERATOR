let editMode = false;
let editingId = null;
const idHistory = JSON.parse(localStorage.getItem('idHistory')) || [];

const getElement = (id) => document.getElementById(id);

const renderHistory = () => {
    const historyList = getElement('historyList');
    historyList.innerHTML = '';

    idHistory.forEach((id, index) => {
        const idItem = document.createElement('div');
        idItem.classList.add('id-item');

        const thumbnail = document.createElement('img');
        thumbnail.src = id.profilePicture || 'default-thumbnail.png';
        thumbnail.alt = 'Thumbnail';
        thumbnail.classList.add('thumbnail');

        const details = ['fullName', 'course', 'idNumber'].map(field => {
            const p = document.createElement('p');
            p.innerText = `${field.charAt(0).toUpperCase() + field.slice(1)}: ${id[field]}`;
            return p;
        });

        const editButton = createButton('Edit', () => editIdCard(index));
        const deleteButton = createButton('Delete', () => deleteIdCard(index));

        idItem.append(thumbnail, ...details, editButton, deleteButton);
        historyList.appendChild(idItem);
    });
};

const createButton = (text, onClick) => {
    const button = document.createElement('button');
    button.innerText = text;
    button.addEventListener('click', onClick);
    return button;
};

const saveToHistory = (idCardData) => {
    if (editMode) {
        idHistory[editingId] = idCardData;
        resetEditMode();
    } else {
        idHistory.push(idCardData);
    }

    localStorage.setItem('idHistory', JSON.stringify(idHistory));
    renderHistory();
};

const resetEditMode = () => {
    editMode = false;
    editingId = null;
    getElement('generateButton').innerText = 'Generate ID Card';
};

const handleFormSubmit = (event) => {
    event.preventDefault();

    const fullName = getElement('fullName').value;
    const course = getElement('course').value;
    const idNumber = getElement('idNumber').value;
    const idPicture = getElement('idPicture').files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
        const profilePicture = e.target.result;

        const idCardData = { fullName, course, idNumber, profilePicture };
        saveToHistory(idCardData);

        displayIdCard(idCardData);
    };

    reader.readAsDataURL(idPicture);
};

const displayIdCard = (idCardData) => {
    getElement('nameDisplay').innerText = idCardData.fullName;
    getElement('courseDisplay').innerText = idCardData.course;
    getElement('idNumberDisplay').innerText = idCardData.idNumber;
    getElement('profilePicture').src = idCardData.profilePicture;

    getElement('idCard').style.display = 'block';
    getElement('downloadButton').style.display = 'block';

    getElement('idCardForm').reset();
};

const editIdCard = (index) => {
    editMode = true;
    editingId = index;

    const id = idHistory[index];
    getElement('fullName').value = id.fullName;
    getElement('course').value = id.course;
    getElement('idNumber').value = id.idNumber;

    getElement('generateButton').innerText = 'Save Changes';
    getElement('idCard').style.display = 'none';
    getElement('downloadButton').style.display = 'none';
};

const deleteIdCard = (index) => {
    idHistory.splice(index, 1);
    localStorage.setItem('idHistory', JSON.stringify(idHistory));
    renderHistory();
};

const handleDownloadClick = () => {
    html2canvas(getElement('idCard')).then(canvas => {
        canvas.toBlob(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'id_card.png';
            link.click();
            URL.revokeObjectURL(link.href);
        });
    }).catch(error => {
        console.error("Error generating image:", error);
    });
};

getElement('idCardForm').addEventListener('submit', handleFormSubmit);
getElement('downloadButton').addEventListener('click', handleDownloadClick);

renderHistory();
