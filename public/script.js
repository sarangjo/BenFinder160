const svgns = "http://www.w3.org/2000/svg";

document.addEventListener('DOMContentLoaded', function() {
    const HEIGHT = 400;
    const WIDTH = 2.5 * HEIGHT;

    document.getElementById('svg').setAttribute("height", HEIGHT);
    document.getElementById('svg').setAttribute("width", WIDTH);
    document.getElementById('map').setAttribute("height", HEIGHT);
    document.getElementById('map').setAttribute("width", WIDTH);

    // Calculate the offset from the bottom-right corner
    const bl = {
        lat: 37.377021, long: -122.015133,
    };
    const br = {
        lat: 37.376452, long: -122.015317,
    };
    const tl = {
        lat: 37.376957, long: -122.014800,
    };
    const tr = {
        lat: 37.376394, long: -122.014993,
    };

    try {
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

            const right = xPrime * (WIDTH / mapWidth);
            const bottom = yPrime * (HEIGHT / mapHeight);

            const cx = WIDTH - right;
            const cy = HEIGHT - bottom;

            return {
                cx, cy
            };
        }

        function pointToCircle(p) {
            let circle = document.createElementNS(svgns, 'circle');
            circle.setAttributeNS(null, 'cx', p.cx);
            circle.setAttributeNS(null, 'cy', p.cy);
            circle.setAttributeNS(null, 'r', 10);
            if (fill) circle.setAttributeNS(null, 'fill', fill);
            document.getElementById('svg').appendChild(circle);

            elements.push(circle);
        }

        function pointToBen(p) {
            const size = 100;

            let ben = document.getElementById('ben');
            ben.setAttributeNS(null, 'width', size);
            ben.setAttributeNS(null, 'height', size);
            ben.setAttributeNS(null, 'x', p.cx - size/2);
            ben.setAttributeNS(null, 'y', p.cy - size/2);

            let benCircle = document.getElementById('benCircle');
            benCircle.setAttributeNS(null, 'cx', p.cx);
            benCircle.setAttributeNS(null, 'cy', p.cy);
        }

        let elements = [];

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

            elements.forEach(c => {
                document.getElementById('svg').removeChild(c);
            });
            elements = [];

            // 6 points
            // convertLocationToPoint(frontDoor);
            // convertLocationToPoint(backDoor);
            // [bl, br, tl, tr].map(l => convertLocationToPoint(l));

            // actual location
            pointToBen(convertLocationToPoint(location, "blue"));

            document.getElementById('gpsLocation').innerHTML = JSON.stringify(location);
        })
    } catch (e) {
        console.error(e);
    }
});
