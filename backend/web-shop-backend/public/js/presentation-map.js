(function () {
  // Tile providers — both are free, no API key. Dark = brand fit by default.
  const TILE_LAYERS = [
    {
      id: "dark",
      label: "Dark",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution:
        '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap',
      paneClass: "tiles-dark",
    },
    {
      id: "street",
      label: "Streets",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "&copy; OpenStreetMap contributors",
      paneClass: "tiles-light",
    },
  ];

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

    if (mapElement.dataset.initialized === "true") return;
    mapElement.dataset.initialized = "true";

    // ── DOM refs ───────────────────────────────────────────────────────
    const statusText            = document.querySelector("[data-status-text]");
    const statusDot             = document.querySelector("[data-status-dot]");
    const telemetryStatus       = document.querySelector("[data-telemetry-status]");
    const telemetryUpdate       = document.querySelector("[data-telemetry-update]");
    const progressBar           = document.querySelector("[data-telemetry-progress-bar]");
    const progressDot           = document.querySelector("[data-telemetry-progress-dot]");
    const progressValueEl       = document.querySelector("[data-telemetry-progress-value]");
    const speedValueEl          = document.querySelector("[data-speed-value]");
    const startButton           = document.querySelector("[data-action-start]");
    const stopButton            = document.querySelector("[data-action-stop]");
    const layerButton           = document.querySelector("[data-action-layer]");
    const locateButton          = document.querySelector("[data-action-locate]");
    const layerLabel            = document.querySelector("[data-layer-label]");
    const arrivalEta            = document.querySelector("[data-arrival-eta]");
    const remainingDistance     = document.querySelector("[data-remaining-distance]");
    const routeStartLabel       = document.querySelector("[data-route-start]");
    const routeDestinationLabel = document.querySelector("[data-route-destination]");
    const routeStartMini        = document.querySelector("[data-route-start-mini]");
    const routeDestinationMini  = document.querySelector("[data-route-destination-mini]");

    // ── Map setup ──────────────────────────────────────────────────────
    const map = window.L.map(mapElement, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    }).setView([48.7758, 9.1829], 12);

    let activeLayerIdx = 0;
    let tileLayer = null;

    function applyTileLayer(idx) {
      activeLayerIdx = (idx + TILE_LAYERS.length) % TILE_LAYERS.length;
      const def = TILE_LAYERS[activeLayerIdx];
      if (tileLayer) {
        map.removeLayer(tileLayer);
      }
      tileLayer = window.L.tileLayer(def.url, {
        attribution: def.attribution,
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);
      // Toggle paneClass on the tile pane
      const pane = map.getPane("tilePane");
      if (pane) {
        pane.classList.remove("tiles-dark", "tiles-light");
        pane.classList.add(def.paneClass);
      }
      if (layerLabel) {
        // Show the NEXT layer's name so users know what they'd switch to
        const next = TILE_LAYERS[(activeLayerIdx + 1) % TILE_LAYERS.length];
        layerLabel.textContent = next.label;
      }
    }

    applyTileLayer(0);

    // ── Markers / route ────────────────────────────────────────────────
    const carIcon = window.L.divIcon({
      className: "presentation-car-marker",
      html: "<div class=\"presentation-car-icon\"></div>",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    const startIcon = window.L.divIcon({
      className: "",
      html: "<div class=\"presentation-start-icon\"></div>",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const destinationIcon = window.L.divIcon({
      className: "",
      html: "<div class=\"presentation-destination-icon\"></div>",
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    let startMarker = null;
    let destinationMarker = null;
    let carMarker = null;
    let routeBaseLine = null;     // full route (faded)
    let routeProgressLine = null; // traveled portion (bright)
    let routePoints = [];
    let routeBounds = null;
    let lastStatus = "idle";
    let pollTimer = null;
    let lastDistance = null;
    let lastTimestamp = null;

    function asLatLng(position) {
      if (!position) return null;
      const lat = Number(position.lat ?? position[0]);
      const lng = Number(position.lng ?? position[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return [lat, lng];
    }

    function refreshMapSize() {
      window.setTimeout(() => map.invalidateSize(), 100);
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
      if (progressValueEl) progressValueEl.textContent = clamped.toFixed(0);

      // Update the bright "traveled" polyline overlay
      if (routePoints.length >= 2 && routeProgressLine) {
        const traveled = sliceRouteByProgress(routePoints, clamped / 100);
        routeProgressLine.setLatLngs(traveled);
      }
    }

    function updateSpeed(payload) {
      if (!speedValueEl) return;
      // Prefer the backend-supplied speed if available
      if (typeof payload.speedKph === "number" && payload.status === "driving") {
        speedValueEl.textContent = payload.speedKph.toFixed(0);
        return;
      }
      // Fallback: derive from delta-distance over delta-time
      const now = Date.now();
      if (
        lastDistance != null &&
        lastTimestamp != null &&
        typeof payload.distanceTraveledMeters === "number" &&
        payload.status === "driving"
      ) {
        const dDist = payload.distanceTraveledMeters - lastDistance;
        const dT = (now - lastTimestamp) / 1000;
        if (dT > 0 && dDist >= 0) {
          const kph = (dDist / dT) * 3.6;
          speedValueEl.textContent = Math.max(0, Math.min(400, kph)).toFixed(0);
        }
      }
      if (payload.status !== "driving") speedValueEl.textContent = "0";
      if (typeof payload.distanceTraveledMeters === "number") {
        lastDistance = payload.distanceTraveledMeters;
        lastTimestamp = now;
      }
    }

    function updateRemaining(payload) {
      if (!remainingDistance) return;
      if (payload.remainingDistance) {
        remainingDistance.textContent = payload.remainingDistance;
      }
    }

    function updateLastUpdate(timestamp) {
      if (!telemetryUpdate) return;
      if (!timestamp) {
        telemetryUpdate.textContent = "—";
        return;
      }
      const date = new Date(timestamp);
      telemetryUpdate.textContent = date.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    }

    // ── Geometry helpers ───────────────────────────────────────────────
    function haversine(a, b) {
      const R = 6371000;
      const toRad = (d) => (d * Math.PI) / 180;
      const dLat = toRad(b[0] - a[0]);
      const dLng = toRad(b[1] - a[1]);
      const lat1 = toRad(a[0]);
      const lat2 = toRad(b[0]);
      const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
    }

    function sliceRouteByProgress(points, ratio) {
      if (points.length < 2) return points.slice();
      let total = 0;
      const seg = [];
      for (let i = 1; i < points.length; i++) {
        seg.push(haversine(points[i - 1], points[i]));
        total += seg[i - 1];
      }
      let target = total * Math.max(0, Math.min(1, ratio));
      const out = [points[0]];
      for (let i = 1; i < points.length; i++) {
        if (target <= seg[i - 1]) {
          const r = target / seg[i - 1];
          out.push([
            points[i - 1][0] + (points[i][0] - points[i - 1][0]) * r,
            points[i - 1][1] + (points[i][1] - points[i - 1][1]) * r,
          ]);
          return out;
        }
        target -= seg[i - 1];
        out.push(points[i]);
      }
      return out;
    }

    // ── Loaders ────────────────────────────────────────────────────────
    async function loadDestination() {
      const response = await fetch("/api/presentation/destination", { cache: "no-store" });
      if (!response.ok) throw new Error("Destination offline");
      const payload = await response.json();
      const route = Array.isArray(payload.route) ? payload.route : [];
      const startLatLng = asLatLng(payload.start && payload.start.position);
      const destLatLng = asLatLng(payload.destination && payload.destination.position);
      const startName = (payload.start && payload.start.name) || "Start";
      const destName = (payload.destination && payload.destination.name) || "Destination";

      if (routeStartLabel) routeStartLabel.textContent = startName;
      if (routeDestinationLabel) routeDestinationLabel.textContent = destName;
      if (routeStartMini) routeStartMini.textContent = startName;
      if (routeDestinationMini) routeDestinationMini.textContent = destName;

      if (startLatLng) {
        if (!startMarker) {
          startMarker = window.L.marker(startLatLng, { icon: startIcon }).addTo(map);
          startMarker.bindTooltip(startName, {
            permanent: true,
            direction: "right",
            offset: [10, 0],
            className: "presentation-route-label",
          });
        } else {
          startMarker.setLatLng(startLatLng);
          startMarker.setTooltipContent(startName);
        }
      }

      if (destLatLng) {
        if (!destinationMarker) {
          destinationMarker = window.L.marker(destLatLng, { icon: destinationIcon }).addTo(map);
          destinationMarker.bindTooltip(destName, {
            permanent: true,
            direction: "top",
            offset: [0, -22],
            className: "presentation-route-label is-destination",
          });
        } else {
          destinationMarker.setLatLng(destLatLng);
          destinationMarker.setTooltipContent(destName);
        }
      }

      if (route.length >= 2) {
        const latLngs = route.map((p) => asLatLng(p)).filter(Boolean);
        if (latLngs.length >= 2) {
          routePoints = latLngs;
          if (!routeBaseLine) {
            routeBaseLine = window.L.polyline(latLngs, {
              color: "#94a3b8",
              weight: 5,
              opacity: 0.3,
              dashArray: "2 10",
              lineCap: "round",
            }).addTo(map);
            routeProgressLine = window.L.polyline([latLngs[0]], {
              color: "#00daf8",
              weight: 5,
              opacity: 0.95,
              lineCap: "round",
            }).addTo(map);
          } else {
            routeBaseLine.setLatLngs(latLngs);
            routeProgressLine.setLatLngs([latLngs[0]]);
          }
          routeBounds = routeBaseLine.getBounds();
          map.fitBounds(routeBounds, { padding: [100, 100] });
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
          carMarker = window.L.marker(carLatLng, { icon: carIcon, zIndexOffset: 1000 }).addTo(map);
        } else {
          carMarker.setLatLng(carLatLng);
        }
      }
      const status = payload.status || "idle";
      setStatus(status);
      updateArrivalEta(status, payload.arrivalEta);
      updateProgress(payload.progress);
      updateSpeed(payload);
      updateRemaining(payload);
      updateLastUpdate(payload.updatedAt);
    }

    function startPolling() {
      if (pollTimer) return;
      pollTimer = window.setInterval(() => {
        loadCar().catch((err) => {
          console.warn("[presentation-map] refresh failed", err);
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
      } catch (err) {
        console.warn("[presentation-map] start failed", err);
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
      } catch (err) {
        console.warn("[presentation-map] stop failed", err);
        stopButton.disabled = false;
      }
    }

    function recenter() {
      if (routeBounds) {
        map.flyToBounds(routeBounds, { padding: [100, 100], duration: 0.6 });
      } else if (carMarker) {
        map.flyTo(carMarker.getLatLng(), 13, { duration: 0.6 });
      }
    }

    if (startButton) startButton.addEventListener("click", startSimulation);
    if (stopButton) stopButton.addEventListener("click", stopSimulation);
    if (locateButton) locateButton.addEventListener("click", recenter);
    if (layerButton) layerButton.addEventListener("click", () => applyTileLayer(activeLayerIdx + 1));

    refreshMapSize();
    window.addEventListener("resize", refreshMapSize);

    loadDestination().catch((err) => console.warn("[presentation-map] destination", err));
    loadCar().catch((err) => {
      console.warn("[presentation-map] car", err);
      setStatus("offline");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPresentationMap);
  } else {
    initPresentationMap();
  }
})();
