// Example: smooth scroll or navbar shrink
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('shrink');
  } else {
    navbar.classList.remove('shrink');
  }
});
const toggle = document.querySelector('.menu-toggle');
const navbar = document.querySelector('.navbar');

toggle.addEventListener('click', () => {
  navbar.classList.toggle('active');
});
function handleSubmit(event) {
  event.preventDefault();
  alert("Thank you! Your message has been sent.");
  document.querySelector('.contact-form').reset();
}

// ENROLL & LOGIN LOGIC

document.addEventListener('DOMContentLoaded', function() {
  // Modal Elements
  const enrollBtn = document.getElementById('enrollBtn');
  const loginBtn = document.getElementById('loginBtn');
  const enrollModal = document.getElementById('enrollModal');
  const loginModal = document.getElementById('loginModal');
  const closeEnroll = document.getElementById('closeEnroll');
  const closeLogin = document.getElementById('closeLogin');
  const submitEnroll = document.getElementById('submitEnroll');
  const submitLogin = document.getElementById('submitLogin');

  // Show/Hide Modals
  if(enrollBtn) enrollBtn.onclick = () => enrollModal.style.display = 'flex';
  if(loginBtn) loginBtn.onclick = () => loginModal.style.display = 'flex';
  if(closeEnroll) closeEnroll.onclick = () => enrollModal.style.display = 'none';
  if(closeLogin) closeLogin.onclick = () => loginModal.style.display = 'none';
  window.onclick = function(event) {
    if (event.target === enrollModal) enrollModal.style.display = 'none';
    if (event.target === loginModal) loginModal.style.display = 'none';
  };

  // Enroll Submit
  if(submitEnroll) submitEnroll.onclick = function() {
    const name = document.getElementById('enrollName').value.trim();
    const email = document.getElementById('enrollEmail').value.trim();
    const password = document.getElementById('enrollPassword').value.trim();
    if (!name || !email || !password) {
      alert('Please enter your name, email, and password.');
      return;
    }
    // Save user data per email
    localStorage.setItem('enrolledUser', JSON.stringify({ name, email, password, date: new Date().toLocaleString() }));
    localStorage.setItem('profileData_' + email, JSON.stringify({ name, email }));
    sendToEmail('Enroll', { name, email, password });
    alert('Enrollment successful! Now please login.');
    enrollModal.style.display = 'none';
  };

  // Login Submit
  if(submitLogin) submitLogin.onclick = function() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const enrolled = JSON.parse(localStorage.getItem('enrolledUser') || '{}');
    if (!email || !password || !enrolled.email || email !== enrolled.email || password !== enrolled.password) {
      alert('Please enter correct email and password, or enroll first.');
      return;
    }
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUser', JSON.stringify(enrolled));
    // Set current profile data for this email
    let profileData = localStorage.getItem('profileData_' + email);
    if (!profileData) {
      // New user, create fresh profile
      localStorage.setItem('profileData_' + email, JSON.stringify({ name: enrolled.name, email: enrolled.email }));
    }
    // Set current admission data for this email
    let admissionData = localStorage.getItem('admission_' + email);
    if (admissionData) {
      localStorage.setItem('admissionData', admissionData);
    } else {
      localStorage.removeItem('admissionData');
    }
    // Set current avatar for this email
    let avatar = localStorage.getItem('avatar_' + email);
    if (avatar) {
      localStorage.setItem('profileAvatar', avatar);
    } else {
      localStorage.removeItem('profileAvatar');
    }
    sendToEmail('Login', { email, password });
    alert('Login successful! Welcome, ' + enrolled.name);
    loginModal.style.display = 'none';
    window.location.href = 'profile.html';
  };

  // Show user info if logged in
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  if(user && user.name && document.querySelector('.auth-buttons')) {
    document.querySelector('.auth-buttons').innerHTML =
      `<span style="color:#fff; margin-right:1rem;">Welcome, ${user.name}</span><button id="logoutBtn" class="btn">Logout</button>`;
    document.getElementById('logoutBtn').onclick = function() {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUser');
      location.reload();
    };
  }

  // Profile picture upload/change logic
  const profilePicInput = document.getElementById('profilePicInput');
  const profileAvatar = document.getElementById('profileAvatar');
  // Use global user variable if already declared, else declare here
  var currentUser = window.user || JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  if (currentUser.email) {
    const savedAvatar = localStorage.getItem('avatar_' + currentUser.email);
    if (savedAvatar && profileAvatar) {
      profileAvatar.src = savedAvatar;
      localStorage.setItem('profileAvatar', savedAvatar);
    }
  }
  if(profilePicInput && profileAvatar) {
    profilePicInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          profileAvatar.src = evt.target.result;
          if (currentUser.email) {
            localStorage.setItem('avatar_' + currentUser.email, evt.target.result);
            localStorage.setItem('profileAvatar', evt.target.result);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Admission Form Logic for contact.html
  if (window.location.pathname.includes('contact.html')) {
    window.handleEnrollSubmit = function(event) {
      event.preventDefault();
      const form = document.getElementById('enrollForm');
      const formData = new FormData(form);
      const admissionData = {};
      for (const [key, value] of formData.entries()) {
        admissionData[key] = value;
      }
      // Save admission data per user
      if (admissionData.email) {
        localStorage.setItem('admission_' + admissionData.email, JSON.stringify(admissionData));
        // If this is the logged in user, update current admissionData
        const loggedIn = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
        if (loggedIn.email === admissionData.email) {
          localStorage.setItem('admissionData', JSON.stringify(admissionData));
        }
      }
      form.reset();
      document.getElementById('enroll-success').style.display = 'block';
      setTimeout(function() {
        document.getElementById('enroll-success').style.display = 'none';
      }, 5000);
      if (localStorage.getItem('isLoggedIn')) {
        window.location.href = 'profile.html';
      }
      return false;
    }
  }

  // Profile icon/avatar logic for all pages
  function updateProfileIcon() {
    var profileIcon = document.getElementById('profileButton');
    if (profileIcon) {
      var savedAvatar = localStorage.getItem('profileAvatar');
      profileIcon.src = savedAvatar ? savedAvatar : 'images/profile-icon.svg';
    }
  }
  updateProfileIcon();

  // Profile dropdown logic for all pages
  (function() {
    const profileButton = document.getElementById('profileButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const logoutProfile = document.getElementById('logoutProfile');
    if (profileButton && dropdownMenu) {
      profileButton.onclick = function(e) {
        e.stopPropagation();
        dropdownMenu.style.display = (dropdownMenu.style.display === 'block') ? 'none' : 'block';
      };
      document.addEventListener('click', function(e) {
        if (!dropdownMenu.contains(e.target) && e.target !== profileButton) {
          dropdownMenu.style.display = 'none';
        }
      });
    }
    if (logoutProfile) {
      logoutProfile.onclick = function(e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
      };
    }
  })();
});

// Send data to email using EmailJS (requires EmailJS SDK and account)
function sendToEmail(type, data) {
  // You must include EmailJS SDK in your HTML for this to work
  // Example: <script src="https://cdn.emailjs.com/dist/email.min.js"></script>
  if (window.emailjs) {
    emailjs.init('YOUR_USER_ID'); // Replace with your EmailJS user ID
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
      to_email: 'baigribal@gmail.com',
      subject: type + ' Data',
      message: JSON.stringify(data, null, 2)
    }).then(function() {
      console.log('Email sent successfully!');
    }, function(error) {
      console.error('Failed to send email:', error);
    });
  } else {
    console.warn('EmailJS SDK not loaded. Data not sent.');
  }
}

// Admission Form Logic for contact.html
if (window.location.pathname.includes('contact.html')) {
  window.handleEnrollSubmit = function(event) {
    event.preventDefault();
    const form = document.getElementById('enrollForm');
    const formData = new FormData(form);
    const admissionData = {};
    for (const [key, value] of formData.entries()) {
      admissionData[key] = value;
    }
    // Save admission data per user
    if (admissionData.email) {
      localStorage.setItem('admission_' + admissionData.email, JSON.stringify(admissionData));
      // If this is the logged in user, update current admissionData
      const loggedIn = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      if (loggedIn.email === admissionData.email) {
        localStorage.setItem('admissionData', JSON.stringify(admissionData));
      }
    }
    form.reset();
    document.getElementById('enroll-success').style.display = 'block';
    setTimeout(function() {
      document.getElementById('enroll-success').style.display = 'none';
    }, 5000);
    if (localStorage.getItem('isLoggedIn')) {
      window.location.href = 'profile.html';
    }
    return false;
  }
}

// Profile icon/avatar logic for all pages
function updateProfileIcon() {
  var profileIcon = document.getElementById('profileButton');
  if (profileIcon) {
    var savedAvatar = localStorage.getItem('profileAvatar');
    profileIcon.src = savedAvatar ? savedAvatar : 'images/profile-icon.svg';
  }
}
updateProfileIcon();

// Profile dropdown logic for all pages
(function() {
  const profileButton = document.getElementById('profileButton');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const logoutProfile = document.getElementById('logoutProfile');
  if (profileButton && dropdownMenu) {
    profileButton.onclick = function(e) {
      e.stopPropagation();
      dropdownMenu.style.display = (dropdownMenu.style.display === 'block') ? 'none' : 'block';
    };
    document.addEventListener('click', function(e) {
      if (!dropdownMenu.contains(e.target) && e.target !== profileButton) {
        dropdownMenu.style.display = 'none';
      }
    });
  }
  if (logoutProfile) {
    logoutProfile.onclick = function(e) {
      e.preventDefault();
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUser');
      window.location.href = 'index.html';
    };
  }
})();
