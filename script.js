// Global current user variable (in-memory only)
let currentUser = null;

// --- Registration ---

const registrationForm = document.getElementById('registrationForm');
const registrationCard = document.getElementById('registrationCard');
const loginCard = document.getElementById('loginCard');

registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const bloodType = document.getElementById('bloodType').value;
    const division = document.getElementById('division').value;
    const district = document.getElementById('district').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const donorData = {
        name: fullName,
        email: email,
        phone: phone,
        bloodGroup: bloodType,
        city: district || division,
        gender: 'Not Specified',
        dateOfBirth: null,
        address: `${district}, ${division}`,
        state: '',
        country: 'Bangladesh',
        postalCode: '',
        lastDonationDate: null,
        isAvailable: true
    };

    fetch('http://localhost:8080/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donorData)
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to register donor');
        return res.json();
    })
    .then(() => {
        alert('Registration successful! Please login.');
        registrationForm.reset();
        registrationCard.style.display = 'none';
        loginCard.style.display = 'block';
    })
    .catch(err => alert(err.message));
});

// --- Login ---

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const loginEmail = document.getElementById('loginEmail').value.trim();

    fetch('http://localhost:8080/api/donors')
    .then(res => res.json())
    .then(users => {
        const foundUser = users.find(user => user.email === loginEmail);

        if (foundUser) {
            currentUser = foundUser;
            alert('Login successful!');
            showDonorDashboard();
        } else {
            alert('Invalid email.');
        }
    })
    .catch(() => alert('Failed to fetch users.'));
});

function showDonorDashboard() {
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('donorDashboard').style.display = 'block';
    loadDonorRequests();
}

// --- Search Donors ---

const donorsContainer = document.getElementById('donorsContainer');
const searchButton = document.getElementById('searchButton');

searchButton.addEventListener('click', () => {
    const bloodType = document.getElementById('searchBloodType').value;
    const division = document.getElementById('searchDivision').value;
    const district = document.getElementById('searchDistrict').value;
    const city = district || division;

    if (!city || !bloodType) {
        alert('Please select blood group and city');
        return;
    }

    fetch(`http://localhost:8080/api/donors/search?city=${encodeURIComponent(city)}&bloodGroup=${encodeURIComponent(bloodType)}`)
    .then(res => res.json())
    .then(donors => {
        const filtered = donors.filter(d => currentUser ? d.id !== currentUser.id : true);
        displayDonors(filtered);
    })
    .catch(() => {
        donorsContainer.innerHTML = '<p class="text-light-dark">Error fetching donors.</p>';
    });
});

function displayDonors(donors) {
    donorsContainer.innerHTML = '';
    if (donors.length === 0) {
        donorsContainer.innerHTML = '<p class="text-light-dark">No donors found.</p>';
        return;
    }
    donors.forEach(donor => {
        const donorCard = document.createElement('div');
        donorCard.className = 'donor-card';
        donorCard.innerHTML = `
            <h4>${donor.name}</h4>
            <p>Blood Group: ${donor.bloodGroup}</p>
            <p>Phone: ${donor.phone}</p>
            <p>City: ${donor.city}</p>
        `;
        donorsContainer.appendChild(donorCard);
    });
}

// --- Donation Post Creation ---

const donationForm = document.getElementById('donationForm');
const donationPostForm = document.getElementById('donationPostForm');

donationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const availability = Array.from(document.querySelectorAll('input[name="availability"]:checked')).map(cb => cb.value);
    const postDivision = document.getElementById('postDivision').value;
    const postDistrict = document.getElementById('postDistrict').value;
    const postArea = document.getElementById('postArea').value;
    const contactPreference = document.querySelector('input[name="contact"]:checked').value;
    const donationNotes = document.getElementById('donationNotes').value;

    if (availability.length === 0) {
        alert('Please select at least one availability option.');
        return;
    }

    if (!currentUser) {
        alert('Please login first.');
        return;
    }

    const bloodRequest = {
        patientName: currentUser.name,
        hospitalName: '',
        bloodGroup: currentUser.bloodGroup,
        unitsRequired: 1,
        contactPerson: currentUser.name,
        contactPhone: currentUser.phone,
        hospitalAddress: postArea,
        city: postDistrict || postDivision,
        state: '',
        country: 'Bangladesh',
        requiredDate: new Date().toISOString(),
        additionalNotes: donationNotes,
        status: 'Pending'
    };

    fetch('http://localhost:8080/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bloodRequest)
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to create donation post');
        return res.json();
    })
    .then(() => {
        alert('Donation post created successfully!');
        donationForm.reset();
        donationPostForm.style.display = 'none';
        loadDonorRequests();
    })
    .catch(err => alert(err.message));
});

// --- Load Donor Requests ---

function loadDonorRequests() {
    const requestsContainer = document.getElementById('requestsContainer');
    fetch('http://localhost:8080/api/requests')
    .then(res => res.json())
    .then(requests => {
        requestsContainer.innerHTML = '';
        requests.forEach(req => {
            const reqDiv = document.createElement('div');
            reqDiv.className = 'request-card';
            reqDiv.innerHTML = `
                <h4>Request by: ${req.patientName}</h4>
                <p>Blood Group: ${req.bloodGroup}</p>
                <p>City: ${req.city}</p>
                <p>Status: ${req.status}</p>
                <p>Notes: ${req.additionalNotes}</p>
            `;
            requestsContainer.appendChild(reqDiv);
        });
    })
    .catch(() => {
        requestsContainer.innerHTML = '<p class="text-light-dark">Failed to load requests.</p>';
    });
}
