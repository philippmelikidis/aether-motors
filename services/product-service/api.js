/**
 * PRODUCT SERVICE - BACKEND / API
 * 
 * Nur API Endpoints (JSON) - Für andere Microservices
 * Diese Datei wird von anderen Services verwendet
 * 
 * Port: 3001 (konfigurierbar via PORT env)
 * Endpoints: /api/vehicles, /api/merchandise, /api/search, /health
 */

const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// DB CONNECTION POOL
// =========================
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "aether_motors",
    waitForConnections: true,
    connectionLimit: 10
});

// =========================
// VEHICLES API
// =========================

/**
 * GET /api/vehicles
 * Alle Fahrzeuge (mit optionalen Filtern)
 * 
 * Query Parameters:
 *   - minPrice, maxPrice
 *   - minHorsepower, maxHorsepower
 *   - minRange, maxRange
 *   - seats
 */
app.get("/api/vehicles", async (req, res) => {
    try {
        const { minPrice, maxPrice, minHorsepower, maxHorsepower, minRange, maxRange, seats } = req.query;

        let query = "SELECT * FROM Vehicles WHERE 1=1";
        const params = [];

        if (minPrice) {
            query += " AND BasePrice >= ?";
            params.push(minPrice);
        }
        if (maxPrice) {
            query += " AND BasePrice <= ?";
            params.push(maxPrice);
        }
        if (minHorsepower) {
            query += " AND Horsepower >= ?";
            params.push(minHorsepower);
        }
        if (maxHorsepower) {
            query += " AND Horsepower <= ?";
            params.push(maxHorsepower);
        }
        if (minRange) {
            query += " AND RangeValue >= ?";
            params.push(minRange);
        }
        if (maxRange) {
            query += " AND RangeValue <= ?";
            params.push(maxRange);
        }
        if (seats) {
            query += " AND Number_of_Seats = ?";
            params.push(seats);
        }

        query += " ORDER BY Name ASC";

        const [rows] = await db.query(query, params);
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/vehicles/:slug
 * Fahrzeug Details mit allen verfügbaren Optionen
 */
app.get("/api/vehicles/:slug", async (req, res) => {
    try {
        const slug = req.params.slug;

        const [vehicle] = await db.query(
            "SELECT * FROM Vehicles WHERE VehicleSlug = ?",
            [slug]
        );

        if (vehicle.length === 0) {
            return res.status(404).json({ success: false, error: "Vehicle not found" });
        }

        const vehicleData = vehicle[0];
        const vehicleID = vehicleData.VehicleID;

        // Parallele Queries für alle Optionen
        const [colors] = await db.query(`
            SELECT c.*, vac.AdditionalPrice, vac.SortOrder
            FROM Colors c
            JOIN VehicleAvailableColors vac ON c.ColorID = vac.ColorID
            WHERE vac.VehicleID = ?
            ORDER BY vac.SortOrder ASC
        `, [vehicleID]);

        const [wheels] = await db.query(`
            SELECT w.*, vaw.AdditionalPrice, vaw.SortOrder
            FROM Wheels w
            JOIN VehicleAvailableWheels vaw ON w.WheelID = vaw.WheelID
            WHERE vaw.VehicleID = ?
            ORDER BY vaw.SortOrder ASC
        `, [vehicleID]);

        const [interiors] = await db.query(`
            SELECT i.*, vai.AdditionalPrice, vai.SortOrder
            FROM Interiors i
            JOIN VehicleAvailableInteriors vai ON i.InteriorID = vai.InteriorID
            WHERE vai.VehicleID = ?
            ORDER BY vai.SortOrder ASC
        `, [vehicleID]);

        const [suspensions] = await db.query(`
            SELECT s.*, vas.AdditionalPrice, vas.SortOrder
            FROM Suspensions s
            JOIN VehicleAvailableSuspensions vas ON s.SuspensionID = vas.SuspensionID
            WHERE vas.VehicleID = ?
            ORDER BY vas.SortOrder ASC
        `, [vehicleID]);

        const [exhausts] = await db.query(`
            SELECT e.*, vae.AdditionalPrice, vae.SortOrder
            FROM Exhausts e
            JOIN VehicleAvailableExhausts vae ON e.ExhaustID = vae.ExhaustID
            WHERE vae.VehicleID = ?
            ORDER BY vae.SortOrder ASC
        `, [vehicleID]);

        res.json({
            success: true,
            vehicle: vehicleData,
            options: {
                colors,
                wheels,
                interiors,
                suspensions,
                exhausts
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// =========================
// MERCHANDISE API
// =========================

/**
 * GET /api/merchandise
 * Alle Produkte (mit optionalen Filtern)
 * 
 * Query Parameters:
 *   - category
 *   - minPrice, maxPrice
 *   - featured (true/false)
 *   - search
 */
app.get("/api/merchandise", async (req, res) => {
    try {
        const { category, minPrice, maxPrice, featured, search } = req.query;

        let query = "SELECT * FROM Merchandise WHERE 1=1";
        const params = [];

        if (category) {
            query += " AND Category = ?";
            params.push(category);
        }
        if (minPrice) {
            query += " AND Price >= ?";
            params.push(minPrice);
        }
        if (maxPrice) {
            query += " AND Price <= ?";
            params.push(maxPrice);
        }
        if (featured === "true") {
            query += " AND Featured = TRUE";
        }
        if (search) {
            query += " AND (Name LIKE ? OR Description LIKE ?)";
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += " ORDER BY CreatedAt DESC";

        const [rows] = await db.query(query, params);
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/merchandise/:slug
 * Produkt Details
 */
app.get("/api/merchandise/:slug", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM Merchandise WHERE MerchandiseSlug = ?",
            [req.params.slug]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/merchandise/categories
 * Alle verfügbaren Kategorien
 */
app.get("/api/merchandise/categories", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DISTINCT Category FROM Merchandise ORDER BY Category ASC"
        );
        const categories = rows.map(row => row.Category);
        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// =========================
// OPTIONS API (Global Configuration)
// =========================

/**
 * GET /api/options/colors
 * Alle Farben
 */
app.get("/api/options/colors", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM Colors ORDER BY Name ASC");
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/options/wheels
 * Alle Räder
 */
app.get("/api/options/wheels", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM Wheels ORDER BY Name ASC");
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/options/interiors
 * Alle Innenausstattungen
 */
app.get("/api/options/interiors", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM Interiors ORDER BY Name ASC");
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/options/suspensions
 * Alle Fahrwerke
 */
app.get("/api/options/suspensions", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM Suspensions ORDER BY Name ASC");
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/options/exhausts
 * Alle Auspuffanlagen
 */
app.get("/api/options/exhausts", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM Exhausts ORDER BY Name ASC");
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// =========================
// SEARCH API
// =========================

/**
 * GET /api/search?q=query
 * Durchsucht Fahrzeuge und Merchandise
 */
app.get("/api/search", async (req, res) => {
    const q = req.query.q;

    if (!q) {
        return res.status(400).json({ 
            success: false, 
            error: "Query parameter 'q' is required" 
        });
    }

    try {
        const likeQuery = `%${q}%`;

        const [vehicles] = await db.query(
            "SELECT * FROM Vehicles WHERE Name LIKE ? OR Subtitle LIKE ? ORDER BY Name ASC",
            [likeQuery, likeQuery]
        );

        const [merchandise] = await db.query(
            "SELECT * FROM Merchandise WHERE Name LIKE ? OR Description LIKE ? ORDER BY Name ASC",
            [likeQuery, likeQuery]
        );

        res.json({
            success: true,
            query: q,
            vehicles,
            merchandise
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// =========================
// FILTER RANGES API
// =========================

/**
 * GET /api/filters/price-ranges
 * Minimum und Maximum Preise für Filter
 */
app.get("/api/filters/price-ranges", async (req, res) => {
    try {
        const [vehiclePrices] = await db.query(
            "SELECT MIN(BasePrice) as minPrice, MAX(BasePrice) as maxPrice FROM Vehicles"
        );
        const [merchPrices] = await db.query(
            "SELECT MIN(Price) as minPrice, MAX(Price) as maxPrice FROM Merchandise"
        );

        res.json({
            success: true,
            vehicles: vehiclePrices[0],
            merchandise: merchPrices[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// =========================
// HEALTH CHECK
// =========================

/**
 * GET /health
 * Health Check für Monitoring & Load Balancer
 */
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Product Info Service (API) is running",
        timestamp: new Date().toISOString()
    });
});

// =========================
// 404 HANDLER
// =========================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "API endpoint not found",
        hint: "Use /api/* endpoints"
    });
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log(`🚀 Product Info Service - API/Backend running on http://localhost:${PORT}`);
    console.log(`📊 Database: aether_motors`);
    console.log(`📝 Available: /api/vehicles, /api/merchandise, /api/search, /health`);
});
