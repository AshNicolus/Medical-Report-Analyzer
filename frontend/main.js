document.getElementById('upload-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/analyze_report', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    document.getElementById('results').innerText = JSON.stringify(result, null, 2);
});
