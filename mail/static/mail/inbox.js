document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  // Attach event listener to #emails-view
  emailClickHandler();
  // Attach the form submission event listener
  retrieve_form_data();
});

// Creates a div to show an email's content (from inbox, sent or archive)
function openedEmailDiv(emailView, email, mailbox, email_id) {
  const emailDiv = document.createElement('div');
  // Add relevant classlists
  emailDiv.classList.add('opened-email', 'email-read');

  if (mailbox === 'inbox' || mailbox === 'archive') {
    emailDiv.innerHTML = `
        <strong>From:</strong> ${email.sender}<br>
        <strong>To:</strong> ${email.recipients}<br>
        <strong>Subject:</strong> ${email.subject}<br>
        <strong>Body:</strong> ${email.body}<br>
        <strong>Timestamp:</strong> ${email.timestamp}<br>
      `;
    emailView.appendChild(emailDiv);

    if (mailbox == 'inbox') {
      createReplyButton(email_id, emailDiv);
      createArchiveButton(email_id, emailDiv);
      createMarkAsUnreadButton(email_id, emailDiv);
    } else if (mailbox == 'archive') {
      createUnArchiveButton(email_id, emailDiv);
    }
  } else {
    emailDiv.innerHTML = `
        <strong>To:</strong> ${email.recipients}<br>
        <strong>From:</strong> ${email.sender}<br>
        <strong>Subject:</strong> ${email.subject}<br>
        <strong>Body:</strong> ${email.body}<br>
        <strong>Timestamp:</strong> ${email.timestamp}<br>
      `;
  emailView.appendChild(emailDiv);
  }
}

// Creates a div that does not show an email's content
function unOpenedEmailDiv(email, mailbox, emailsView) {
  const emailDiv = document.createElement('div');

  // Add different classes to differentiate between read and unread emails
  if (email.read) {
    emailDiv.classList.add('one-email', 'email-read');
  } else {
    emailDiv.classList.add('one-email', 'email-unread');
  }

  if (mailbox === 'inbox' || mailbox === 'archive') {
    emailDiv.innerHTML = `
            <strong>From:</strong> ${email.sender}<br>
            <strong>Subject:</strong> ${email.subject}<br>
            <strong>Timestamp:</strong> ${email.timestamp}<br>
          `;
    emailDiv.dataset.emailId = email.id; // A data attribute to help make a div clickable
    emailsView.appendChild(emailDiv);

  } else {
    emailDiv.innerHTML = `
            <strong>To:</strong> ${email.recipients}<br>
            <strong>Subject:</strong> ${email.subject}<br>
            <strong>Timestamp:</strong> ${email.timestamp}<br>
          `;
    emailDiv.dataset.emailId = email.id; // A data attribute to help make a div clickable
    emailsView.appendChild(emailDiv);
  } 
}

// Create an event listener for unOpenedEmailDiv
function emailClickHandler() {
  const emailsView = document.querySelector('#emails-view');

  emailsView.addEventListener('click', function (event) {
    const emailDiv = event.target.closest('.one-email'); // Find the clicked email

    if (emailDiv) {
      const emailId = emailDiv.dataset.emailId; // Retrieve email's id

      if (emailId) {
        // Determine which mailbox is active and call the correct function
        const activeMailbox = document.querySelector('#emails-view h3').textContent.toLowerCase();

        if (activeMailbox === 'archive') {
          open_email('archive', emailId)
        } else if (activeMailbox.startsWith('inbox')) {
          open_email('inbox', emailId); // Call open_email with the ID
        } else {
          open_email('sent', emailId)
        }

        // Show #email-view and hide #emails-view.
        showEmailView();
      }
    }
  });
}

// Creates the reply button
function createReplyButton(email_id, emailDiv) {
  const replyButton = document.createElement('button');
  // Add the necessary classes and set button text
  replyButton.classList.add('btn', 'btn-primary');
  replyButton.textContent = 'Reply';

  // Set a data attribute to store the email ID and append it to the div
  replyButton.dataset.emailId = email_id;
  emailDiv.appendChild(replyButton);
  // Add event listener to the reply button
  replyButton.addEventListener('click', async function () {
    // Call function to reply email
    await reply_email(email_id);

  });
}

// Creates the archive button
function createArchiveButton(email_id, emailDiv) {
  const archiveButton = document.createElement('button');
  // Add the necessary classes and set button text
  archiveButton.classList.add('btn', 'btn-primary');
  archiveButton.textContent = 'Archive';

  // Set a data attribute to store the email ID and append it to the div
  archiveButton.dataset.emailId = email_id;
  emailDiv.appendChild(archiveButton);

  // Add event listener to the archive button
  archiveButton.addEventListener('click', async function () {
    // Call function to archive email
    await archive_email(email_id);

    // Load the user's inbox
    load_mailbox('inbox');
  });
}

// Creates the mark as unread button
function createMarkAsUnreadButton(email_id, emailDiv) {
  const markAsUnreadButton = document.createElement('button');
  // Add the necessary classes and set button text
  markAsUnreadButton.classList.add('btn', 'btn-primary');
  markAsUnreadButton.textContent = 'Mark as Unread';

  // Set a data attribute to store the email ID and append it to the div
  markAsUnreadButton.dataset.emailId = email_id;
  emailDiv.appendChild(markAsUnreadButton);

  // Add event listener to the archive button
  markAsUnreadButton.addEventListener('click', async function () {
    await mark_as_unread(email_id); // Mark email as unread
    // Load the user's inbox
    load_mailbox('inbox');

    // Add class to show mail is unread
    emailDiv.classList.add('email-unread');
  });
}

// Creates the un archive button
function createUnArchiveButton(email_id, emailDiv) {
  const unArchiveButton = document.createElement('button');
  // Add the necessary classes and set button text
  unArchiveButton.classList.add('btn', 'btn-primary');
  unArchiveButton.textContent = 'Unarchive';

  // Set a data attribute to store the email ID and append it to the div
  unArchiveButton.dataset.emailId = email_id;
  emailDiv.appendChild(unArchiveButton);

  // Add event listener to the unarchive button
  unArchiveButton.addEventListener('click', async function () {
    // Call function to archive email
    await unarchive_email(email_id);

    // Load the user's inbox
    load_mailbox('inbox');
  });
}

// Toggles from all to one email view
function showEmailView() {
  // Show #email-view and hide #emails-view.
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
}

// Renders the compose email page
function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Loads mailbox and appends unread emails count if mailbox === inbox
async function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const header = document.querySelector('#emails-view h3');
  
  if (header && header.textContent.toLowerCase() === 'inbox') {
    header.textContent = '';

    // The count of unread emails
    const unreadEmails = await countUnreadEmails(mailbox);
    //console.log(unreadEmails);

    // Update the h3 element to show number of unread emails
    header.textContent = `Inbox (${unreadEmails})`;   
  }

  // Get the mailbox(inbox/sent/archive) and display them
  retrieve_mailbox(mailbox)
}

// Counts the number of unread emails
async function countUnreadEmails(mailbox) {
  try {
    const response = await fetch(`/emails/${mailbox}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const emails = await response.json();

    // Ensure emails is an array before filtering
    if (!Array.isArray(emails)) {
      console.error("Invalid email data:", emails);
      return 0;
    }

    const unreadCount = emails.filter(email => !email.read).length;
    //console.log(`Unread emails in ${mailbox}:`, unreadCount); // Debugging log

    return unreadCount;
  } catch (error) {
    console.error("Error fetching unread email count:", error);
    return 0; // Always return a number
  }
}

// Retrieves form data ready to post to the database
async function retrieve_form_data() {
  const form_data = document.getElementById('compose-form');

  form_data.addEventListener('submit', async function(event) {
    event.preventDefault();

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Log to the console for debugging
    //console.log('Recipients:', recipients);
    //console.log('Subject:', subject);
    //console.log('Body:', body);

    try{
      // Post the email
      const response = await fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body,
        }),
      });

      if (!response.ok) { 
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);

      load_mailbox('sent');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });
}

// Retrieves all emails whether inbox, sent, or archived
function retrieve_mailbox(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print the emails for debugging
    //console.log(emails);

    // Display the emails
    const emailsView = document.querySelector('#emails-view');
    
    if (emails && emails.length > 0) {
      emails.forEach(email => {
        unOpenedEmailDiv(email, mailbox, emailsView)        
      });
    } else {
      const noEmailsDiv = document.createElement('div');
      noEmailsDiv.innerHTML = '<p>No emails found</p>';
      emailsView.appendChild(noEmailsDiv);
    }
  });
}

// Opens a single email
function open_email(mailbox, email_id) {
  //  Mark the email as read.
  mark_as_read(email_id);  

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    
    // Display the email
    const emailView = document.querySelector('#email-view');
    emailView.innerHTML = ''; // Ensures previous email is cleared before openning another one

    // Show the mailbox name (inbox, sent, archive)
    emailView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`; 

    if (email) {
      openedEmailDiv(emailView, email, mailbox, email_id);
    }    
  });
}

// Marks an email as read
function mark_as_read(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

// Marks an email as unread
async function mark_as_unread(email_id) { // Make the function async
  await fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: false
    })
  })
}

// Marks an email as archived
async function archive_email(email_id) {
  await fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
}

// Un archives an email
async function unarchive_email(email_id) {
  await fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
}

// Render the compose email page for replying
async function reply_email(email_id) {
  // Fetch the original email details
  const response = await fetch(`/emails/${email_id}`);
  const email = await response.json();

  // Show the compose view
  compose_email();

  // Pre-fill the recipients field
  document.querySelector('#compose-recipients').value = email.sender;

  // Pre-fill the subject line
  let subject = email.subject;
  if (!subject.startsWith('Re: ')) {
    subject = 'Re: ' + subject;
  }
  document.querySelector('#compose-subject').value = subject;

  // Pre-fill the body
  const body = `\n\nOn ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
  document.querySelector('#compose-body').value = body;  
}