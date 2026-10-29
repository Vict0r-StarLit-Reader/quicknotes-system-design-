const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const notesList = document.getElementById("notes-list");

async function request(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
}

loadBtn.addEventListener("click", async () => {
    loadBtn.disabled = true;
    statusEl.textContent = "Loading notes...";
    notesList.innerHTML = "";

    try {
        const notes = await request(`${API_URL}?_limit=10`);
        notes.forEach(note => {
            const li = document.createElement("li");
            li.textContent = note.title;
            notesList.appendChild(li);
        });
        statusEl.textContent = "Loaded 10 notes from the server.";
    } catch (error) {
        statusEl.textContent = "Failed to load notes.";
    } finally {
        loadBtn.disabled = false;
    }
});