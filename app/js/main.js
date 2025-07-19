// Main application scripts

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = form.querySelector('#email');
    const value = email ? email.value.trim() : '';

    if (!value) {
      alert('Please enter a valid email address.');
      return;
    }

    // Placeholder for server call
    console.log('Submitting contact form:', value);
    alert('Thanks! Check your inbox for next steps.');
    form.reset();
  });
});
