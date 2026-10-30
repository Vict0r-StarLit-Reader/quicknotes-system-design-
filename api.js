// (Keep previous GET code above, and append below)

const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");

noteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || title.length > 100) {
        alert("Title is required and must be under 100 characters.");
        return;
    }

    submitBtn.disabled = true;

    try {
        const newNote = await request(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ title, body, userId: 1 })
        });

        const li = document.createElement("li");
        li.textContent = newNote.title;
        notesList.prepend(li);

        statusEl.textContent = `Note created (status 201, id ${newNote.id}).`;
        noteForm.reset();
    } catch (error) {
        statusEl.textContent = "Failed to create note.";
    } finally {
        submitBtn.disabled = false;
    }
});