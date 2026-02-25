// ================= AUTO LOGIN =================
window.onload = function(){
  const session = JSON.parse(localStorage.getItem("speedwiseSession"));
  if(session){
    loadDashboard(session);
  }
}

// ================= PAGE SWITCH =================
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ================= SIGNUP =================
function registerUser(){
  // Gather input values
  const user = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    brand: document.getElementById("brand").value.trim(),
    model: document.getElementById("model").value.trim(),
    number: document.getElementById("number").value.trim(),
    type: document.getElementById("type").value
  };

  // Check all fields are filled
  if(Object.values(user).includes("")){
    alert("Please fill all fields!");
    return;
  }

  // Save user in localStorage
  localStorage.setItem("speedwiseUser", JSON.stringify(user));

  // Auto-fill login email
  document.getElementById("loginEmail").value = user.email;

  alert("Account created! Please login.");
  showPage("loginPage");
}

// ================= LOGIN =================
function loginUser(){
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const savedUser = JSON.parse(localStorage.getItem("speedwiseUser"));
  
  if(!savedUser){
    alert("No account found. Please sign up.");
    return;
  }

  if(savedUser.email !== email || savedUser.password !== password){
    alert("Invalid email or password!");
    return;
  }

  // Save session
  localStorage.setItem("speedwiseSession", JSON.stringify(savedUser));

  loadDashboard(savedUser);
}

// ================= DASHBOARD =================
let currentSpeed = 0, speedLimit = 50, nextLimit = 60, violations = [], speedInterval;

function loadDashboard(user){
  document.getElementById("user-name").textContent = user.name;
  document.getElementById("vehicle-info").textContent = user.type + " - " + user.number;
  showPage("dashboardPage");
  startDashboard();
}

// ================= SPEED =================
function startDashboard(){
  if(speedInterval) clearInterval(speedInterval);
  speedInterval = setInterval(updateSpeed, 1000);
}

function updateSpeed(){
  let newSpeed = currentSpeed + (Math.random() * 20 - 10);
  newSpeed = Math.max(0, Math.min(120, newSpeed));

  if(newSpeed > speedLimit){
    violations.unshift(Math.round(newSpeed) + " MPH in " + speedLimit);
    if(violations.length > 5) violations.pop();
  }

  currentSpeed = newSpeed;

  if(Math.random() > 0.95){
    speedLimit = [45,55,65,80][Math.floor(Math.random()*4)];
    nextLimit = [50,60,70,90][Math.floor(Math.random()*4)];
  }

  updateUI();
}

function updateUI(){
  document.getElementById("current-speed").textContent = Math.round(currentSpeed);
  document.getElementById("current-limit").textContent = speedLimit;
  document.getElementById("next-limit").textContent = nextLimit;
  document.getElementById("speed-display").textContent = Math.round(currentSpeed) + " MPH";
  document.getElementById("needle").style.transform = `rotate(${(currentSpeed/120)*180-90}deg)`;
  document.getElementById("violations-list").innerHTML = violations.map(v => `<li>${v}</li>`).join("");
  document.getElementById("alertText").textContent = currentSpeed > speedLimit ? "⚠ Overspeed!" : "";
}

// ================= TRIP =================
function toggleTrip(){
  const btn = document.getElementById("trip-btn");
  btn.textContent = btn.textContent === "Start Trip" ? "Stop Trip" : "Start Trip";
}

// ================= VOICE =================
function voiceCommand(){
  let cmd = prompt("Command: show speed");
  if(cmd === "show speed") alert(Math.round(currentSpeed) + " MPH");
}

// ================= LOGOUT =================
function logout(){
  localStorage.removeItem("speedwiseSession");
  location.reload();
}

// ================= GOOGLE MAP =================
let map, userMarker;
function initMap(){
  const startPos = {lat: 40.7128, lng: -74.0060}; // Example starting location
  map = new google.maps.Map(document.getElementById("map"),{
    center: startPos,
    zoom:14
  });

  userMarker = new google.maps.Marker({
    position: startPos,
    map: map,
    title: "Your Vehicle",
    icon: { path: google.maps.SymbolPath.CIRCLE, scale:10, fillColor:'blue', fillOpacity:1, strokeWeight:1 }
  });

  setInterval(()=>{
    if(document.getElementById("trip-btn").textContent.includes("Start Trip")) return;
    let latOffset = (Math.random()-0.5)/1000;
    let lngOffset = (Math.random()-0.5)/1000;
    let pos = userMarker.getPosition();
    userMarker.setPosition(new google.maps.LatLng(pos.lat()+latOffset,pos.lng()+lngOffset));
    map.setCenter(userMarker.getPosition());
  }, 3000);
}