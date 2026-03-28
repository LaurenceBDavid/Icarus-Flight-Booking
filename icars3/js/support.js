// Customer Support Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = contactForm.querySelector('input[placeholder*="name"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const subject = contactForm.querySelector('input[placeholder*="Subject"]').value;
            const message = contactForm.querySelector('textarea').value;
            
            // Validation
            if (!name || !email || !subject || !message) {
                alert('All fields are required');
                return;
            }
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Disable submit button
            const submitBtn = contactForm.querySelector('.btn-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            try {
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('subject', subject);
                formData.append('message', message);
                
                const response = await fetch('submit_ticket.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(`Support ticket submitted successfully!\nYour ticket number is: ${result.data.ticket_number}\n\nPlease save this number for future reference.`);
                    contactForm.reset();
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
            }
        });
    }
    
    // Ticket Tracker
    const ticketForm = document.querySelector('.ticket-form');
    if (ticketForm) {
        ticketForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const ticketNumber = ticketForm.querySelector('input').value;
            
            if (!ticketNumber) {
                alert('Please enter a ticket number');
                return;
            }
            
            try {
                const response = await fetch(`get_ticket.php?ticket=${ticketNumber}`);
                const result = await response.json();
                
                if (result.success) {
                    displayTicketInfo(result.data);
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }
});

function displayTicketInfo(ticket) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 500px;
        width: 90%;
    `;
    
    const statusColors = {
        'open': '#e74c3c',
        'in_progress': '#f39c12',
        'resolved': '#2ecc71',
        'closed': '#95a5a6'
    };
    
    modal.innerHTML = `
        <h2 style="color: #d4af37; margin-bottom: 20px;">Ticket Information</h2>
        <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Status:</strong> <span style="color: ${statusColors[ticket.status] || '#333'}; font-weight: 600;">${ticket.status.replace('_', ' ').toUpperCase()}</span></p>
        <p><strong>Created:</strong> ${new Date(ticket.created_at).toLocaleDateString()}</p>
        <p style="margin-top: 15px;"><strong>Message:</strong><br>${ticket.message}</p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 20px;
            padding: 10px 20px;
            background: #d4af37;
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-weight: 600;
        ">Close</button>
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
    `;
    backdrop.onclick = function() {
        modal.remove();
        backdrop.remove();
    };
    document.body.appendChild(backdrop);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}













