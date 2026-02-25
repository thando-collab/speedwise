// ================= PAGE SWITCHING =================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// ================= SIGNUP =================
function registerUser() {
  const signupPage = document.getElementById('signupPage');
  const inputs = signupPage.querySelectorAll('input, select');

  let alertDiv = signupPage.querySelector('#signup-alert');
  if (!alertDiv) {
    alertDiv = document.createElement('div');
    alertDiv.id = 'signup-alert';
    alertDiv.style.backgroundColor = '#f87171';
    alertDiv.style.color = 'white';
    alertDiv.style.padding = '10px';
    alertDiv.style.borderRadius = '8px';
    alertDiv.style.marginBottom = '10px';
    alertDiv.style.textAlign = 'center';
    signupPage.querySelector('.modal-content').prepend(alertDiv);
  }

  for (let input of inputs) {
    if (!input.value.trim()) {
      alertDiv.textContent = 'Please fill in all required fields';
      alertDiv.style.display = 'block';
      return;
    }
  }

  const userData = {
    fullname: inputs[0].value,
    email: inputs[1].value,
    password: inputs[2].value,
    carBrand: inputs[3].value,
    carModel: inputs[4].value,
    vehicleNumber: inputs[5].value,
    carType: inputs[6].value
  };

  localStorage.setItem('speedwiseUser', JSON.stringify(userData));

  alertDiv.style.backgroundColor = '#34d399';
  alertDiv.textContent = 'Account created successfully! Redirecting...';

  setTimeout(() => {
    document.getElementById('user-name').textContent = userData.fullname;
    document.getElementById('vehicle-info').textContent = `${userData.carType} - ${userData.vehicleNumber}`;
    showPage('dashboardPage');
    startSpeedDashboard();
  }, 1500);
}

// ================= LOGIN =================
function loginUser() {
  const loginPage = document.getElementById('loginPage');
  const email = loginPage.querySelector('input[type="email"]').value.trim();
  const password = loginPage.querySelector('input[type="password"]').value.trim();

  let alertDiv = loginPage.querySelector('#login-alert');
  if (!alertDiv) {
    alertDiv = document.createElement('div');
    alertDiv.id = 'login-alert';
    alertDiv.style.backgroundColor = '#f87171';
    alertDiv.style.color = 'white';
    alertDiv.style.padding = '10px';
    alertDiv.style.borderRadius = '8px';
    alertDiv.style.marginBottom = '10px';
    alertDiv.style.textAlign = 'center';
    loginPage.prepend(alertDiv);
  }

  if (!email || !password) {
    alertDiv.textContent = 'Please enter both email and password';
    alertDiv.style.display = 'block';
    return;
  }

  const savedUser = JSON.parse(localStorage.getItem('speedwiseUser'));
  if (!savedUser || savedUser.email !== email || savedUser.password !== password) {
    alertDiv.textContent = 'Invalid credentials';
    alertDiv.style.display = 'block';
    return;
  }

  document.getElementById('user-name').textContent = savedUser.fullname;
  document.getElementById('vehicle-info').textContent = `${savedUser.carType} - ${savedUser.vehicleNumber}`;
  showPage('dashboardPage');
  startSpeedDashboard();
}

// ================= DASHBOARD =================
let currentSpeed = 0,
    speedLimit = 50,
    nextLimit = 60,
    isReducingSpeed = false;

const violations = [];
let speedInterval;
let isTripActive = false;
const tripHistory = [];

const currentSpeedEl = document.getElementById("current-speed");
const currentLimitEl = document.getElementById("current-limit");
const nextLimitEl = document.getElementById("next-limit");
const speedDisplay = document.getElementById("speed-display");
const needle = document.getElementById("needle");
const violationsList = document.getElementById("violations-list");
const alertTextEl = document.getElementById("alertText");
const tripHistoryList = document.getElementById("trip-history-list");

// Start dashboard speed
function startSpeedDashboard() { speedInterval = setInterval(updateSpeed, 1000); }
function resetDashboard() { 
  clearInterval(speedInterval); 
  currentSpeed = 0; 
  speedLimit = 50; 
  nextLimit = 60; 
  isReducingSpeed = false; 
  violations.length = 0; 
  updateUI(); 
}

// ================= SPEED UPDATE =================
function updateSpeed() {
  let newSpeed = currentSpeed + (Math.floor(Math.random() * 21) - 10);
  newSpeed = Math.max(0, Math.min(120, newSpeed));

  if (newSpeed > speedLimit && !isReducingSpeed) {
    isReducingSpeed = true;
    const violation = { timestamp: new Date().toLocaleTimeString(), speed: newSpeed, limit: speedLimit };
    violations.unshift(violation);
    if (violations.length > 5) violations.pop();
    if (isTripActive) {
      const lastTrip = tripHistory[tripHistory.length - 1];
      if (lastTrip) lastTrip.alerts.push(violation);
    }
  }

  if (isReducingSpeed) {
    newSpeed = Math.max(newSpeed - 3, speedLimit - 5);
    if (newSpeed <= speedLimit - 5) isReducingSpeed = false;
  }

  currentSpeed = Math.round(newSpeed);

  if (Math.random() > 0.98) {
    const limits = [45, 55, 65, 70, 80, 90];
    speedLimit = limits[Math.floor(Math.random() * limits.length)];
    nextLimit = limits[Math.floor(Math.random() * limits.length)];
  }

  updateUI();
}

// ================= UPDATE UI =================
function updateUI() {
  currentSpeedEl.textContent = currentSpeed;
  currentLimitEl.textContent = speedLimit;
  nextLimitEl.textContent = nextLimit;
  speedDisplay.textContent = `${currentSpeed} MPH`;
  needle.style.transform = `rotate(${(currentSpeed/120)*180 - 90}deg)`;

  violationsList.innerHTML = violations.map(v => `<li>${v.timestamp} - ${v.speed} MPH (Limit: ${v.limit})</li>`).join("");
  alertTextEl.textContent = currentSpeed > speedLimit ? `⚠ Overspeed! Reduce to ${speedLimit} MPH` : '';

  // Update trip history list if exists
  if (tripHistoryList) {
    tripHistoryList.innerHTML = tripHistory.map((trip, i) => {
      const alerts = trip.alerts.map(a => `${a.timestamp}: ${a.speed}MPH`).join("<br>");
      return `<li>Trip ${i+1}: ${trip.startTime} - ${trip.endTime || "Ongoing"}<br>${alerts || "No violations"}</li>`;
    }).join("");
  }
}

// ================= TRIP CONTROLS =================
function toggleTrip(){ 
  if(!isTripActive){ 
    isTripActive = true; 
    document.getElementById("trip-btn").textContent = "Stop Trip"; 
    tripHistory.push({startTime: new Date().toLocaleTimeString(), alerts: []}); 
    startSpeedDashboard(); 
  } else { 
    isTripActive = false; 
    document.getElementById("trip-btn").textContent = "Start Trip"; 
    const lastTrip = tripHistory[tripHistory.length - 1]; 
    lastTrip.endTime = new Date().toLocaleTimeString(); 
    resetDashboard(); 
  }
}

// ================= VOICE COMMAND =================
function voiceCommand(){ 
  const command = prompt("Enter voice command (start trip, stop trip, show speed, send report):");
  switch(command?.toLowerCase()){
    case "start trip": toggleTrip(); break;
    case "stop trip": toggleTrip(); break;
    case "show speed": alert(`Current speed: ${currentSpeed} MPH`); break;
    case "send report": 
      console.log("Trip History:", tripHistory);
      alert("Report sent! Check console for history.");
      break;
    default: alert("Command not recognized!"); break;
  }
}

// ================= LOGOUT =================
function logoutDashboard() { 
  showPage('welcomePage'); 
  resetDashboard(); 
}

// ================= GOOGLE MAP =================
let map, userMarker;
function initMap(){
  map = new google.maps.Map(document.getElementById("map"), {center: {lat:-26.2041,lng:28.0473}, zoom:14});
  userMarker = new google.maps.Marker({
    position: map.getCenter(), 
    map: map, 
    title: "Your Vehicle", 
    icon: {path: google.maps.SymbolPath.CIRCLE, scale:10, fillColor:'blue', fillOpacity:1, strokeWeight:1}
  });

  setInterval(()=>{ 
    if(!isTripActive) return; 
    let latOffset=(Math.random()-0.5)/1000; 
    let lngOffset=(Math.random()-0.5)/1000; 
    let pos=userMarker.getPosition(); 
    userMarker.setPosition(new google.maps.LatLng(pos.lat()+latOffset,pos.lng()+lngOffset)); 
    map.setCenter(userMarker.getPosition());
  },3000);
  function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("GPS not supported");
  }
}

function showPosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;

  document.getElementById("coords").innerHTML =
    "Latitude: " + lat + "<br>Longitude: " + lon;

  document.getElementById("mapLink").innerHTML =
    `<a href="https://maps.google.com/?q=${lat},${lon}" target="_blank">
      Open in Google Maps
    </a>`;
}
}
