async function startFatigueDetection() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');

    const video = document.getElementById('video');
    video.style.display = 'block';

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => video.srcObject = stream)
        .catch(err => console.error(err));

    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.appendChild(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

            if(detections.length>0){
                const leftEye = detections[0].landmarks.getLeftEye();
                const rightEye = detections[0].landmarks.getRightEye();
                const EAR = computeEAR(leftEye,rightEye);

                if(EAR < 0.2){
                    showAlert("⚠ Driver Fatigue Detected!");
                    const status = document.getElementById('driverStatus');
                    if(status) status.innerText = "Fatigue";
                } else {
                    const status = document.getElementById('driverStatus');
                    if(status) status.innerText = "Alert";
                }
            }
        },500);
    });
}

function computeEAR(left,right){
    function dist(a,b){ return Math.hypot(a.x-b.x,a.y-b.y);}
    const L=(dist(left[1],left[5])+dist(left[2],left[4]))/(2*dist(left[0],left[3]));
    const R=(dist(right[1],right[5])+dist(right[2],right[4]))/(2*dist(right[0],right[3]));
    return (L+R)/2;
}
