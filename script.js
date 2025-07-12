document.addEventListener('DOMContentLoaded', () => {
    const loginCard = document.getElementById('loginCard');
    const registrationCard = document.getElementById('registrationCard');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');
    const registrationForm = document.getElementById('registrationForm');
    const dashboardSelection = document.getElementById('dashboardSelection');
    const donorBtn = document.getElementById('donorBtn');
    const receiverBtn = document.getElementById('receiverBtn');
    const donorDashboard = document.getElementById('donorDashboard');
    const receiverDashboard = document.getElementById('receiverDashboard');
    const switchRoleButtons = document.querySelectorAll('#switchRoleBtn');
    const logoutButtons = document.querySelectorAll('.btn-logout');

    // Registration Form specific elements
    const divisionSelect = document.getElementById('division');
    const districtSelect = document.getElementById('district');

    // Donor Dashboard specific elements
    const createPostBtn = document.getElementById('createPostBtn');
    const donationPostForm = document.getElementById('donationPostForm');
    const cancelPostBtn = document.getElementById('cancelPostBtn');
    const donationForm = document.getElementById('donationForm');
    const donorPostsContainer = document.getElementById('donorPostsContainer');
    const userBloodType = document.getElementById('userBloodType');
    const userGreeting = document.getElementById('userGreeting');
    const donationCountElement = document.getElementById('donationCount');
    const lastDonationElement = document.getElementById('lastDonation');
    const userLocationElement = document.getElementById('userLocation');

    // Receiver Dashboard specific elements
    const searchDivisionSelect = document.getElementById('searchDivision');
    const searchDistrictSelect = document.getElementById('searchDistrict');
    const donorSearchForm = document.getElementById('donorSearchForm');
    const donorsContainer = document.getElementById('donorsContainer');
    const resultsCountElement = document.getElementById('resultsCount');

    // Chat elements
    const chatContainer = document.getElementById('chatContainer');
    const btnCloseChat = document.querySelector('.btn-close-chat');
    const chatPartnerName = document.getElementById('chatPartnerName');
    const chatMessages = document.getElementById('chatMessages');
    const chatMessageInput = document.getElementById('chatMessageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');

    // --- In-memory Data Store (Simulating Backend) ---
    // In a real application, this would be handled by a database
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let donationPosts = JSON.parse(localStorage.getItem('donationPosts')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let chats = JSON.parse(localStorage.getItem('chats')) || {}; // Store chat messages
    let currentChatPartnerId = null;

    // Helper to save data to localStorage
    const saveData = () => {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('donationPosts', JSON.stringify(donationPosts));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('chats', JSON.stringify(chats));
    };

    // --- City Data (Bangladesh Divisions and Districts) ---
    const cities = {
        Dhaka: ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
        Chittagong: ["Bandarban", "Brahmanbaria", "Chandpur", "Chittagong", "Comilla", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati"],
        Rajshahi: ["Bogura", "Joypurhat", "Naogaon", "Natore", "Nawabganj", "Pabna", "Rajshahi", "Sirajganj"],
        Khulna: ["Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
        Barishal: ["Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
        Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
        Rangpur: ["Bogra", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"],
        Mymensingh: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"]
    };

    // --- UI State Management ---
    const showAuthContainer = () => {
        document.getElementById('authContainer').style.display = 'flex';
        dashboardSelection.style.display = 'none';
        donorDashboard.style.display = 'none';
        receiverDashboard.style.display = 'none';
        chatContainer.style.display = 'none';
    };

    const showDashboardSelection = () => {
        document.getElementById('authContainer').style.display = 'none';
        dashboardSelection.style.display = 'flex';
        donorDashboard.style.display = 'none';
        receiverDashboard.style.display = 'none';
        chatContainer.style.display = 'none';
    };

    const showDonorDashboard = () => {
        document.getElementById('authContainer').style.display = 'none';
        dashboardSelection.style.display = 'none';
        donorDashboard.style.display = 'grid';
        receiverDashboard.style.display = 'none';
        chatContainer.style.display = 'none';
        updateDonorDashboard();
    };

    const showReceiverDashboard = () => {
        document.getElementById('authContainer').style.display = 'none';
        dashboardSelection.style.display = 'none';
        donorDashboard.style.display = 'none';
        receiverDashboard.style.display = 'flex';
        chatContainer.style.display = 'none';
        populateSearchFilters();
        searchDonors(); // Initial search
    };

    const showChat = (partnerId) => {
        currentChatPartnerId = partnerId;
        const partner = users.find(u => u.id === partnerId);
        if (partner) {
            chatPartnerName.textContent = partner.fullName || 'Unknown User';
            // Update partner blood badge if needed
        }
        loadChatMessages(partnerId);
        chatContainer.style.display = 'flex';
    };

    const hideChat = () => {
        currentChatPartnerId = null;
        chatContainer.style.display = 'none';
    };

    // --- Authentication Flow ---
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.style.display = 'none';
        registrationCard.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registrationCard.style.display = 'none';
        loginCard.style.display = 'block';
    });

    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const passwordInput = icon.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    });

    // Handle Registration
    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const bloodType = document.getElementById('bloodType').value;
        const division = document.getElementById('division').value;
        const district = document.getElementById('district').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (users.some(user => user.email === email || user.phone === phone)) {
            alert('User with this email or phone already exists!');
            return;
        }

     const newUser = {
    name: fullName,
    phone: phone,
    email: email,
    bloodGroup: bloodType,
    division: division,
    city: district, // frontend 'district' maps to backend 'city'
    dateOfBirth: "2000-01-01", // temporary, backend requires a date
    gender: "Other",           // optional default
    country: "Bangladesh",     // default
    state: division,           // same as division
    postalCode: "0000",        // default
    address: `${district}, ${division}`,
    lastDonationDate: null,
    isAvailable: true
};


        fetch("http://localhost:8080/api/donors", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(newUser)
})
.then(response => {
    if (!response.ok) throw new Error('Failed to register');
    return response.json();
})
.then(data => {
    alert("Registration successful! Please login.");
    registrationForm.reset();
    loginCard.style.display = 'block';
    registrationCard.style.display = 'none';
})
.catch(error => {
    console.error("Registration error:", error);
    alert("Registration failed. Please try again.");
});

        registrationForm.reset();
        loginCard.style.display = 'block';
        registrationCard.style.display = 'none';
    });

    // Handle Login
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const loginEmail = document.getElementById('loginEmail').value;
        const loginPassword = document.getElementById('loginPassword').value;

        const foundUser = users.find(user =>
            (user.email === loginEmail || user.phone === loginEmail) && user.password === loginPassword
        );

        if (foundUser) {
            currentUser = foundUser;
            saveData();
            alert('Login successful!');
            if (currentUser.role) {
                if (currentUser.role === 'donor') {
                    showDonorDashboard();
                } else {
                    showReceiverDashboard();
                }
            } else {
                showDashboardSelection();
            }
        } else {
            alert('Invalid email/phone or password.');
        }
    });

    // Populate Districts based on Division
    divisionSelect.addEventListener('change', () => {
        const selectedDivision = divisionSelect.value;
        districtSelect.innerHTML = '<option value="">Select District</option>'; // Clear existing options
        districtSelect.disabled = true;

        if (selectedDivision && cities[selectedDivision]) {
            cities[selectedDivision].forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });
            districtSelect.disabled = false;
        }
    });

    // Populate search districts
    searchDivisionSelect.addEventListener('change', () => {
        const selectedDivision = searchDivisionSelect.value;
        searchDistrictSelect.innerHTML = '<option value="">Any</option>';
        searchDistrictSelect.disabled = true;

        if (selectedDivision && cities[selectedDivision]) {
            cities[selectedDivision].forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                searchDistrictSelect.appendChild(option);
            });
            searchDistrictSelect.disabled = false;
        }
    });


    // --- Role Selection ---
    donorBtn.addEventListener('click', () => {
        currentUser.role = 'donor';
        saveData();
        showDonorDashboard();
    });

    receiverBtn.addEventListener('click', () => {
        currentUser.role = 'receiver';
        saveData();
        showReceiverDashboard();
    });

    switchRoleButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentUser.role = null; // Reset role
            saveData();
            showDashboardSelection();
        });
    });

    logoutButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentUser = null;
            saveData();
            showAuthContainer();
            // Reset forms and clear dashboards
            document.getElementById('loginForm').reset();
            registrationForm.reset();
            divisionSelect.innerHTML = '<option value="">Select Division</option>';
            districtSelect.innerHTML = '<option value="">Select Division First</option>';
            districtSelect.disabled = true;
            donorPostsContainer.innerHTML = '<p class="text-light-dark">No active donation posts yet. Click "Create Donation Post" to add one.</p>';
            donorsContainer.innerHTML = '<p class="text-light-dark">Use the filters above to find available donors.</p>';
        });
    });

    // --- Donor Dashboard Functions ---
    createPostBtn.addEventListener('click', () => {
        donationPostForm.style.display = 'block';
    });

    cancelPostBtn.addEventListener('click', () => {
        donationPostForm.style.display = 'none';
        donationForm.reset();
        document.getElementById('postDistrict').innerHTML = '<option value="">Select Division First</option>';
        document.getElementById('postDistrict').disabled = true;
    });

    // Populate post district based on post division
    document.getElementById('postDivision').addEventListener('change', (e) => {
        const selectedDivision = e.target.value;
        const postDistrictSelect = document.getElementById('postDistrict');
        postDistrictSelect.innerHTML = '<option value="">Select District</option>';
        postDistrictSelect.disabled = true;

        if (selectedDivision && cities[selectedDivision]) {
            cities[selectedDivision].forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                postDistrictSelect.appendChild(option);
            });
            postDistrictSelect.disabled = false;
        }
    });

donationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const availability = Array.from(document.querySelectorAll('input[name="availability"]:checked')).map(cb => cb.value);
    const postDivision = document.getElementById('postDivision').value;
    const postDistrict = document.getElementById('postDistrict').value;
    const postArea = document.getElementById('postArea').value;
    const contactPreference = document.querySelector('input[name="contact"]:checked').value;
    const donationNotes = document.getElementById('donationNotes').value;

    const newPost = {
        donorId: currentUser.id,
        donorName: currentUser.fullName,
        donorPhone: currentUser.phone,
        donorEmail: currentUser.email,
        donorBloodType: currentUser.bloodType,
        division: postDivision,
        district: postDistrict,
        area: postArea,
        availability: availability,
        contactPreference: contactPreference,
        notes: donationNotes,
        postDate: new Date().toLocaleDateString(),
        status: 'Active'
    };

    fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost)
    })
    .then(res => res.json())
    .then(post => {
        alert("Donation post created successfully!");
        donationForm.reset();
        donationPostForm.style.display = 'none';
        loadDonorPosts(); // fetches posts from backend
    })
    .catch(err => {
        alert("Failed to create post.");
        console.error(err);
    });
});

  function updateDonorDashboard() {
    if (!currentUser || currentUser.role !== 'donor') return;

    userBloodType.textContent = currentUser.bloodType;
    userGreeting.textContent = `Welcome, ${currentUser.fullName}!`;
    userLocationElement.textContent = `${currentUser.district}, ${currentUser.division}`;
    donationCountElement.textContent = currentUser.donationsCount || 0;
    lastDonationElement.textContent = currentUser.lastDonation || "Never";

    loadDonorPosts(); // use new loader
}
function loadDonorPosts() {
    fetch(`http://localhost:8080/api/posts/donor/${currentUser.id}`)
        .then(res => res.json())
        .then(userActivePosts => {
            if (userActivePosts.length === 0) {
                donorPostsContainer.innerHTML = '<p>No active posts.</p>';
                return;
            }

            let tableHTML = `
                <table class="posts-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Availability</th>
                            <th>Contact</th>
                            <th class="d-none d-md-table-cell">Notes</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            userActivePosts.forEach(post => {
                tableHTML += `
                    <tr>
                        <td>${post.postDate}</td>
                        <td>${post.area}, ${post.district}</td>
                        <td>${post.availability.join(', ')}</td>
                        <td>${post.contactPreference === 'liveChat' ? 'Chat' : 'Phone'}</td>
                        <td class="d-none d-md-table-cell">${post.notes || 'N/A'}</td>
                        <td><span class="status-badge active">${post.status}</span></td>
                        <td class="actions-cell">
                            <button class="btn-donation-done" data-post-id="${post.id}" title="Mark as Done"><i class="fas fa-check-circle"></i></button>
                            <button class="btn-delete" data-post-id="${post.id}" title="Delete Post"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    </tr>
                `;
            });

            tableHTML += '</tbody></table>';
            donorPostsContainer.innerHTML = tableHTML;
        });
}



    // --- Receiver Dashboard Functions ---
    function populateSearchFilters() {
        // Division is already populated by HTML, just ensure district is clear
        searchDistrictSelect.innerHTML = '<option value="">Select Division First</option>';
        searchDistrictSelect.disabled = true;
    }

    donorSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        searchDonors();
    });

    function searchDonors() {
        const bloodType = document.getElementById('searchBloodType').value;
        const division = document.getElementById('searchDivision').value;
        const district = document.getElementById('searchDistrict').value;
        const urgency = document.getElementById('searchUrgency').value;

      fetch(`http://localhost:8080/api/donors/search?city=${district}&bloodGroup=${bloodType}`)
    .then(res => res.json())
    .then(data => {
        displayDonors(data);
    })
    .catch(err => {
        console.error("Error searching donors:", err);
        donorsContainer.innerHTML = '<p class="text-light-dark">Error fetching donors from server.</p>';
    });

        // Exclude current user's own posts if they are also a donor
        if (currentUser && currentUser.role === 'donor') {
            filteredDonors = filteredDonors.filter(post => post.donorId !== currentUser.id);
        }

        displayDonors(filteredDonors);
    }

    function displayDonors(donors) {
        donorsContainer.innerHTML = '';
        resultsCountElement.textContent = `${donors.length} donors found`;

        if (donors.length === 0) {
            donorsContainer.innerHTML = '<p class="text-light-dark">No donors found matching your criteria. Try adjusting your filters.</p>';
            return;
        }

        donors.forEach(donor => {
            const donorCard = document.createElement('div');
            donorCard.classList.add('donor-card');
            donorCard.innerHTML = `
                <div class="donor-header">
                    <div class="user-profile">
                        <div class="blood-badge">${donor.donorBloodType}</div>
                        <h4>${donor.donorName}</h4>
                    </div>
                    <span class="donor-distance">Approx. 5 km away</span>
                </div>
                <div class="donor-info">
                    <p><i class="fas fa-map-marker-alt"></i> ${donor.area}, ${donor.district}, ${donor.division}</p>
                    <p><i class="fas fa-calendar-alt"></i> Posted on ${donor.postDate}</p>
                </div>
                <div class="donor-stats">
                    <span><i class="fas fa-clock"></i> Availability: ${donor.availability.map(a => {
                        if (a === 'immediate') return 'Immediate';
                        if (a === '3days') return '1-3 Days';
                        if (a === 'scheduled') return 'Scheduled';
                        return a;
                    }).join(', ')}</span>
                    <span><i class="fas fa-notes-medical"></i> Notes: ${donor.notes ? donor.notes.substring(0, 50) + '...' : 'N/A'}</span>
                </div>
                <div class="donor-actions">
                    ${donor.contactPreference === 'liveChat' ? `<button class="btn-primary btn-chat-donor" data-donor-id="${donor.donorId}" data-donor-name="${donor.donorName}" data-blood-type="${donor.donorBloodType}"><i class="fas fa-comment-dots"></i> Chat Now</button>` : ''}
                    ${donor.contactPreference === 'phone' ? `<a href="tel:${donor.donorPhone}" class="btn-primary"><i class="fas fa-phone-alt"></i> Call Donor</a>` : ''}
                </div>
            `;
            donorsContainer.appendChild(donorCard);
        });
    }

    // --- Chat Functionality ---
    donorsContainer.addEventListener('click', (e) => {
        const chatButton = e.target.closest('.btn-chat-donor');
        if (chatButton) {
            const donorId = parseInt(chatButton.dataset.donorId);
            showChat(donorId);
        }
    });

    btnCloseChat.addEventListener('click', hideChat);

    sendMessageBtn.addEventListener('click', () => {
        const messageText = chatMessageInput.value.trim();
        if (messageText && currentChatPartnerId) {
            addMessageToChat(currentUser.id, currentChatPartnerId, messageText);
            chatMessageInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
        }
    });

    chatMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessageBtn.click();
        }
    });

    function addMessageToChat(senderId, receiverId, messageText) {
        const chatId = getChatId(senderId, receiverId);
        if (!chats[chatId]) {
            chats[chatId] = [];
        }

        const newMessage = {
            sender: senderId,
            text: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        chats[chatId].push(newMessage);
        saveData();
        loadChatMessages(receiverId); // Reload messages to show new one
    }

    function loadChatMessages(partnerId) {
        const chatId = getChatId(currentUser.id, partnerId);
        chatMessages.innerHTML = ''; // Clear previous messages

        const messages = chats[chatId] || [];
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.classList.add(msg.sender === currentUser.id ? 'sent' : 'received');
            messageDiv.innerHTML = `
                <p>${msg.text}</p>
                <span>${msg.timestamp}</span>
            `;
            chatMessages.appendChild(messageDiv);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    }

    function getChatId(userId1, userId2) {
        // Ensure consistent chat ID regardless of sender/receiver order
        return userId1 < userId2 ? `${userId1}-${userId2}` : `${userId2}-${userId1}`;
    }


    // --- Initial Load ---
    if (currentUser) {
        if (currentUser.role === 'donor') {
            showDonorDashboard();
        } else if (currentUser.role === 'receiver') {
            showReceiverDashboard();
        } else {
            showDashboardSelection();
        }
    } else {
        showAuthContainer();
    }
});
