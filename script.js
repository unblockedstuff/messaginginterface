document.addEventListener('DOMContentLoaded', () => {
    const messageArea = document.querySelector('.message-area');
    const messageInput = document.querySelector('.message-input');
    const sendBtn = document.querySelector('.send-btn');
    const attachmentBtn = document.querySelector('.attachment-btn');
    const fileInput = document.getElementById('file-input');
    // const themeToggle = document.getElementById('theme-toggle'); // OLD - REMOVED from header

    // Left Sidebar elements
    const contactListUL = document.getElementById('contact-list'); // The UL for contacts
    const leftSidebarFooter = document.querySelector('.left-sidebar .sidebar-footer');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsView = document.getElementById('settings-view');
    const backToContactsBtn = document.getElementById('back-to-contacts-btn');
    const themeToggleSettings = document.getElementById('theme-toggle-settings'); // New toggle in settings

    // Chat Header elements
    const chatHeaderMain = document.getElementById('chat-header-main'); 

    // Right Sidebar (Contact Details Panel) elements
    const contactDetailsPanel = document.getElementById('contact-details-panel');
    const contactDetailsAvatar = document.getElementById('contact-details-avatar');
    const contactDetailsUsernameHeader = document.getElementById('contact-details-username'); // Header in right sidebar
    const contactNameDisplay = document.getElementById('contact-name-display'); // Username below avatar

    let typingIndicatorElement = null; // To store the typing indicator

    // --- START: Theme Toggle Functionality ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeToggleSettings) themeToggleSettings.checked = true;
        } else {
            document.body.classList.remove('dark-theme');
            if (themeToggleSettings) themeToggleSettings.checked = false;
        }
    }

    function handleThemeToggle() { // Renamed from toggleTheme
        if (themeToggleSettings && themeToggleSettings.checked) {
            localStorage.setItem('theme', 'dark');
            applyTheme('dark');
        } else {
            localStorage.setItem('theme', 'light');
            applyTheme('light');
        }
    }

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
    applyTheme(savedTheme); // This will also set the checkbox state

    if (themeToggleSettings) {
        themeToggleSettings.addEventListener('change', handleThemeToggle);
    }
    // --- END: Theme Toggle Functionality ---

    // --- START: Settings View Toggle ---
    function showSettingsView() {
        if (contactListUL) contactListUL.style.display = 'none';
        if (leftSidebarFooter) leftSidebarFooter.style.display = 'none';
        if (settingsView) settingsView.style.display = 'flex'; // .settings-view is flex column
    }

    function hideSettingsView() {
        if (settingsView) settingsView.style.display = 'none';
        if (contactListUL) contactListUL.style.display = ''; // Revert to default (block/flex)
        if (leftSidebarFooter) leftSidebarFooter.style.display = ''; // Revert to default
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettingsView);
    }
    if (backToContactsBtn) {
        backToContactsBtn.addEventListener('click', hideSettingsView);
    }
    // --- END: Settings View Toggle ---


    // --- START: Typing Indicator Functionality ---
    function createTypingIndicator() {
        if (typingIndicatorElement) return; // Already created

        typingIndicatorElement = document.createElement('div');
        typingIndicatorElement.classList.add('typing-indicator');
        typingIndicatorElement.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
    }

    function showTypingIndicator() {
        if (!typingIndicatorElement) {
            createTypingIndicator();
        }
        if (!messageArea.contains(typingIndicatorElement)) {
             messageArea.appendChild(typingIndicatorElement);
        }
        // Add class to trigger fade-in animation (already defined in CSS)
        setTimeout(() => typingIndicatorElement.classList.add('visible'), 10); 
        messageArea.scrollTop = messageArea.scrollHeight; // Scroll to show it
    }

    function hideTypingIndicator() {
        if (typingIndicatorElement && messageArea.contains(typingIndicatorElement)) {
            typingIndicatorElement.classList.remove('visible');
            // Optionally remove after fade out, or just keep it hidden
            // For now, just hide. If performance becomes an issue with many appends/removals, reconsider.
            // setTimeout(() => {
            //     if(typingIndicatorElement && typingIndicatorElement.parentNode === messageArea) {
            //          messageArea.removeChild(typingIndicatorElement);
            //     }
            // }, 300); // Match CSS transition time
        }
    }
    // --- END: Typing Indicator Functionality ---

    // --- START: Left Sidebar Functionality ---
    function selectContact(contactElement) {
        const contactId = contactElement.dataset.contactId;
        const contactName = contactElement.dataset.contactName;
        const contactAvatar = contactElement.dataset.contactAvatar;

        // 0. Remove 'active' class from previously active contact
        const currentlyActive = contactList.querySelector('li.active');
        if (currentlyActive) {
            currentlyActive.classList.remove('active');
        }
        // 1. Add 'active' class to current contact
        contactElement.classList.add('active');

        // 2. Update Main Chat Header
        if (chatHeaderMain) {
            const chatHeaderH1 = chatHeaderMain.querySelector('h1');
            if (chatHeaderH1) chatHeaderH1.textContent = `Chat with ${contactName}`;
        }

        // 3. Update Right Sidebar (Contact Details Panel)
        if (contactDetailsPanel) {
            contactDetailsAvatar.src = contactAvatar;
            contactDetailsAvatar.alt = `${contactName}'s profile picture`;
            contactDetailsUsernameHeader.textContent = contactName; // Update header in right sidebar
            contactNameDisplay.textContent = contactName; // Update name below avatar
            // TODO: Clear/update media, files, links sections (for now they are static placeholders)
        }

        // 4. Clear current messages and show a placeholder
        messageArea.innerHTML = ''; // Clear existing messages
        const welcomeMessage = createMessageElement(`Started chat with ${contactName}. Send a message!`, 'receiver');
        // Temporarily disable animation for this initial message to prevent it from looking like a new incoming one
        welcomeMessage.style.animation = 'none'; 
        welcomeMessage.style.opacity = '1';
        messageArea.appendChild(welcomeMessage);
        messageArea.scrollTop = messageArea.scrollHeight;

        // Hide typing indicator if it was visible for a previous chat
        hideTypingIndicator(); 
    }

    if (contactList) {
        contactList.addEventListener('click', (event) => {
            const clickedLi = event.target.closest('li');
            if (clickedLi && clickedLi.dataset.contactId) { // Ensure it's a contact item
                selectContact(clickedLi);
            }
            // Settings button click will be handled in step 23
            // if (clickedLi && clickedLi.id === 'settings-btn') { ... } 
        });
    }
    // --- END: Left Sidebar Functionality ---

    // --- START: Message Sending Functionality ---
    function createMessageElement(text, senderType) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', senderType);

        // Add animation class based on senderType
        if (senderType === 'sender') {
            messageDiv.classList.add('animate-slide-in-right');
        } else {
            messageDiv.classList.add('animate-slide-in-left');
        }

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
        editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`;
        editBtn.setAttribute('aria-label', 'Edit message');
        editBtn.onclick = () => enableEditMode(messageDiv, p); // Hook up edit function
        actionsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
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
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            receiveMessage("Thanks for your message! I'll process this shortly.");
        }, 2000); // Increased delay to show typing indicator
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
