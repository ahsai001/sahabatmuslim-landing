// Kompas Arah Kiblat Interaktif - Sahabat Muslim
// Formula Spherical Geodesy & Device Orientation API

(function () {
    const KAABA = {
        lat: 21.422487,
        lng: 39.826206,
        name: "Ka'bah, Masjidil Haram, Makkah Al-Mukarramah"
    };

    const INDONESIA_CITIES = {
        "Jakarta": { lat: -6.2088, lng: 106.8456 },
        "Bandung": { lat: -6.9175, lng: 107.6191 },
        "Surabaya": { lat: -7.2575, lng: 112.7521 },
        "Semarang": { lat: -6.9667, lng: 110.4167 },
        "Yogyakarta": { lat: -7.7956, lng: 110.3695 },
        "Medan": { lat: 3.5952, lng: 98.6722 },
        "Banda Aceh": { lat: 5.5483, lng: 95.3238 },
        "Palembang": { lat: -2.9761, lng: 104.7754 },
        "Padang": { lat: -0.9471, lng: 100.4172 },
        "Makassar": { lat: -5.1477, lng: 119.4327 },
        "Denpasar": { lat: -8.6705, lng: 115.2126 },
        "Banjarmasin": { lat: -3.3194, lng: 114.5908 },
        "Balikpapan": { lat: -1.2379, lng: 116.8289 },
        "Pontianak": { lat: -0.0263, lng: 109.3425 },
        "Manado": { lat: 1.4748, lng: 124.8428 },
        "Mataram": { lat: -8.5833, lng: 116.1167 },
        "Kupang": { lat: -10.1772, lng: 123.6070 },
        "Ambon": { lat: -3.6547, lng: 128.1906 },
        "Jayapura": { lat: -2.5916, lng: 140.6690 }
    };

    let userLocation = {
        lat: -6.2088,
        lng: 106.8456,
        name: "Jakarta (Default)"
    };

    let qiblaBearing = 295.2; // degrees clockwise from North
    let distanceKm = 7922;
    let deviceHeading = 0; // heading clockwise from North
    let sensorAvailable = false;
    let hasVibrated = false;

    function calculateQibla(lat, lng) {
        const phi1 = (lat * Math.PI) / 180;
        const phi2 = (KAABA.lat * Math.PI) / 180;
        const deltaLambda = ((KAABA.lng - lng) * Math.PI) / 180;

        const y = Math.sin(deltaLambda);
        const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

        let qibla = (Math.atan2(y, x) * 180) / Math.PI;
        qibla = (qibla + 360) % 360;

        // Haversine distance
        const R = 6371; // km
        const dLat = ((KAABA.lat - lat) * Math.PI) / 180;
        const dLon = ((KAABA.lng - lng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = Math.round(R * c);

        return {
            bearing: Math.round(qibla * 10) / 10,
            distance: dist
        };
    }

    function showToast(msg) {
        let toast = document.getElementById('kiblat-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'kiblat-toast';
            toast.className = 'dzikir-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    function updateCompassDisplay() {
        const compassDial = document.getElementById('compass-dial');
        const kaabaMarker = document.getElementById('kaaba-marker');
        const bearingDisplay = document.getElementById('kiblat-bearing-display');
        const distanceDisplay = document.getElementById('kiblat-distance-display');
        const locNameDisplay = document.getElementById('kiblat-location-display');
        const headingDisplay = document.getElementById('compass-heading-display');
        const statusBox = document.getElementById('kiblat-status-box');
        const gmapsBtn = document.getElementById('kiblat-gmaps-btn');

        if (bearingDisplay) bearingDisplay.textContent = `${qiblaBearing.toFixed(1)}°`;
        if (distanceDisplay) distanceDisplay.textContent = `${distanceKm.toLocaleString('id-ID')} km`;
        if (locNameDisplay) locNameDisplay.textContent = userLocation.name;
        if (gmapsBtn) {
            gmapsBtn.href = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${KAABA.lat},${KAABA.lng}`;
        }

        // Rotate compass dial against current device heading
        // When device turns by `deviceHeading`, dial turns counter-clockwise: -deviceHeading
        if (compassDial) {
            compassDial.style.transform = `rotate(${-deviceHeading}deg)`;
        }

        // Position the Kaaba marker at exact qiblaBearing on the dial ring
        if (kaabaMarker) {
            kaabaMarker.style.transform = `rotate(${qiblaBearing}deg)`;
        }

        if (headingDisplay) {
            headingDisplay.textContent = `Arah Perangkat: ${Math.round(deviceHeading)}°`;
        }

        // Check if device is facing Qibla within ±3 degrees
        let diff = Math.abs(deviceHeading - qiblaBearing);
        if (diff > 180) diff = 360 - diff;

        const compassRing = document.getElementById('compass-circle-outer');
        if (diff <= 3) {
            if (statusBox) {
                statusBox.innerHTML = `
                    <div class="kiblat-aligned-banner">
                        <span>🕋</span> <strong>Tepat Menghadap Kiblat!</strong> (${qiblaBearing.toFixed(1)}°)
                    </div>
                `;
            }
            if (compassRing) compassRing.classList.add('aligned');

            if (!hasVibrated && navigator.vibrate) {
                try { navigator.vibrate(120); } catch (e) {}
                hasVibrated = true;
            }
        } else {
            hasVibrated = false;
            if (compassRing) compassRing.classList.remove('aligned');
            if (statusBox) {
                const turnDirection = ((qiblaBearing - deviceHeading + 360) % 360 < 180) ? 'kanan ↷' : 'kiri ↶';
                statusBox.innerHTML = `
                    <div class="kiblat-hint-banner">
                        <span>🧭</span> Putar perangkat <strong>${diff.toFixed(0)}° ke ${turnDirection}</strong> untuk mengarah ke Ka'bah
                    </div>
                `;
            }
        }
    }

    function setLocation(lat, lng, name) {
        userLocation = { lat, lng, name };
        const res = calculateQibla(lat, lng);
        qiblaBearing = res.bearing;
        distanceKm = res.distance;
        updateCompassDisplay();
    }

    function onCitySelectChange(cityName) {
        if (!cityName) return;
        const c = INDONESIA_CITIES[cityName];
        if (c) {
            setLocation(c.lat, c.lng, `${cityName}, Indonesia`);
            showToast(`Lokasi diatur ke ${cityName}`);
        }
    }

    function detectGPS() {
        if (!navigator.geolocation) {
            showToast('Browser Anda tidak mendukung deteksi lokasi GPS.');
            return;
        }

        const btn = document.getElementById('btn-detect-gps');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span>⏳</span> Mendeteksi Lokasi...';
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<span>🎯</span> Deteksi Lokasi Saya (GPS)';
                }
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setLocation(lat, lng, `GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
                showToast('Lokasi GPS berhasil terkunci! 📍');

                // Sync city select
                const citySelect = document.getElementById('kiblat-city-select');
                if (citySelect) citySelect.value = '';
            },
            (err) => {
                console.warn('GPS error:', err);
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<span>🎯</span> Deteksi Lokasi Saya (GPS)';
                }
                showToast('Izin GPS ditolak atau tidak tersedia. Menggunakan lokasi default.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    // Orientation event listener
    function handleOrientation(e) {
        let heading = null;

        // iOS Safari webkitCompassHeading (0 = North, clockwise)
        if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
            heading = e.webkitCompassHeading;
        } else if (e.alpha !== undefined && e.alpha !== null) {
            // Android Chrome / Standard orientation
            // In absolute orientation: alpha is counter-clockwise degrees from North
            if (e.absolute === true || window.hasAbsoluteOrientation) {
                heading = 360 - e.alpha;
            } else {
                heading = 360 - e.alpha;
            }
        }

        if (heading !== null && !isNaN(heading)) {
            sensorAvailable = true;
            deviceHeading = (heading + 360) % 360;
            updateCompassDisplay();
            const sensorStatus = document.getElementById('kiblat-sensor-status');
            if (sensorStatus) sensorStatus.style.display = 'none';
        }
    }

    function requestSensorPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(state => {
                    if (state === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation, true);
                        showToast('Sensor kompas diaktifkan!');
                        const btn = document.getElementById('btn-enable-sensor');
                        if (btn) btn.style.display = 'none';
                    } else {
                        showToast('Izin sensor gerak tidak diberikan.');
                    }
                })
                .catch(err => {
                    console.error('Permission error:', err);
                    showToast('Gagal meminta izin sensor.');
                });
        } else {
            // Non-iOS or older browser
            if (window.DeviceOrientationAbsoluteEvent) {
                window.addEventListener('deviceorientationabsolute', (e) => {
                    window.hasAbsoluteOrientation = true;
                    handleOrientation(e);
                }, true);
            }
            window.addEventListener('deviceorientation', handleOrientation, true);
            showToast('Mendengarkan sensor kompas perangkat...');
            const btn = document.getElementById('btn-enable-sensor');
            if (btn) btn.style.display = 'none';
        }
    }

    function init() {
        // Inherit GPS from previous prayer times if saved
        try {
            const saved = localStorage.getItem('sm_prayer_location');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.lat && parsed.lng) {
                    setLocation(parseFloat(parsed.lat), parseFloat(parsed.lng), parsed.city || `Lokasi Tersimpan`);
                } else {
                    setLocation(-6.2088, 106.8456, "Jakarta, Indonesia");
                }
            } else {
                setLocation(-6.2088, 106.8456, "Jakarta, Indonesia");
            }
        } catch (e) {
            setLocation(-6.2088, 106.8456, "Jakarta, Indonesia");
        }

        // Try auto GPS if supported
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => setLocation(pos.coords.latitude, pos.coords.longitude, `GPS (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`),
                () => {},
                { timeout: 5000, enableHighAccuracy: false }
            );
        }

        // Setup orientation listeners
        if (window.DeviceOrientationAbsoluteEvent) {
            window.addEventListener('deviceorientationabsolute', (e) => {
                window.hasAbsoluteOrientation = true;
                handleOrientation(e);
            }, true);
        }
        window.addEventListener('deviceorientation', handleOrientation, true);

        // Check if iOS needs button permission
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            const btn = document.getElementById('btn-enable-sensor');
            if (btn) btn.style.display = 'inline-flex';
        }

        updateCompassDisplay();
    }

    window.smKiblat = {
        init,
        onCitySelectChange,
        detectGPS,
        requestSensorPermission
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
