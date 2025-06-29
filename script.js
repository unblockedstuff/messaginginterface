document.addEventListener('DOMContentLoaded', () => {
    const messageArea = document.querySelector('.message-area');
    const messageInput = document.querySelector('.message-input');
    const sendBtn = document.querySelector('.send-btn');
    const attachmentBtn = document.querySelector('.attachment-btn');
    const fileInput = document.getElementById('file-input');

    // --- START: Message Sending Functionality ---
    function createMessageElement(text, senderType) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', senderType);

        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);

        const timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageDiv.appendChild(timestamp);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('message-actions');

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.innerHTML = '✏️';
        editBtn.setAttribute('aria-label', 'Edit message');
        editBtn.onclick = () => enableEditMode(messageDiv, p); // Hook up edit function
        actionsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.setAttribute('aria-label', 'Delete message');
        deleteBtn.onclick = () => deleteMessage(messageDiv); // Hook up delete function
        actionsDiv.appendChild(deleteBtn);
        
        messageDiv.appendChild(actionsDiv);

        return messageDiv;
    }

    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText === '') return;

        const messageElement = createMessageElement(messageText, 'sender');
        messageArea.appendChild(messageElement);

        // Scroll to the bottom
        messageArea.scrollTop = messageArea.scrollHeight;

        messageInput.value = '';
        messageInput.style.height = 'auto'; // Reset height after sending
        messageInput.focus();

        // Simulate reply after a short delay
        setTimeout(() => receiveMessage("Thanks for your message! I'll process this shortly."), 1200);
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent new line on Enter
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    });

    // --- END: Message Sending Functionality ---

    function receiveMessage(text) {
        const messageElement = createMessageElement(text, 'receiver');
        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    }

    // --- START: Attachment Functionality ---
    attachmentBtn.addEventListener('click', () => {
        fileInput.click(); // Trigger the hidden file input
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // Send a message indicating the attached file's name
            // We are not actually uploading the file, just acknowledging its selection.
            const attachmentMessageText = `📎 Attached: ${file.name}`;
            
            const messageElement = createMessageElement(attachmentMessageText, 'sender');
            messageArea.appendChild(messageElement);
            messageArea.scrollTop = messageArea.scrollHeight;
            
            // Clear the file input value to allow selecting the same file again if needed
            fileInput.value = ''; 
        }
    });
    // --- END: Attachment Functionality ---
    
    // --- START: Edit/Delete Functionality ---
    function deleteMessage(messageDiv) {
       // Add a class to trigger animation
       messageDiv.classList.add('message-deleting');
       // Remove the element after animation completes
       messageDiv.addEventListener('animationend', () => {
           messageDiv.remove();
       });
    }

    function enableEditMode(messageDiv, pElement) {
        const currentText = pElement.textContent;
        
        // Hide original paragraph and message actions
        pElement.style.display = 'none';
        const messageActions = messageDiv.querySelector('.message-actions');
        if (messageActions) messageActions.style.display = 'none'; // Hide original actions

        // Create input field for editing
        const editInput = document.createElement('textarea');
        editInput.classList.add('edit-input');
        editInput.value = currentText;
        editInput.setAttribute('aria-label', 'Edit message content');
        // Auto-resize textarea
        editInput.addEventListener('input', () => {
            editInput.style.height = 'auto';
            editInput.style.height = (editInput.scrollHeight) + 'px';
        });
        // Insert input before the original paragraph (which is hidden)
        messageDiv.insertBefore(editInput, pElement);
        setTimeout(() => { // Allow textarea to be added to DOM then set height
             editInput.style.height = 'auto'; editInput.style.height = (editInput.scrollHeight) + 'px'; 
             editInput.focus();
             editInput.select();
        },0);


        // Create Save and Cancel buttons
        const editActionsDiv = document.createElement('div');
        editActionsDiv.classList.add('edit-actions');

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.classList.add('save-edit-btn');
        saveBtn.setAttribute('aria-label', 'Save edited message');
        saveBtn.onclick = () => saveEdit(messageDiv, pElement, editInput, editActionsDiv);
        editActionsDiv.appendChild(saveBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.classList.add('cancel-edit-btn');
        cancelBtn.setAttribute('aria-label', 'Cancel editing message');
        cancelBtn.onclick = () => cancelEdit(messageDiv, pElement, editInput, editActionsDiv);
        editActionsDiv.appendChild(cancelBtn);

        messageDiv.appendChild(editActionsDiv); // Append new actions div

        // Handle Enter/Escape keys for save/cancel
        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveEdit(messageDiv, pElement, editInput, editActionsDiv);
            } else if (e.key === 'Escape') {
                cancelEdit(messageDiv, pElement, editInput, editActionsDiv);
            }
        });
    }

    function saveEdit(messageDiv, pElement, editInput, editActionsDiv) {
        const newText = editInput.value.trim();
        if (newText === '') { // Prevent saving empty messages, perhaps delete instead or show error
            alert("Message cannot be empty."); // Simple alert, could be a more subtle UI feedback
            return;
        }
        pElement.textContent = newText;
        
        // Restore original display
        pElement.style.display = '';
        editInput.remove();
        editActionsDiv.remove();

        const messageActions = messageDiv.querySelector('.message-actions');
        if (messageActions) messageActions.style.display = ''; // Show original actions
        
        // Optional: Add a small visual cue that message was edited, e.g., "(edited)" next to timestamp
        let timestamp = messageDiv.querySelector('.timestamp');
        if (timestamp && !timestamp.textContent.includes('(edited)')) {
            timestamp.textContent += ' (edited)';
        }
    }

    function cancelEdit(messageDiv, pElement, editInput, editActionsDiv) {
        // Restore original display (no changes made to pElement.textContent)
        pElement.style.display = '';
        editInput.remove();
        editActionsDiv.remove();

        const messageActions = messageDiv.querySelector('.message-actions');
        if (messageActions) messageActions.style.display = ''; // Show original actions
    }
    // --- END: Edit/Delete Functionality ---

    // --- Add event listeners to existing static messages for demo ---
    // This is just for the initial HTML messages. Dynamic messages will have listeners added at creation.
    document.querySelectorAll('.message .edit-btn').forEach(btn => {
        btn.onclick = () => {
            const messageDiv = btn.closest('.message');
            const pElement = messageDiv.querySelector('p');
            // enableEditMode(messageDiv, pElement); // To be implemented
            console.log("Attempting to edit: ", pElement.textContent);
        };
    });

    document.querySelectorAll('.message .delete-btn').forEach(btn => {
        btn.onclick = () => {
            const messageDiv = btn.closest('.message');
            // deleteMessage(messageDiv); // To be implemented
             console.log("Attempting to delete: ", messageDiv.querySelector('p').textContent);
             messageDiv.remove(); // Basic static deletion for now
        };
    });

});
