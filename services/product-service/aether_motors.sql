DROP DATABASE IF EXISTS aether_motors;

CREATE DATABASE aether_motors
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE aether_motors;

-- =====================================================
-- VEHICLES
-- =====================================================

CREATE TABLE Vehicles (
    VehicleID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    VehicleSlug VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(255) NOT NULL,
    Subtitle VARCHAR(255),
    ImageUrl TEXT,
    BasePrice DECIMAL(12,2) NOT NULL DEFAULT 0,

    Horsepower INT DEFAULT 0,

    Acceleration DECIMAL(4,2),
    AccelerationUnit VARCHAR(20) DEFAULT 's',

    RangeValue INT,
    RangeUnit VARCHAR(20) DEFAULT 'km',

    TopSpeed INT,
    TopSpeedUnit VARCHAR(20) DEFAULT 'km/h',

    Number_of_Seats INT NOT NULL DEFAULT 4,

    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- COLORS
-- =====================================================

CREATE TABLE Colors (
    ColorID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ColorSlug VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    HexFrom VARCHAR(7) NOT NULL,
    HexTo VARCHAR(7),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- WHEELS
-- =====================================================

CREATE TABLE Wheels (
    WheelID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    WheelSlug VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(255),
    IconName VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- INTERIORS
-- =====================================================

CREATE TABLE Interiors (
    InteriorID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    InteriorSlug VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    Material VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- SUSPENSIONS
-- =====================================================

CREATE TABLE Suspensions (
    SuspensionID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    SuspensionSlug VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- EXHAUSTS
-- =====================================================

CREATE TABLE Exhausts (
    ExhaustID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ExhaustSlug VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- VEHICLE AVAILABLE COLORS
-- =====================================================

CREATE TABLE VehicleAvailableColors (
    VehicleID INT UNSIGNED NOT NULL,
    ColorID INT UNSIGNED NOT NULL,
    AdditionalPrice DECIMAL(12,2) NOT NULL DEFAULT 0,
    SortOrder INT DEFAULT 0,

    PRIMARY KEY (VehicleID, ColorID),

    FOREIGN KEY (VehicleID)
        REFERENCES Vehicles(VehicleID)
        ON DELETE CASCADE,

    FOREIGN KEY (ColorID)
        REFERENCES Colors(ColorID)
        ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- VEHICLE AVAILABLE WHEELS
-- =====================================================

CREATE TABLE VehicleAvailableWheels (
    VehicleID INT UNSIGNED NOT NULL,
    WheelID INT UNSIGNED NOT NULL,
    AdditionalPrice DECIMAL(12,2) NOT NULL DEFAULT 0,
    SortOrder INT DEFAULT 0,

    PRIMARY KEY (VehicleID, WheelID),

    FOREIGN KEY (VehicleID)
        REFERENCES Vehicles(VehicleID)
        ON DELETE CASCADE,

    FOREIGN KEY (WheelID)
        REFERENCES Wheels(WheelID)
        ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- VEHICLE AVAILABLE INTERIORS
-- =====================================================

CREATE TABLE VehicleAvailableInteriors (
    VehicleID INT UNSIGNED NOT NULL,
    InteriorID INT UNSIGNED NOT NULL,
    AdditionalPrice DECIMAL(12,2) NOT NULL DEFAULT 0,
    SortOrder INT DEFAULT 0,

    PRIMARY KEY (VehicleID, InteriorID),

    FOREIGN KEY (VehicleID)
        REFERENCES Vehicles(VehicleID)
        ON DELETE CASCADE,

    FOREIGN KEY (InteriorID)
        REFERENCES Interiors(InteriorID)
        ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- VEHICLE AVAILABLE SUSPENSIONS
-- =====================================================

CREATE TABLE VehicleAvailableSuspensions (
    VehicleID INT UNSIGNED NOT NULL,
    SuspensionID INT UNSIGNED NOT NULL,
    AdditionalPrice DECIMAL(12,2) NOT NULL DEFAULT 0,
    SortOrder INT DEFAULT 0,

    PRIMARY KEY (VehicleID, SuspensionID),

    FOREIGN KEY (VehicleID)
        REFERENCES Vehicles(VehicleID)
        ON DELETE CASCADE,

    FOREIGN KEY (SuspensionID)
        REFERENCES Suspensions(SuspensionID)
        ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- VEHICLE AVAILABLE EXHAUSTS
-- =====================================================

CREATE TABLE VehicleAvailableExhausts (
    VehicleID INT UNSIGNED NOT NULL,
    ExhaustID INT UNSIGNED NOT NULL,
    AdditionalPrice DECIMAL(12,2) NOT NULL DEFAULT 0,
    SortOrder INT DEFAULT 0,

    PRIMARY KEY (VehicleID, ExhaustID),

    FOREIGN KEY (VehicleID)
        REFERENCES Vehicles(VehicleID)
        ON DELETE CASCADE,

    FOREIGN KEY (ExhaustID)
        REFERENCES Exhausts(ExhaustID)
        ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- MERCHANDISE
-- =====================================================

CREATE TABLE Merchandise (
    MerchandiseID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MerchandiseSlug VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    Price DECIMAL(12,2) NOT NULL DEFAULT 0,
    ImageUrl TEXT,
    Category VARCHAR(50) NOT NULL,
    Featured BOOLEAN DEFAULT FALSE,
    Badge VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =====================================================
-- GLOBAL OPTIONS DATA
-- =====================================================

INSERT INTO Colors (ColorSlug, Name, HexFrom, HexTo)
VALUES
('metallic-blue', 'Metallic Blue', '#00daf8', '#004e5a'),
('matte-charcoal', 'Matte Charcoal', '#292a2b', '#1a1a1a'),
('pearl-white', 'Pearl White', '#e3e2e3', '#c4c4c4');

INSERT INTO Wheels (WheelSlug, Name, Description, IconName)
VALUES
('aero-blade-21', '21" Aero Blade', 'Optimized Drag', 'blur_circular'),
('onyx-turbine-22', '22" Onyx Turbine', 'Forged Carbon', 'toll');

INSERT INTO Interiors (InteriorSlug, Name, Material)
VALUES
('cyber-knit', 'Cyber Knit', 'Recycled PET'),
('vegan-suede', 'Vegan Suede', 'Active Mesh'),
('leather-package', 'Leather Package', 'Premium Leather');

INSERT INTO Suspensions (SuspensionSlug, Name, Description)
VALUES
('standard-suspension', 'Standard', 'Balanced everyday suspension setup'),
('sport-suspension', 'Sport', 'Performance oriented sport suspension');

INSERT INTO Exhausts (ExhaustSlug, Name, Description)
VALUES
('standard-exhaust', 'Standard', 'Standard refined exhaust system'),
('sport-exhaust', 'Sport', 'High performance sport exhaust system');

-- =====================================================
-- VEHICLES DATA
-- =====================================================

INSERT INTO Vehicles (
VehicleSlug,
Name,
Subtitle,
ImageUrl,
BasePrice,
Horsepower,
Acceleration,
RangeValue,
TopSpeed,
Number_of_Seats
)
VALUES
(
'project-zenith',
'Project Zenith',
'V12 Hybrid Concept',
'https://example.com/project-zenith.jpg',
142000,
980,
1.9,
640,
325,
4
),
(
'hollerith-turbo-s',
'Hollerith Turbo S',
'High performance executive hyper sedan',
'https://example.com/hollerith-turbo-s.jpg',
195000,
890,
2.7,
710,
340,
4
),
(
'digital-business-cabrio',
'Digital Business Cabrio',
'Luxury executive convertible',
'https://example.com/digital-business-cabrio.jpg',
280000,
620,
3.9,
720,
290,
2
),
(
'herman-offroad-vehicle',
'Herman Offroad Vehicle',
'High performance luxury SUV',
'https://example.com/herman-offroad.jpg',
240000,
780,
4.6,
680,
260,
5
),
(
'herman-grand-tourer',
'Herman Grand Tourer',
'Ultra luxury high performance coupe',
'https://example.com/herman-grand-tourer.jpg',
520000,
1150,
2.4,
860,
390,
2
);

-- =====================================================
-- ASSIGN COLORS TO ALL VEHICLES
-- =====================================================

INSERT INTO VehicleAvailableColors (VehicleID, ColorID, AdditionalPrice, SortOrder)
SELECT v.VehicleID, c.ColorID,
CASE
    WHEN c.ColorSlug = 'metallic-blue' THEN 0
    WHEN c.ColorSlug = 'matte-charcoal' THEN 2200
    WHEN c.ColorSlug = 'pearl-white' THEN 1800
END,
c.ColorID
FROM Vehicles v
CROSS JOIN Colors c;

-- =====================================================
-- ASSIGN WHEELS
-- =====================================================

INSERT INTO VehicleAvailableWheels (VehicleID, WheelID, AdditionalPrice, SortOrder)
SELECT v.VehicleID, w.WheelID,
CASE
    WHEN w.WheelSlug = 'aero-blade-21' THEN 0
    ELSE 4500
END,
w.WheelID
FROM Vehicles v
CROSS JOIN Wheels w
WHERE v.VehicleSlug != 'herman-offroad-vehicle';

-- =====================================================
-- ASSIGN INTERIORS
-- =====================================================

INSERT INTO VehicleAvailableInteriors (VehicleID, InteriorID, AdditionalPrice, SortOrder)
SELECT v.VehicleID, i.InteriorID,
CASE
    WHEN i.InteriorSlug = 'cyber-knit' THEN 0
    WHEN i.InteriorSlug = 'vegan-suede' THEN 3200
    WHEN i.InteriorSlug = 'leather-package' THEN 10000
END,
i.InteriorID
FROM Vehicles v
CROSS JOIN Interiors i
WHERE v.VehicleSlug != 'herman-offroad-vehicle';

-- =====================================================
-- ASSIGN SUSPENSIONS
-- =====================================================

INSERT INTO VehicleAvailableSuspensions (VehicleID, SuspensionID, AdditionalPrice, SortOrder)
SELECT v.VehicleID, s.SuspensionID,
CASE
    WHEN s.SuspensionSlug = 'standard-suspension' THEN 0
    ELSE 5000
END,
s.SuspensionID
FROM Vehicles v
CROSS JOIN Suspensions s;

-- =====================================================
-- ASSIGN EXHAUSTS
-- =====================================================

INSERT INTO VehicleAvailableExhausts (VehicleID, ExhaustID, AdditionalPrice, SortOrder)
SELECT v.VehicleID, e.ExhaustID,
CASE
    WHEN e.ExhaustSlug = 'standard-exhaust' THEN 0
    ELSE 5000
END,
e.ExhaustID
FROM Vehicles v
CROSS JOIN Exhausts e;

-- =====================================================
-- MERCHANDISE DATA
-- =====================================================

INSERT INTO Merchandise (
MerchandiseSlug,
Name,
Description,
Price,
ImageUrl,
Category,
Featured,
Badge
)
VALUES
(
'zenith-shell-v1',
'ZENITH SHELL V.1',
'Waterproof modular jacket with haptic feedback sensors',
450,
'https://example.com/zenith-shell-v1.jpg',
'technical',
TRUE,
NULL
),
(
'chronos-ti-link',
'CHRONOS TI-LINK',
'Precision machined titanium wearable',
1200,
'https://example.com/chronos-ti-link.jpg',
'collectibles',
FALSE,
'LIMITED'
),
(
'velocity-01-shoe',
'VELOCITY 01 SHOE',
'Driving performance shoe',
280,
'https://example.com/velocity-01-shoe.jpg',
'technical',
FALSE,
NULL
),
(
'zenith-diecast-1-18',
'1:18 ZENITH DIECAST',
'Hand-assembled precision scale model',
550,
'https://example.com/zenith-diecast.jpg',
'collectibles',
FALSE,
NULL
),
(
'schematic-tee',
'SCHEMATIC TEE',
'100% organic heavy-weight cotton',
85,
'https://example.com/schematic-tee.jpg',
'apparel',
FALSE,
NULL
);

COMMIT;

