document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
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

    // Registration Form elements
    const divisionSelect = document.getElementById('division');
    const districtSelect = document.getElementById('district');

    // Donor Dashboard elements
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

    // Receiver Dashboard elements
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

    // Application State
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let chats = JSON.parse(localStorage.getItem('chats')) || {};
    let currentChatPartnerId = null;

    // Bangladesh Divisions and Districts
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

    // Helper Functions
    const saveData = () => {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('chats', JSON.stringify(chats));
    };

    const handleApiError = (error) => {
        console.error("API Error:", error);
        return error.message || "An error occurred";
    };

    // UI State Management
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
        searchDonors();
    };

    const showChat = (partnerId) => {
        currentChatPartnerId = partnerId;
        fetch(`http://192.168.0.104:8080/api/users/${partnerId}`)
            .then(res => res.json())
            .then(partner => {
                chatPartnerName.textContent = partner.fullName || 'Unknown User';
                loadChatMessages(partnerId);
                chatContainer.style.display = 'flex';
            })
            .catch(err => {
                console.error("Failed to load chat partner:", err);
                alert("Could not start chat");
            });
    };

    const hideChat = () => {
        currentChatPartnerId = null;
        chatContainer.style.display = 'none';
    };

    // Authentication Flow
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

    // Registration Handler
    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(registrationForm);
        const userData = {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            password: formData.get('password'),
            bloodType: formData.get('bloodType'),
            division: formData.get('division'),
            district: formData.get('district'),
            role: 'DONOR'
        };

        if (formData.get('password') !== formData.get('confirmPassword')) {
            alert('Passwords do not match!');
            return;
        }

        fetch("http://192.168.0.104:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Registration failed');
            return response.json();
        })
        .then(data => {
            alert("Registration successful! Please login.");
            registrationForm.reset();
            loginCard.style.display = 'block';
            registrationCard.style.display = 'none';
        })
        .catch(error => {
            alert(handleApiError(error));
        });
    });

    // Login Handler
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const emailOrPhone = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        fetch("http://192.168.0.104:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailOrPhone, password })
        })
        .then(response => {
            if (!response.ok) throw new Error("Login failed");
            return response.json();
        })
        .then(data => {
            currentUser = data.user;
            currentUser.token = data.token; // Store JWT token
            saveData();
            
            // Redirect based on role
            if (currentUser.role === 'DONOR') {
                showDonorDashboard();
            } else if (currentUser.role === 'RECEIVER') {
                showReceiverDashboard();
            } else {
                showDashboardSelection();
            }
        })
        .catch(error => {
            alert(handleApiError(error));
        });
    });

    // Location Selection Helpers
    divisionSelect.addEventListener('change', () => {
        const selectedDivision = divisionSelect.value;
        districtSelect.innerHTML = '<option value="">Select District</option>';
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

    // Role Selection
    donorBtn.addEventListener('click', () => {
        fetch("http://192.168.0.104:8080/api/users/role", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ role: 'DONOR' })
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to update role");
            return response.json();
        })
        .then(updatedUser => {
            currentUser = updatedUser;
            saveData();
            showDonorDashboard();
        })
        .catch(error => {
            alert(handleApiError(error));
        });
    });

    receiverBtn.addEventListener('click', () => {
        fetch("http://192.168.0.104:8080/api/users/role", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ role: 'RECEIVER' })
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to update role");
            return response.json();
        })
        .then(updatedUser => {
            currentUser = updatedUser;
            saveData();
            showReceiverDashboard();
        })
        .catch(error => {
            alert(handleApiError(error));
        });
    });

    // Logout Handler
    logoutButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentUser = null;
            saveData();
            showAuthContainer();
            document.getElementById('loginForm').reset();
            registrationForm.reset();
        });
    });

    // Donor Dashboard Functions
    createPostBtn.addEventListener('click', () => {
        donationPostForm.style.display = 'block';
    });

    cancelPostBtn.addEventListener('click', () => {
        donationPostForm.style.display = 'none';
        donationForm.reset();
    });

    // Donation Post Creation
    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(donationForm);
        const availability = Array.from(document.querySelectorAll('input[name="availability"]:checked')).map(cb => cb.value);
        
        const postData = {
            division: formData.get('postDivision'),
            district: formData.get('postDistrict'),
            area: formData.get('postArea'),
            availability: availability,
            contactPreference: formData.get('contact'),
            notes: formData.get('donationNotes')
        };

        fetch("http://192.168.0.104:8080/api/posts", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(postData)
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to create post");
            return response.json();
        })
        .then(() => {
            alert("Donation post created successfully!");
            donationForm.reset();
            donationPostForm.style.display = 'none';
            loadDonorPosts();
        })
        .catch(error => {
            alert(handleApiError(error));
        });
    });

    function updateDonorDashboard() {
        if (!currentUser || currentUser.role !== 'DONOR') return;

        fetch(`http://192.168.0.104:8080/api/users/${currentUser.id}`, {
            headers: { "Authorization": `Bearer ${currentUser.token}` }
        })
        .then(res => res.json())
        .then(user => {
            currentUser = user;
            saveData();
            
            userBloodType.textContent = currentUser.bloodType;
            userGreeting.textContent = `Welcome, ${currentUser.fullName}!`;
            userLocationElement.textContent = `${currentUser.district}, ${currentUser.division}`;
            donationCountElement.textContent = currentUser.donationCount || 0;
            lastDonationElement.textContent = currentUser.lastDonationDate 
                ? new Date(currentUser.lastDonationDate).toLocaleDateString() 
                : "Never";

            loadDonorPosts();
        })
        .catch(err => {
            console.error("Failed to fetch user data:", err);
        });
    }

    function loadDonorPosts() {
        fetch(`http://192.168.0.104:8080/api/posts/donor/${currentUser.id}`, {
            headers: { "Authorization": `Bearer ${currentUser.token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to load posts");
            return res.json();
        })
        .then(posts => {
            if (posts.length === 0) {
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

            posts.forEach(post => {
                tableHTML += `
                    <tr>
                        <td>${new Date(post.createdAt).toLocaleDateString()}</td>
                        <td>${post.area}, ${post.district}</td>
                        <td>${post.availability.join(', ')}</td>
                        <td>${post.contactPreference === 'liveChat' ? 'Chat' : 'Phone'}</td>
                        <td class="d-none d-md-table-cell">${post.notes || 'N/A'}</td>
                        <td><span class="status-badge ${post.status.toLowerCase()}">${post.status}</span></td>
                        <td class="actions-cell">
                            <button class="btn-donation-done" data-post-id="${post.id}" title="Mark as Done">
                                <i class="fas fa-check-circle"></i>
                            </button>
                            <button class="btn-delete" data-post-id="${post.id}" title="Delete Post">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            tableHTML += '</tbody></table>';
            donorPostsContainer.innerHTML = tableHTML;

            // Add event listeners for action buttons
            document.querySelectorAll('.btn-donation-done').forEach(btn => {
                btn.addEventListener('click', () => markPostAsDone(btn.dataset.postId));
            });

            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', () => deletePost(btn.dataset.postId));
            });
        })
        .catch(err => {
            console.error("Error loading posts:", err);
            donorPostsContainer.innerHTML = '<p>Error loading posts. Please try again.</p>';
        });
    }

    function markPostAsDone(postId) {
        fetch(`http://192.168.0.104:8080/api/posts/${postId}/complete`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${currentUser.token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to mark post as done");
            loadDonorPosts();
        })
        .catch(err => {
            console.error("Error marking post as done:", err);
            alert("Failed to mark post as done");
        });
    }

    function deletePost(postId) {
        if (!confirm("Are you sure you want to delete this post?")) return;
        
        fetch(`http://192.168.0.104:8080/api/posts/${postId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${currentUser.token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to delete post");
            loadDonorPosts();
        })
        .catch(err => {
            console.error("Error deleting post:", err);
            alert("Failed to delete post");
        });
    }

    // Receiver Dashboard Functions
    function populateSearchFilters() {
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

        let url = `http://192.168.0.104:8080/api/posts/search?bloodType=${bloodType}`;
        if (district) url += `&district=${district}`;
        else if (division) url += `&division=${division}`;

        fetch(url, {
            headers: { "Authorization": `Bearer ${currentUser.token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Search failed");
            return res.json();
        })
        .then(posts => {
            displayDonors(posts);
        })
        .catch(err => {
            console.error("Error searching donors:", err);
            donorsContainer.innerHTML = '<p class="text-light-dark">Error fetching donors from server.</p>';
        });
    }

    function displayDonors(posts) {
        donorsContainer.innerHTML = '';
        resultsCountElement.textContent = `${posts.length} donors found`;

        if (posts.length === 0) {
            donorsContainer.innerHTML = '<p class="text-light-dark">No donors found matching your criteria. Try adjusting your filters.</p>';
            return;
        }

        posts.forEach(post => {
            const donorCard = document.createElement('div');
            donorCard.classList.add('donor-card');
            donorCard.innerHTML = `
                <div class="donor-header">
                    <div class="user-profile">
                        <div class="blood-badge">${post.donor.bloodType}</div>
                        <h4>${post.donor.fullName}</h4>
                    </div>
                    <span class="donor-distance">Approx. 5 km away</span>
                </div>
                <div class="donor-info">
                    <p><i class="fas fa-map-marker-alt"></i> ${post.area}, ${post.district}, ${post.division}</p>
                    <p><i class="fas fa-calendar-alt"></i> Posted on ${new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="donor-stats">
                    <span><i class="fas fa-clock"></i> Availability: ${post.availability.map(a => {
                        if (a === 'immediate') return 'Immediate';
                        if (a === '3days') return '1-3 Days';
                        if (a === 'scheduled') return 'Scheduled';
                        return a;
                    }).join(', ')}</span>
                    <span><i class="fas fa-notes-medical"></i> Notes: ${post.notes ? post.notes.substring(0, 50) + '...' : 'N/A'}</span>
                </div>
                <div class="donor-actions">
                    ${post.contactPreference === 'liveChat' ? 
                        `<button class="btn-primary btn-chat-donor" data-donor-id="${post.donor.id}">
                            <i class="fas fa-comment-dots"></i> Chat Now
                        </button>` : ''}
                    ${post.contactPreference === 'phone' ? 
                        `<a href="tel:${post.donor.phone}" class="btn-primary">
                            <i class="fas fa-phone-alt"></i> Call Donor
                        </a>` : ''}
                </div>
            `;
            donorsContainer.appendChild(donorCard);
        });

        // Add event listeners to chat buttons
        document.querySelectorAll('.btn-chat-donor').forEach(btn => {
            btn.addEventListener('click', () => showChat(btn.dataset.donorId));
        });
    }

    // Chat Functionality
    btnCloseChat.addEventListener('click', hideChat);

    sendMessageBtn.addEventListener('click', () => {
        const messageText = chatMessageInput.value.trim();
        if (messageText && currentChatPartnerId) {
            sendMessage(messageText);
        }
    });

    chatMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(chatMessageInput.value.trim());
        }
    });

    function sendMessage(messageText) {
        if (!messageText || !currentChatPartnerId) return;

        fetch("http://192.168.0.104:8080/api/messages", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({
                receiverId: currentChatPartnerId,
                content: messageText
            })
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to send message");
            chatMessageInput.value = '';
            loadChatMessages(currentChatPartnerId);
        })
        .catch(err => {
            console.error("Error sending message:", err);
        });
    }

    function loadChatMessages(partnerId) {
        fetch(`http://192.168.0.104:8080/api/messages/${partnerId}`, {
            headers: { "Authorization": `Bearer ${currentUser.token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to load messages");
            return res.json();
        })
        .then(messages => {
            chatMessages.innerHTML = '';
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message');
                messageDiv.classList.add(msg.senderId === currentUser.id ? 'sent' : 'received');
                messageDiv.innerHTML = `
                    <p>${msg.content}</p>
                    <span>${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                `;
                chatMessages.appendChild(messageDiv);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(err => {
            console.error("Error loading messages:", err);
        });
    }

    // Initialize Application
    if (currentUser) {
        // Verify token is still valid
        fetch("http://192.168.0.104:8080/api/auth/validate", {
            headers: { "Authorization": `Bearer ${currentUser.token}` }
        })
        .then(res => {
            if (res.ok) {
                if (currentUser.role === 'DONOR') {
                    showDonorDashboard();
                } else if (currentUser.role === 'RECEIVER') {
                    showReceiverDashboard();
                } else {
                    showDashboardSelection();
                }
            } else {
                showAuthContainer();
            }
        })
        .catch(() => showAuthContainer());
    } else {
        showAuthContainer();
    }
});
