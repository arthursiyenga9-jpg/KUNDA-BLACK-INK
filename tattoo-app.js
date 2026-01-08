// --- INITIALIZATION ---
const canvas = document.getElementById('tattoo-canvas');
const ctx = canvas?.getContext('2d');
const appointmentForm = document.getElementById('appointment-form');

// --- 1. DRAWING TOOL ---
if (canvas && ctx) {
    let isDrawing = false;
    const startDraw = () => isDrawing = true;
    const stopDraw = () => { isDrawing = false; ctx.beginPath(); };

    canvas.addEventListener('mousedown', startDraw);
    window.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = document.getElementById('color-picker').value;
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });

    document.getElementById('clear').onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('save').onclick = () => {
        const link = document.createElement('a');
        link.download = 'my-tattoo-sketch.png';
        link.href = canvas.toDataURL();
        link.click();
    };
}

// --- 2. BOOKING LOGIC (PHONE BASED) ---
appointmentForm?.addEventListener('submit', function (e) {
    e.preventDefault();

    const apptData = {
        user_name: document.getElementById('name').value,
        user_phone: document.getElementById('phone').value,
        booking_date: document.getElementById('date').value,
        booking_time: document.getElementById('time').value,
        description: document.getElementById('tattoo-description').value
    };

    emailjs.send("service_bmhafjm", "template_oztapjd", apptData)
        .then(() => {
            alert("✅ Booking Success! We will call you on " + apptData.user_phone);

            // Save locally
            const localAppts = JSON.parse(localStorage.getItem('appointments')) || [];
            localAppts.push({ ...apptData, id: Date.now() });
            localStorage.setItem('appointments', JSON.stringify(localAppts));

            appointmentForm.reset();
        })
        .catch((err) => {
            console.error("FAILED...", err);
            alert("❌ Submission error. Check your internet connection.");
        });
});

// --- 3. MANAGE BOOKINGS ---
function loadAppointments() {
    const userPhone = document.getElementById('manage-phone')?.value.trim();
    const list = document.getElementById('appointments');
    const appts = JSON.parse(localStorage.getItem('appointments')) || [];

    if (!userPhone) { alert("Please enter your phone number."); return; }

    const filtered = appts.filter(a => a.user_phone === userPhone);
    list.innerHTML = filtered.length === 0
        ? '<li>No bookings found for this number.</li>'
        : filtered.map(a => `
            <li class="appointment-card">
                ${a.booking_date} at ${a.booking_time} 
                <button class="delete-btn" onclick="deleteBooking(${a.id})">Cancel</button>
            </li>`).join('');
}

function deleteBooking(id) {
    let appts = JSON.parse(localStorage.getItem('appointments')) || [];
    appts = appts.filter(a => a.id !== id);
    localStorage.setItem('appointments', JSON.stringify(appts));
    loadAppointments();
}
