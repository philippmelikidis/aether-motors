(function () {
  function initPresentationMap() {
    const mapElement = document.getElementById("presentation-map");
    if (!mapElement) {
      console.warn("[presentation-map] #presentation-map element not found");
      return;
    }

    if (typeof window.L === "undefined") {
      console.warn("[presentation-map] Leaflet is not loaded");
      return;
    }

    if (mapElement.dataset.initialized === "true") {
      return;
    }
    mapElement.dataset.initialized = "true";

    const statusText = document.querySelector("[data-status-text]");
    const statusDot = document.querySelector("[data-status-dot]");
    const telemetryStatus = document.querySelector("[data-telemetry-status]");
    const telemetryUpdate = document.querySelector("[data-telemetry-update]");
    const telemetrySync = document.querySelector("[data-telemetry-sync]");
    const progressBar = document.querySelector("[data-telemetry-progress-bar]");
    const progressDot = document.querySelector("[data-telemetry-progress-dot]");
    const startButton = document.querySelector("[data-action-start]");
    const stopButton = document.querySelector("[data-action-stop]");
    const arrivalEta = document.querySelector("[data-arrival-eta]");

    const map = window.L.map(mapElement, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([48.7758, 9.1829], 13);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const carIcon = window.L.divIcon({
      className: "",
      html: "<div class=\"presentation-car-icon\"></div>",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const destinationIcon = window.L.divIcon({
      className: "",
      html: "<div class=\"presentation-destination-icon\"></div>",
      iconSize: [24, 24],
      iconAnchor: [12, 20],
    });

    let destinationMarker = null;
    let carMarker = null;
    let routeLine = null;
    let lastStatus = "idle";
    let pollTimer = null;

    function asLatLng(position) {
      if (!position) {
        return null;
      }

      const latValue = position.lat ?? position[0];
      const lngValue = position.lng ?? position[1];
      const lat = Number(latValue);
      const lng = Number(lngValue);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      return [lat, lng];
    }

    function refreshMapSize() {
      window.setTimeout(function () {
        map.invalidateSize();
      }, 100);
    }

    function setStatus(status) {
      lastStatus = status || "idle";
      if (statusText) statusText.textContent = lastStatus;
      if (telemetryStatus) telemetryStatus.textContent = lastStatus;

      const dotClasses = ["bg-primary", "bg-emerald-400", "bg-red-500", "bg-white/40"];
      if (statusDot) {
        dotClasses.forEach((cls) => statusDot.classList.remove(cls));
        if (lastStatus === "driving") statusDot.classList.add("bg-primary");
        else if (lastStatus === "arrived") statusDot.classList.add("bg-emerald-400");
        else if (lastStatus === "offline") statusDot.classList.add("bg-red-500");
        else statusDot.classList.add("bg-white/40");
      }

      if (startButton) startButton.disabled = lastStatus === "driving";
      if (stopButton) stopButton.disabled = lastStatus === "idle";
    }

    function setSyncStatus(isOnline) {
      if (telemetrySync) telemetrySync.textContent = isOnline ? "Connected" : "Offline";
    }

    function updateArrivalEta(status, eta) {
      if (!arrivalEta) return;

      if (status === "driving" && eta) {
        arrivalEta.textContent = eta;
        arrivalEta.classList.remove("text-on-surface/40");
      } else {
        arrivalEta.textContent = "—";
        arrivalEta.classList.add("text-on-surface/40");
      }
    }

    function updateProgress(progress) {
      if (typeof progress !== "number") return;
      const clamped = Math.max(0, Math.min(100, progress));
      if (progressBar) progressBar.style.width = clamped + "%";
      if (progressDot) progressDot.style.left = clamped + "%";
    }

    function updateLastUpdate(timestamp) {
      if (!telemetryUpdate) return;
      if (!timestamp) {
        telemetryUpdate.textContent = "—";
        return;
      }
      const date = new Date(timestamp);
      telemetryUpdate.textContent = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }

    async function loadDestination() {
      const response = await fetch("/api/presentation/destination", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Destination offline");
      const payload = await response.json();
      const route = Array.isArray(payload.route) ? payload.route : [];

      const destinationLatLng = asLatLng(payload.destination && payload.destination.position);
      if (destinationLatLng) {
        if (!destinationMarker) {
          destinationMarker = window.L.marker(destinationLatLng, {
            icon: destinationIcon,
          }).addTo(map);
        } else {
          destinationMarker.setLatLng(destinationLatLng);
        }
      }

      if (route.length >= 2) {
        const latLngs = route
          .map((point) => asLatLng(point))
          .filter(Boolean);

        if (latLngs.length >= 2) {
          if (!routeLine) {
            routeLine = window.L.polyline(latLngs, {
              color: "#00daf8",
              weight: 4,
              opacity: 0.6,
              dashArray: "10 8",
            }).addTo(map);
          } else {
            routeLine.setLatLngs(latLngs);
          }
          map.fitBounds(routeLine.getBounds(), { padding: [80, 80] });
          refreshMapSize();
        }
      }
    }

    async function loadCar() {
      const response = await fetch("/api/presentation/car", { cache: "no-store" });
      if (!response.ok) throw new Error("Car offline");
      const payload = await response.json();

      const carLatLng = asLatLng(payload.position);
      if (carLatLng) {
        if (!carMarker) {
          carMarker = window.L.marker(carLatLng, { icon: carIcon }).addTo(map);
        } else {
          carMarker.setLatLng(carLatLng);
        }
      }

      const status = payload.status || "idle";
      setStatus(status);
      updateArrivalEta(status, payload.arrivalEta);
      updateProgress(payload.progress);
      updateLastUpdate(payload.updatedAt);
    }

    function startPolling() {
      if (pollTimer) return;
      pollTimer = window.setInterval(() => {
        loadCar().catch((error) => {
          console.warn("[presentation-map] Failed to refresh car", error);
          setStatus("offline");
        });
      }, 1000);
    }

    function stopPolling() {
      if (!pollTimer) return;
      window.clearInterval(pollTimer);
      pollTimer = null;
    }

    async function startSimulation() {
      if (!startButton) return;
      startButton.disabled = true;
      try {
        await fetch("/api/presentation/car/start", { method: "POST" });
        await loadCar();
        startPolling();
      } catch (error) {
        console.warn("[presentation-map] Failed to start simulation", error);
        startButton.disabled = false;
      }
    }

    async function stopSimulation() {
      if (!stopButton) return;
      stopButton.disabled = true;
      try {
        await fetch("/api/presentation/car/stop", { method: "POST" });
        await loadCar();
        stopPolling();
      } catch (error) {
        console.warn("[presentation-map] Failed to stop simulation", error);
        stopButton.disabled = false;
      }
    }

    if (startButton) startButton.addEventListener("click", startSimulation);
    if (stopButton) stopButton.addEventListener("click", stopSimulation);

    refreshMapSize();
    window.addEventListener("resize", refreshMapSize);

    loadDestination().catch((error) => {
      console.warn("[presentation-map] Failed to load destination", error);
    });

    loadCar().catch((error) => {
      console.warn("[presentation-map] Failed to load car", error);
      setStatus("offline");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPresentationMap);
  } else {
    initPresentationMap();
  }
})();
