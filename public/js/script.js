const socket = io();

const clientName = prompt('Enter your name') || 'Anonymous';

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('send-location', { latitude, longitude, name: clientName });
        },
        (error) => {
            console.error('Error getting location:', error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
}

const map = L.map('map').setView([0, 0],15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: "raptor"
}).addTo(map);

const marker = {};

socket.on('receive-location', (data) => {
    const { id, latitude, longitude, name } = data;
    map.setView([latitude, longitude]);
    if (marker[id]) {
        marker[id].setLatLng([latitude, longitude]);
        const tt = marker[id].getTooltip && marker[id].getTooltip();
        if (tt) {
            tt.setContent(name);
        } else {
            marker[id].bindTooltip(name, { permanent: true, direction: 'top' }).openTooltip();
        }
    } else {
        marker[id] = L.marker([latitude, longitude]).addTo(map);
        marker[id].bindTooltip(name, { permanent: true, direction: 'top' }).openTooltip();
    }
});

socket.on("user-disconnected", (id) => {
    if (marker[id]) {
        map.removeLayer(marker[id]);
        delete marker[id];
    }
});