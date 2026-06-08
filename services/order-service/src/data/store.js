// ---------------------------------------------------------------------------
// Order Service – persistence layer (MySQL via mysql2/promise).
//
// Every function is async and maps 1-to-1 to the previous in-memory Map API
// so app.js only needs `await` added — no logic changes.
//
// DB connection is configured via env vars (see docker-compose.yml). The
// defaults below point at the dedicated Orders MySQL instance defined in
// docker-compose (container `mysql-orders`, schema `aether_orders`). NEVER
// point the Order Service at the catalogue database — that would silently
// corrupt the Orders schema (Database-per-Service, ADR11).
//   DB_HOST     → mysql-orders   (defaults to this; do not change to `mysql`)
//   DB_USER     → root
//   DB_PASSWORD → root_pass
//   DB_NAME     → aether_orders
// ---------------------------------------------------------------------------

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'mysql-orders',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'root_pass',
  database: process.env.DB_NAME     || 'aether_orders',
  charset:  'utf8mb4',
  waitForConnections: true,
  connectionLimit: 5,
});

// Verify DB connectivity on startup with retries
(async () => {
  const MAX_RETRIES = 10;
  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('[store] MySQL connection established');
      return;
    } catch (err) {
      console.warn(`[store] MySQL not ready (attempt ${i}/${MAX_RETRIES}): ${err.message}`);
      if (i < MAX_RETRIES) await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.error('[store] Could not connect to MySQL after retries');
})();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Convert a DB row (PascalCase, JSON strings) back to the order object shape
// the rest of the service expects.
function rowToOrder(row) {
  return {
    id:            row.OrderRef,
    orderId:       row.OrderRef,
    status:        row.Status,
    type:          row.Type,
    cartReference: row.CartReference,
    vehicleId:     row.VehicleId,
    vehicleName:   row.VehicleName,
    config:        row.Config   ? JSON.parse(row.Config)   : null,
    customer:      row.Customer ? JSON.parse(row.Customer) : {},
    address:       row.Address  ? JSON.parse(row.Address)  : null,
    items:         row.Items    ? JSON.parse(row.Items)    : [],
    totals:        row.Totals   ? JSON.parse(row.Totals)   : {},
    createdAt:     row.CreatedAt instanceof Date
                     ? row.CreatedAt.toISOString()
                     : row.CreatedAt,
    updatedAt:     row.UpdatedAt instanceof Date
                     ? row.UpdatedAt.toISOString()
                     : row.UpdatedAt,
  };
}

function j(value) {
  return value != null ? JSON.stringify(value) : null;
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

async function createOrder(order) {
  await pool.query(
    `INSERT INTO Orders
       (OrderRef, Status, Type, CartReference, VehicleId, VehicleName,
        Config, Customer, Address, Items, Totals)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      order.id,
      order.status,
      order.type          || null,
      order.cartReference || null,
      order.vehicleId     || null,
      order.vehicleName   || null,
      j(order.config),
      j(order.customer),
      j(order.address),
      j(order.items),
      j(order.totals),
    ]
  );
  return order;
}

async function getOrderById(orderId) {
  const [rows] = await pool.query(
    'SELECT * FROM Orders WHERE OrderRef = ?',
    [orderId]
  );
  return rows.length > 0 ? rowToOrder(rows[0]) : null;
}

async function getAllOrders() {
  const [rows] = await pool.query('SELECT * FROM Orders ORDER BY CreatedAt DESC');
  return rows.map(rowToOrder);
}

async function saveOrder(order) {
  await pool.query(
    `UPDATE Orders
     SET Status = ?, Config = ?, Customer = ?, Address = ?,
         Items = ?, Totals = ?, VehicleId = ?, VehicleName = ?
     WHERE OrderRef = ?`,
    [
      order.status,
      j(order.config),
      j(order.customer),
      j(order.address),
      j(order.items),
      j(order.totals),
      order.vehicleId   || null,
      order.vehicleName || null,
      order.id,
    ]
  );
  return order;
}

async function deleteOrder(orderId) {
  const [result] = await pool.query(
    'DELETE FROM Orders WHERE OrderRef = ?',
    [orderId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  saveOrder,
  deleteOrder,
};
