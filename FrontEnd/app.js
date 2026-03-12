function signup(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const childName = document.getElementById("childName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;
    const speedLimit = document.getElementById("speedLimit").value;
    const vehicleHealth = document.getElementById("vehicleHealth").value;

    const message = document.getElementById("signupMessage");

    if(password !== confirmPassword){
        message.style.color = "red";
        message.textContent = "Passwords do not match";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    if(users.find(u => u.email === email)){
        message.style.color = "red";
        message.textContent = "Email already registered";
        return;
    }

    const newUser = { fullName, childName, email, password, role, speedLimit, vehicleHealth };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    message.style.color = "lightgreen";
    message.textContent = "Signup successful! Redirecting to login...";

    setTimeout(()=>{ window.location.href = "login.html"; }, 2000);
}


function login(event){
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if(!user){
        alert("Incorrect email or password");
        return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = "dashboard.html";
}


function logout(){
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}


function loadDashboard(){
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if(!user) { window.location.href = "login.html"; return; }

    document.getElementById("welcomeMsg").textContent = `Welcome ${user.fullName}`;
    startSpeedSimulation(user.speedLimit || 80);
    startFatigueDetection();
}


let speedChart;
let speedData = [];
let speedLabels = [];

function startSpeedSimulation(speedLimit){
    const ctx = document.getElementById("speedChart").getContext("2d");

    speedChart = new Chart(ctx, {
        type:"line",
        data:{
            labels: speedLabels,
            datasets:[{
                label:"Bus Speed (km/h)",
                data: speedData,
                borderColor:"#00eaff",
                backgroundColor:"rgba(0,234,255,0.2)",
                borderWidth:3,
                tension:0.4
            }]
        },
        options:{
            responsive:true,
            plugins:{ legend:{ labels:{ color:"#ffffff" } } },
            scales:{
                x:{ ticks:{ color:"#ffffff" }, grid:{ color:"rgba(255,255,255,0.1)" } },
                y:{ ticks:{ color:"#ffffff" }, grid:{ color:"rgba(255,255,255,0.1)" } }
            }
        }
    });

    updateSpeed(speedLimit);
}

function updateSpeed(speedLimit){
    const speedElem = document.getElementById("speedValue");
    const needle = document.getElementById("speedNeedle");

    let speed = Math.floor(Math.random() * 120);
    speedElem.textContent = speed + " km/h";

    
    const angle = ((speed / 120) * 180) - 90;
    needle.style.transform = `rotate(${angle}deg)`;

    
    const time = new Date().toLocaleTimeString();
    speedLabels.push(time); speedData.push(speed);
    if(speedLabels.length > 10){ speedLabels.shift(); speedData.shift(); }
    speedChart.update();

    
    if(speed > speedLimit){
        showAlert("Warning! Over speed detected!");
        voiceAlert("Warning! Over speed detected!");
    }

    setTimeout(()=>{ updateSpeed(speedLimit); }, 3000);
}


function showAlert(msg){
    const alerts = document.getElementById("alerts");
    alerts.textContent = msg;
    setTimeout(()=>{ alerts.textContent=""; },4000);
}

function voiceAlert(msg){
    if('speechSynthesis' in window){
        const speech = new SpeechSynthesisUtterance(msg);
        speech.rate = 1;
        window.speechSynthesis.speak(speech);
    }
}


function childPickup(){
    const now = new Date().toLocaleString();
    document.getElementById("childPicked").textContent = "Yes";
    document.getElementById("pickupTime").textContent = now;
    showAlert(`Child picked up at ${now}`);
    voiceAlert("Child picked up");
}

function childDrop(){
    const now = new Date().toLocaleString();
    document.getElementById("childPicked").textContent = "No";
    document.getElementById("dropTime").textContent = now;
    showAlert(`Child dropped off at ${now}`);
    voiceAlert("Child dropped off");
}


function startFatigueDetection(){
    setInterval(()=>{
        let fatigue = Math.random() > 0.8;
        if(fatigue){
            document.getElementById("driverStatus").textContent = "Fatigue";
            showAlert("Driver fatigue detected! Take a break.");
            voiceAlert("Driver fatigue detected! Take a break.");
        }else{
            document.getElementById("driverStatus").textContent = "Alert";
        }
    },15000);
}


let map, marker;
function initMap(){
    const loc = {lat:-26.2041,lng:28.0473}; 
    map = new google.maps.Map(document.getElementById("map"),{ zoom:14, center:loc });
    marker = new google.maps.Marker({ position:loc, map:map, title:"Bus Location" });

    setInterval(()=>{
        loc.lat += (Math.random()-0.5)*0.001;
        loc.lng += (Math.random()-0.5)*0.001;
        marker.setPosition(loc);
        map.setCenter(loc);
    },3000);
}