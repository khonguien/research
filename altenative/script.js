// --- 1. Dark Mode Toggle ---
const darkModeToggleBtn = document.getElementById('darkModeToggle');

// Check local storage for preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// --- 2. Copy to Clipboard ---
function copyText(elementId, btnElement) {
    const textToCopy = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Visual feedback
        const originalText = btnElement.innerText;
        btnElement.innerText = "Copied!";
        btnElement.style.backgroundColor = "#28a745";
        btnElement.style.color = "#fff";
        btnElement.style.borderColor = "#28a745";
        
        setTimeout(() => {
            btnElement.innerText = originalText;
            btnElement.style.backgroundColor = "";
            btnElement.style.color = "";
            btnElement.style.borderColor = "";
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert("Failed to copy to clipboard.");
    });
}

// --- 3. BOM Table Search/Filter ---
const searchInput = document.getElementById('searchInput');
const bomTable = document.getElementById('bomTable');
const tableRows = bomTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

searchInput.addEventListener('keyup', function() {
    const filter = searchInput.value.toLowerCase();

    for (let i = 0; i < tableRows.length; i++) {
        // Get all text content from the row
        const rowText = tableRows[i].textContent.toLowerCase();
        
        if (rowText.includes(filter)) {
            tableRows[i].style.display = "";
        } else {
            tableRows[i].style.display = "none";
        }
    }
});