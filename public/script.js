document.addEventListener('DOMContentLoaded', function() {
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    // // The Firebase SDK is initialized and available here!
    //
    // firebase.auth().onAuthStateChanged(user => { });
    // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    // firebase.messaging().requestPermission().then(() => { });
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
    //
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

    // Calculate the offset from the bottom-right corner
    const bl = {
        lat: 37.377021, long: -122.015133,
    }
    const br = {
        lat: 37.376452, long: -122.015317,
    };
    const tl = {
        lat: 37.376957, long: -122.014800,
    };
    const tr = {
        lat: 37.376394, long: -122.014993,
    }

    try {
        let app = firebase.app();
        let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');

        // Converts GPS location to point on map
        function convertLocationToPoint(location, fill) {
            const mapWidth = Math.sqrt(Math.pow(bl.long - br.long, 2) + Math.pow(bl.lat - br.lat, 2));
            const mapHeight = Math.sqrt(Math.pow(tr.long - br.long, 2) + Math.pow(tr.lat - br.lat, 2));
            const theta = Math.atan2(bl.long - br.long, bl.lat - br.lat);
            const x = location.long - br.long, y = location.lat - br.lat;

            // Calculations
            const z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            const phi = Math.atan2(y, x);
            const alpha = Math.PI/2 - (theta + phi);
            const xPrime = z * Math.cos(alpha);
            const yPrime = z * Math.sin(alpha);

            const right = xPrime * (400 / mapWidth);
            const bottom = yPrime * (150 / mapHeight);

            const cx = 400 - right;
            const cy = 150 - bottom;

            const svgns = "http://www.w3.org/2000/svg";
            let circle = document.createElementNS(svgns, 'circle');
            circle.setAttributeNS(null, 'cx', cx);
            circle.setAttributeNS(null, 'cy', cy);
            circle.setAttributeNS(null, 'r', 10);
            if (fill) circle.setAttributeNS(null, 'fill', fill);
            document.getElementById('svg').appendChild(circle);

            circles.push(circle);
        }

        let circles = [];

        let db = firebase.database();
        let ref = db.ref('gpsLocation');
        ref.on('value', (snapshot) => {
            let location = snapshot.val();

            // front door!
            let frontDoor = {
                lat: 37.376730, long: -122.015220,
            };
            // straight across from the front door
            let backDoor = {
                long: -122.014895, lat: 37.376670,
            };

            circles.forEach(c => {
                document.getElementById('svg').removeChild(c);
            });
            circles = [];

            convertLocationToPoint(frontDoor);
            convertLocationToPoint(backDoor);
            [bl, br, tl, tr].map(l => convertLocationToPoint(l));

            // actual location
            convertLocationToPoint(location, "blue");

            document.getElementById('gpsLocation').innerHTML = JSON.stringify(location);
        })
        document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
    } catch (e) {
        console.error(e);
        document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
    }
});
