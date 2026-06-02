-- PCMaxing – Supabase (PostgreSQL) Setup
-- Paste this into: https://app.supabase.com/project/<your-project>/sql/new

DROP TABLE IF EXISTS components;

CREATE TABLE components (
    id        SERIAL        PRIMARY KEY,
    category  VARCHAR(50)   NOT NULL,
    name      VARCHAR(150)  NOT NULL,
    price     INTEGER       NOT NULL,
    details   JSONB
);

CREATE INDEX idx_category_price ON components (category, price);

-- Row Level Security: allow anyone to read, nobody to write via the anon key
ALTER TABLE components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
    ON components FOR SELECT
    USING (true);


-- ── CPU (15) ─────────────────────────────────────────────────────────────────
INSERT INTO components (category, name, price, details) VALUES
('CPU', 'AMD Ryzen 3 3100', 7500,
 '{"Cores":"4","Threads":"8","Base Clock":"3.6 GHz","Boost Clock":"3.9 GHz","TDP":"65W","Socket":"AM4","L3 Cache":"16MB"}'),

('CPU', 'Intel Core i3-12100F', 9500,
 '{"Cores":"4","Threads":"8","Base Clock":"3.3 GHz","Boost Clock":"4.3 GHz","TDP":"58W","Socket":"LGA1700","L3 Cache":"12MB"}'),

('CPU', 'AMD Ryzen 5 5500', 11000,
 '{"Cores":"6","Threads":"12","Base Clock":"3.6 GHz","Boost Clock":"4.2 GHz","TDP":"65W","Socket":"AM4","L3 Cache":"16MB"}'),

('CPU', 'AMD Ryzen 5 5600', 14000,
 '{"Cores":"6","Threads":"12","Base Clock":"3.5 GHz","Boost Clock":"4.4 GHz","TDP":"65W","Socket":"AM4","L3 Cache":"32MB"}'),

('CPU', 'Intel Core i5-12400F', 15000,
 '{"Cores":"6","Threads":"12","Base Clock":"2.5 GHz","Boost Clock":"4.4 GHz","TDP":"65W","Socket":"LGA1700","L3 Cache":"18MB"}'),

('CPU', 'AMD Ryzen 5 5600X', 16000,
 '{"Cores":"6","Threads":"12","Base Clock":"3.7 GHz","Boost Clock":"4.6 GHz","TDP":"65W","Socket":"AM4","L3 Cache":"32MB"}'),

('CPU', 'AMD Ryzen 7 5700X', 22000,
 '{"Cores":"8","Threads":"16","Base Clock":"3.4 GHz","Boost Clock":"4.6 GHz","TDP":"65W","Socket":"AM4","L3 Cache":"32MB"}'),

('CPU', 'Intel Core i5-12600K', 22500,
 '{"Cores":"10","Threads":"16","Base Clock":"3.7 GHz","Boost Clock":"4.9 GHz","TDP":"125W","Socket":"LGA1700","L3 Cache":"20MB"}'),

('CPU', 'AMD Ryzen 7 5800X', 26000,
 '{"Cores":"8","Threads":"16","Base Clock":"3.8 GHz","Boost Clock":"4.7 GHz","TDP":"105W","Socket":"AM4","L3 Cache":"32MB"}'),

('CPU', 'Intel Core i5-13600K', 27000,
 '{"Cores":"14","Threads":"20","Base Clock":"3.5 GHz","Boost Clock":"5.1 GHz","TDP":"125W","Socket":"LGA1700","L3 Cache":"24MB"}'),

('CPU', 'AMD Ryzen 7 7700X', 33000,
 '{"Cores":"8","Threads":"16","Base Clock":"4.5 GHz","Boost Clock":"5.4 GHz","TDP":"105W","Socket":"AM5","L3 Cache":"32MB"}'),

('CPU', 'AMD Ryzen 9 5900X', 38000,
 '{"Cores":"12","Threads":"24","Base Clock":"3.7 GHz","Boost Clock":"4.8 GHz","TDP":"105W","Socket":"AM4","L3 Cache":"64MB"}'),

('CPU', 'Intel Core i7-13700K', 40000,
 '{"Cores":"16","Threads":"24","Base Clock":"3.4 GHz","Boost Clock":"5.4 GHz","TDP":"125W","Socket":"LGA1700","L3 Cache":"30MB"}'),

('CPU', 'Intel Core i9-13900K', 58000,
 '{"Cores":"24","Threads":"32","Base Clock":"3.0 GHz","Boost Clock":"5.8 GHz","TDP":"125W","Socket":"LGA1700","L3 Cache":"36MB"}'),

('CPU', 'AMD Ryzen 9 7950X', 67000,
 '{"Cores":"16","Threads":"32","Base Clock":"4.5 GHz","Boost Clock":"5.7 GHz","TDP":"170W","Socket":"AM5","L3 Cache":"64MB"}');


-- ── GPU (15) ─────────────────────────────────────────────────────────────────
INSERT INTO components (category, name, price, details) VALUES
('GPU', 'NVIDIA GeForce GTX 1650 4GB', 12500,
 '{"VRAM":"4GB GDDR6","Core Clock":"1485 MHz","Boost Clock":"1665 MHz","TDP":"75W","Memory Bandwidth":"128 GB/s","Interface":"PCIe 3.0 x16","Card Length":"150mm"}'),

('GPU', 'AMD Radeon RX 6500 XT 4GB', 13500,
 '{"VRAM":"4GB GDDR6","Core Clock":"2310 MHz","Boost Clock":"2610 MHz","TDP":"107W","Memory Bandwidth":"144 GB/s","Interface":"PCIe 4.0 x4","Card Length":"168mm"}'),

('GPU', 'NVIDIA GeForce RTX 3050 8GB', 19000,
 '{"VRAM":"8GB GDDR6","Core Clock":"1552 MHz","Boost Clock":"1777 MHz","TDP":"130W","Memory Bandwidth":"224 GB/s","Interface":"PCIe 4.0 x16","Card Length":"242mm"}'),

('GPU', 'AMD Radeon RX 6600 8GB', 21000,
 '{"VRAM":"8GB GDDR6","Core Clock":"1626 MHz","Boost Clock":"2491 MHz","TDP":"132W","Memory Bandwidth":"224 GB/s","Interface":"PCIe 4.0 x8","Card Length":"238mm"}'),

('GPU', 'AMD Radeon RX 6650 XT 8GB', 24000,
 '{"VRAM":"8GB GDDR6","Core Clock":"1792 MHz","Boost Clock":"2635 MHz","TDP":"180W","Memory Bandwidth":"280 GB/s","Interface":"PCIe 4.0 x8","Card Length":"267mm"}'),

('GPU', 'NVIDIA GeForce RTX 3060 12GB', 27000,
 '{"VRAM":"12GB GDDR6","Core Clock":"1320 MHz","Boost Clock":"1777 MHz","TDP":"170W","Memory Bandwidth":"360 GB/s","Interface":"PCIe 4.0 x16","Card Length":"285mm"}'),

('GPU', 'NVIDIA GeForce RTX 3060 Ti 8GB', 32000,
 '{"VRAM":"8GB GDDR6","Core Clock":"1410 MHz","Boost Clock":"1665 MHz","TDP":"200W","Memory Bandwidth":"448 GB/s","Interface":"PCIe 4.0 x16","Card Length":"240mm"}'),

('GPU', 'AMD Radeon RX 6700 XT 12GB', 35000,
 '{"VRAM":"12GB GDDR6","Core Clock":"2321 MHz","Boost Clock":"2581 MHz","TDP":"230W","Memory Bandwidth":"384 GB/s","Interface":"PCIe 4.0 x16","Card Length":"267mm"}'),

('GPU', 'NVIDIA GeForce RTX 3070 8GB', 40000,
 '{"VRAM":"8GB GDDR6","Core Clock":"1500 MHz","Boost Clock":"1725 MHz","TDP":"220W","Memory Bandwidth":"448 GB/s","Interface":"PCIe 4.0 x16","Card Length":"285mm"}'),

('GPU', 'AMD Radeon RX 6800 XT 16GB', 45000,
 '{"VRAM":"16GB GDDR6","Core Clock":"1825 MHz","Boost Clock":"2250 MB/s","TDP":"300W","Memory Bandwidth":"512 GB/s","Interface":"PCIe 4.0 x16","Card Length":"310mm"}'),

('GPU', 'AMD Radeon RX 7900 GRE 16GB', 52000,
 '{"VRAM":"16GB GDDR6","Core Clock":"1880 MHz","Boost Clock":"2245 MHz","TDP":"260W","Memory Bandwidth":"576 GB/s","Interface":"PCIe 4.0 x16","Card Length":"336mm"}'),

('GPU', 'NVIDIA GeForce RTX 3080 10GB', 58000,
 '{"VRAM":"10GB GDDR6X","Core Clock":"1440 MHz","Boost Clock":"1710 MHz","TDP":"320W","Memory Bandwidth":"760 GB/s","Interface":"PCIe 4.0 x16","Card Length":"320mm"}'),

('GPU', 'NVIDIA GeForce RTX 4070 12GB', 60000,
 '{"VRAM":"12GB GDDR6X","Core Clock":"1920 MHz","Boost Clock":"2475 MHz","TDP":"200W","Memory Bandwidth":"504 GB/s","Interface":"PCIe 4.0 x16","Card Length":"285mm"}'),

('GPU', 'NVIDIA GeForce RTX 4080 16GB', 98000,
 '{"VRAM":"16GB GDDR6X","Core Clock":"2205 MHz","Boost Clock":"2505 MHz","TDP":"320W","Memory Bandwidth":"717 GB/s","Interface":"PCIe 4.0 x16","Card Length":"336mm"}'),

('GPU', 'NVIDIA GeForce RTX 4090 24GB', 165000,
 '{"VRAM":"24GB GDDR6X","Core Clock":"2235 MHz","Boost Clock":"2520 MHz","TDP":"450W","Memory Bandwidth":"1008 GB/s","Interface":"PCIe 4.0 x16","Card Length":"338mm"}');


-- ── RAM (15) ─────────────────────────────────────────────────────────────────
INSERT INTO components (category, name, price, details) VALUES
('RAM', 'Kingston Fury Beast 8GB DDR4-3200', 2200,
 '{"Capacity":"8GB","Type":"DDR4","Speed":"3200 MHz","CAS Latency":"CL16","Voltage":"1.35V","Modules":"1x 8GB"}'),

('RAM', 'Corsair Vengeance LPX 8GB DDR4-3200', 2500,
 '{"Capacity":"8GB","Type":"DDR4","Speed":"3200 MHz","CAS Latency":"CL16","Voltage":"1.35V","Modules":"1x 8GB"}'),

('RAM', 'G.Skill Ripjaws V 8GB DDR4-3600', 2800,
 '{"Capacity":"8GB","Type":"DDR4","Speed":"3600 MHz","CAS Latency":"CL18","Voltage":"1.35V","Modules":"1x 8GB"}'),

('RAM', 'Kingston Fury Beast 16GB DDR4-3200', 4200,
 '{"Capacity":"16GB","Type":"DDR4","Speed":"3200 MHz","CAS Latency":"CL16","Voltage":"1.35V","Modules":"2x 8GB"}'),

('RAM', 'Corsair Vengeance LPX 16GB DDR4-3200', 4500,
 '{"Capacity":"16GB","Type":"DDR4","Speed":"3200 MHz","CAS Latency":"CL16","Voltage":"1.35V","Modules":"2x 8GB"}'),

('RAM', 'G.Skill Ripjaws V 16GB DDR4-3600', 5000,
 '{"Capacity":"16GB","Type":"DDR4","Speed":"3600 MHz","CAS Latency":"CL16","Voltage":"1.35V","Modules":"2x 8GB"}'),

('RAM', 'Corsair Vengeance RGB Pro 16GB DDR4-3600', 6000,
 '{"Capacity":"16GB","Type":"DDR4","Speed":"3600 MHz","CAS Latency":"CL18","Voltage":"1.35V","Modules":"2x 8GB"}'),

('RAM', 'G.Skill Trident Z RGB 16GB DDR4-3600', 6500,
 '{"Capacity":"16GB","Type":"DDR4","Speed":"3600 MHz","CAS Latency":"CL16","Voltage":"1.35V","Modules":"2x 8GB"}'),

('RAM', 'Kingston Fury Beast 32GB DDR4-3200', 8500,
 '{"Capacity":"32GB","Type":"DDR4","Speed":"3200 MHz","CAS Latency":"CL16","Voltage":"1.35V","Modules":"2x 16GB"}'),

('RAM', 'Corsair Vengeance 32GB DDR4-3200', 9000,
 '{"Capacity":"32GB","Type":"DDR4","Speed":"3200 MHz","CAS Latency":"CL16","Voltage":"1.35V","Modules":"2x 16GB"}'),

('RAM', 'G.Skill Ripjaws V 32GB DDR4-3600', 10000,
 '{"Capacity":"32GB","Type":"DDR4","Speed":"3600 MHz","CAS Latency":"CL18","Voltage":"1.35V","Modules":"2x 16GB"}'),

('RAM', 'Corsair Dominator Platinum 32GB DDR5-5600', 14000,
 '{"Capacity":"32GB","Type":"DDR5","Speed":"5600 MHz","CAS Latency":"CL36","Voltage":"1.25V","Modules":"2x 16GB"}'),

('RAM', 'G.Skill Trident Z5 32GB DDR5-6000', 15500,
 '{"Capacity":"32GB","Type":"DDR5","Speed":"6000 MHz","CAS Latency":"CL36","Voltage":"1.35V","Modules":"2x 16GB"}'),

('RAM', 'Kingston Fury Beast 64GB DDR5-5200', 24000,
 '{"Capacity":"64GB","Type":"DDR5","Speed":"5200 MHz","CAS Latency":"CL40","Voltage":"1.25V","Modules":"2x 32GB"}'),

('RAM', 'Corsair Dominator Titanium 64GB DDR5-6000', 36000,
 '{"Capacity":"64GB","Type":"DDR5","Speed":"6000 MHz","CAS Latency":"CL30","Voltage":"1.4V","Modules":"2x 32GB"}');


-- ── Storage (15) ─────────────────────────────────────────────────────────────
INSERT INTO components (category, name, price, details) VALUES
('Storage', 'Seagate Barracuda 1TB HDD', 3000,
 '{"Capacity":"1TB","Type":"HDD","Interface":"SATA III","RPM":"7200 RPM","Cache":"64MB","Form Factor":"3.5in"}'),

('Storage', 'WD Blue 1TB HDD', 3200,
 '{"Capacity":"1TB","Type":"HDD","Interface":"SATA III","RPM":"7200 RPM","Cache":"64MB","Form Factor":"3.5in"}'),

('Storage', 'Kingston A400 480GB SATA SSD', 3500,
 '{"Capacity":"480GB","Type":"SATA SSD","Interface":"SATA III","Seq. Read":"500 MB/s","Seq. Write":"450 MB/s","Form Factor":"2.5in"}'),

('Storage', 'Seagate Barracuda 2TB HDD', 4800,
 '{"Capacity":"2TB","Type":"HDD","Interface":"SATA III","RPM":"7200 RPM","Cache":"256MB","Form Factor":"3.5in"}'),

('Storage', 'WD Blue 2TB HDD', 5000,
 '{"Capacity":"2TB","Type":"HDD","Interface":"SATA III","RPM":"7200 RPM","Cache":"256MB","Form Factor":"3.5in"}'),

('Storage', 'Kingston NV2 1TB NVMe SSD', 5100,
 '{"Capacity":"1TB","Type":"NVMe SSD","Interface":"PCIe 4.0 x4","Seq. Read":"3500 MB/s","Seq. Write":"2100 MB/s","Form Factor":"M.2 2280"}'),

('Storage', 'WD Green 1TB SATA SSD', 5500,
 '{"Capacity":"1TB","Type":"SATA SSD","Interface":"SATA III","Seq. Read":"545 MB/s","Seq. Write":"430 MB/s","Form Factor":"2.5in"}'),

('Storage', 'Crucial P3 1TB NVMe SSD', 5600,
 '{"Capacity":"1TB","Type":"NVMe SSD","Interface":"PCIe 3.0 x4","Seq. Read":"3500 MB/s","Seq. Write":"3000 MB/s","Form Factor":"M.2 2280"}'),

('Storage', 'WD Blue SN580 1TB NVMe SSD', 6000,
 '{"Capacity":"1TB","Type":"NVMe SSD","Interface":"PCIe 4.0 x4","Seq. Read":"4150 MB/s","Seq. Write":"4150 MB/s","Form Factor":"M.2 2280"}'),

('Storage', 'Crucial MX500 1TB SATA SSD', 6500,
 '{"Capacity":"1TB","Type":"SATA SSD","Interface":"SATA III","Seq. Read":"560 MB/s","Seq. Write":"510 MB/s","Form Factor":"2.5in"}'),

('Storage', 'Samsung 870 EVO 1TB SATA SSD', 8000,
 '{"Capacity":"1TB","Type":"SATA SSD","Interface":"SATA III","Seq. Read":"560 MB/s","Seq. Write":"530 MB/s","Form Factor":"2.5in"}'),

('Storage', 'Samsung 970 EVO Plus 1TB NVMe SSD', 8500,
 '{"Capacity":"1TB","Type":"NVMe SSD","Interface":"PCIe 3.0 x4","Seq. Read":"3500 MB/s","Seq. Write":"3300 MB/s","Form Factor":"M.2 2280"}'),

('Storage', 'Seagate FireCuda 520 1TB NVMe SSD', 9000,
 '{"Capacity":"1TB","Type":"NVMe SSD","Interface":"PCIe 4.0 x4","Seq. Read":"5000 MB/s","Seq. Write":"4400 MB/s","Form Factor":"M.2 2280"}'),

('Storage', 'WD Black SN850X 1TB NVMe SSD', 11000,
 '{"Capacity":"1TB","Type":"NVMe SSD","Interface":"PCIe 4.0 x4","Seq. Read":"7300 MB/s","Seq. Write":"6600 MB/s","Form Factor":"M.2 2280"}'),

('Storage', 'Samsung 990 Pro 2TB NVMe SSD', 18000,
 '{"Capacity":"2TB","Type":"NVMe SSD","Interface":"PCIe 4.0 x4","Seq. Read":"7450 MB/s","Seq. Write":"6900 MB/s","Form Factor":"M.2 2280"}');


-- ── PSU (15) ─────────────────────────────────────────────────────────────────
INSERT INTO components (category, name, price, details) VALUES
('PSU', 'Corsair CV450 450W', 3000,
 '{"Wattage":"450W","Efficiency":"80+ White","Modular":"Non-Modular","Form Factor":"ATX","Connectors":"1x CPU 4+4-pin, 2x PCIe 6+2-pin, 4x SATA"}'),

('PSU', 'Cooler Master Elite 600W', 3500,
 '{"Wattage":"600W","Efficiency":"80+ White","Modular":"Non-Modular","Form Factor":"ATX","Connectors":"1x CPU 4+4-pin, 2x PCIe 6+2-pin, 5x SATA"}'),

('PSU', 'Cooler Master MasterWatt 550W', 4500,
 '{"Wattage":"550W","Efficiency":"80+ Bronze","Modular":"Semi-Modular","Form Factor":"ATX","Connectors":"1x CPU 4+4-pin, 2x PCIe 6+2-pin, 6x SATA"}'),

('PSU', 'Seasonic S12III 550W', 4800,
 '{"Wattage":"550W","Efficiency":"80+ Bronze","Modular":"Non-Modular","Form Factor":"ATX","Connectors":"1x CPU 4+4-pin, 2x PCIe 6+2-pin, 6x SATA"}'),

('PSU', 'Corsair CX650M 650W', 5500,
 '{"Wattage":"650W","Efficiency":"80+ Bronze","Modular":"Semi-Modular","Form Factor":"ATX","Connectors":"1x CPU 4+4-pin, 2x PCIe 6+2-pin, 8x SATA"}'),

('PSU', 'EVGA SuperNOVA 650 G6', 7000,
 '{"Wattage":"650W","Efficiency":"80+ Gold","Modular":"Fully Modular","Form Factor":"ATX","Connectors":"2x CPU 4+4-pin, 4x PCIe 6+2-pin, 9x SATA"}'),

('PSU', 'Corsair RM650 650W', 7500,
 '{"Wattage":"650W","Efficiency":"80+ Gold","Modular":"Fully Modular","Form Factor":"ATX","Connectors":"2x CPU 4+4-pin, 4x PCIe 6+2-pin, 8x SATA"}'),

('PSU', 'Seasonic Focus GX-650 650W', 8000,
 '{"Wattage":"650W","Efficiency":"80+ Gold","Modular":"Fully Modular","Form Factor":"ATX","Connectors":"2x CPU 4+4-pin, 4x PCIe 6+2-pin, 8x SATA"}'),

('PSU', 'Corsair RM750 750W', 8500,
 '{"Wattage":"750W","Efficiency":"80+ Gold","Modular":"Fully Modular","Form Factor":"ATX","Connectors":"2x CPU 4+4-pin, 4x PCIe 6+2-pin, 9x SATA"}'),

('PSU', 'EVGA SuperNOVA 750 G6', 9000,
 '{"Wattage":"750W","Efficiency":"80+ Gold","Modular":"Fully Modular","Form Factor":"ATX","Connectors":"2x CPU 4+4-pin, 4x PCIe 6+2-pin, 9x SATA"}'),

('PSU', 'Seasonic Focus GX-750 750W', 9500,
 '{"Wattage":"750W","Efficiency":"80+ Gold","Modular":"Fully Modular","Form Factor":"ATX","Connectors":"2x CPU 4+4-pin, 4x PCIe 6+2-pin, 8x SATA"}'),

('PSU', 'be quiet! Straight Power 11 850W', 10500,
 '{"Wattage":"850W","Efficiency":"80+ Gold","Modular":"Fully Modular","Form Factor":"ATX","Connectors":"2x CPU 4+4-pin, 6x PCIe 6+2-pin, 10x SATA"}'),

('PSU', 'Corsair RM850x 850W', 11000,
 '{"Wattage":"850W","Efficiency":"80+ Gold","Modular":"Fully Modular","Form Factor":"ATX","Connectors":"2x CPU 4+4-pin, 6x PCIe 6+2-pin, 10x SATA"}'),

('PSU', 'Seasonic Prime TX-850 850W', 15000,
 '{"Wattage":"850W","Efficiency":"80+ Titanium","Modular":"Fully Modular","Form Factor":"ATX","Connectors":"2x CPU 4+4-pin, 6x PCIe 6+2-pin, 10x SATA"}'),

('PSU', 'Corsair AX1000 1000W', 20000,
 '{"Wattage":"1000W","Efficiency":"80+ Titanium","Modular":"Fully Modular","Form Factor":"ATX","Connectors":"2x CPU 4+4-pin, 8x PCIe 6+2-pin, 12x SATA"}');


-- ── Case (15) ────────────────────────────────────────────────────────────────
INSERT INTO components (category, name, price, details) VALUES
('Case', 'Ant Esports ICE-100 Mid Tower', 2500,
 '{"Form Factor":"Mid Tower","Motherboard Support":"ATX / mATX / Mini-ITX","Max GPU Length":"350mm","Max CPU Cooler Height":"160mm","Drive Bays":"2x 3.5in + 2x 2.5in","Expansion Slots":"7"}'),

('Case', 'Cooler Master Q300L Micro ATX', 3000,
 '{"Form Factor":"Micro ATX Tower","Motherboard Support":"mATX / Mini-ITX","Max GPU Length":"360mm","Max CPU Cooler Height":"157mm","Drive Bays":"2x 3.5in + 2x 2.5in","Expansion Slots":"4"}'),

('Case', 'Phanteks Eclipse P300A', 5500,
 '{"Form Factor":"Mid Tower","Motherboard Support":"ATX / mATX / Mini-ITX","Max GPU Length":"360mm","Max CPU Cooler Height":"160mm","Drive Bays":"2x 3.5in + 3x 2.5in","Expansion Slots":"7"}'),

('Case', 'Fractal Design Pop Air', 6500,
 '{"Form Factor":"Mid Tower","Motherboard Support":"ATX / mATX / Mini-ITX","Max GPU Length":"405mm","Max CPU Cooler Height":"170mm","Drive Bays":"2x 3.5in + 2x 2.5in","Expansion Slots":"7"}'),

('Case', 'Lian Li LANCOOL 205 Mid Tower', 7000,
 '{"Form Factor":"Mid Tower","Motherboard Support":"ATX / mATX / Mini-ITX","Max GPU Length":"384mm","Max CPU Cooler Height":"176mm","Drive Bays":"2x 3.5in + 2x 2.5in","Expansion Slots":"7"}'),

('Case', 'NZXT H510 Mid Tower', 7500,
 '{"Form Factor":"Mid Tower","Motherboard Support":"ATX / mATX","Max GPU Length":"381mm","Max CPU Cooler Height":"165mm","Drive Bays":"2x 3.5in + 2x 2.5in","Expansion Slots":"7"}'),

('Case', 'Corsair 4000D Airflow', 8000,
 '{"Form Factor":"Mid Tower","Motherboard Support":"ATX / mATX / Mini-ITX","Max GPU Length":"360mm","Max CPU Cooler Height":"170mm","Drive Bays":"2x 3.5in + 2x 2.5in","Expansion Slots":"7"}'),

('Case', 'be quiet! Pure Base 500', 8500,
 '{"Form Factor":"Mid Tower","Motherboard Support":"ATX / mATX / Mini-ITX","Max GPU Length":"369mm","Max CPU Cooler Height":"190mm","Drive Bays":"3x 3.5in + 3x 2.5in","Expansion Slots":"7"}'),

('Case', 'Cooler Master MasterBox TD500 Mesh', 9000,
 '{"Form Factor":"Mid Tower","Motherboard Support":"ATX / mATX / Mini-ITX","Max GPU Length":"410mm","Max CPU Cooler Height":"165mm","Drive Bays":"2x 3.5in + 3x 2.5in","Expansion Slots":"7"}'),

('Case', 'Fractal Design Meshify C', 10500,
 '{"Form Factor":"Mid Tower","Motherboard Support":"ATX / mATX","Max GPU Length":"315mm","Max CPU Cooler Height":"172mm","Drive Bays":"2x 3.5in + 2x 2.5in","Expansion Slots":"7"}'),

('Case', 'NZXT H7 Flow', 12000,
 '{"Form Factor":"Mid Tower","Motherboard Support":"E-ATX / ATX / mATX / Mini-ITX","Max GPU Length":"400mm","Max CPU Cooler Height":"185mm","Drive Bays":"2x 3.5in + 4x 2.5in","Expansion Slots":"7"}'),

('Case', 'Corsair 5000D Airflow', 12500,
 '{"Form Factor":"Mid Tower","Motherboard Support":"E-ATX / ATX / mATX / Mini-ITX","Max GPU Length":"420mm","Max CPU Cooler Height":"190mm","Drive Bays":"2x 3.5in + 4x 2.5in","Expansion Slots":"7"}'),

('Case', 'Lian Li O11 Dynamic EVO', 14000,
 '{"Form Factor":"Mid Tower","Motherboard Support":"E-ATX / ATX / mATX / Mini-ITX","Max GPU Length":"420mm","Max CPU Cooler Height":"167mm","Drive Bays":"2x 3.5in + 6x 2.5in","Expansion Slots":"7"}'),

('Case', 'be quiet! Dark Base 700', 18000,
 '{"Form Factor":"Full Tower","Motherboard Support":"E-ATX / ATX / mATX / Mini-ITX","Max GPU Length":"430mm","Max CPU Cooler Height":"185mm","Drive Bays":"3x 3.5in + 6x 2.5in","Expansion Slots":"7"}'),

('Case', 'Corsair iCUE 7000X RGB', 22000,
 '{"Form Factor":"Full Tower","Motherboard Support":"E-ATX / ATX / mATX / Mini-ITX","Max GPU Length":"450mm","Max CPU Cooler Height":"190mm","Drive Bays":"4x 3.5in + 4x 2.5in","Expansion Slots":"9"}');


-- ── Motherboard (15) ─────────────────────────────────────────────────────────
INSERT INTO components (category, name, price, details) VALUES

-- AM4 (DDR4)
('Motherboard', 'MSI PRO B450M-A PRO MAX', 6500,
 '{"Socket":"AM4","Chipset":"B450","Form Factor":"mATX","RAM Type":"DDR4","RAM Slots":"4","Max RAM":"128GB","PCIe x16 Slots":"1","M.2 Slots":"1"}'),

('Motherboard', 'ASRock B450M Steel Legend', 7500,
 '{"Socket":"AM4","Chipset":"B450","Form Factor":"mATX","RAM Type":"DDR4","RAM Slots":"4","Max RAM":"128GB","PCIe x16 Slots":"2","M.2 Slots":"2"}'),

('Motherboard', 'Gigabyte B550M DS3H', 8000,
 '{"Socket":"AM4","Chipset":"B550","Form Factor":"mATX","RAM Type":"DDR4","RAM Slots":"4","Max RAM":"128GB","PCIe x16 Slots":"1","M.2 Slots":"2"}'),

('Motherboard', 'MSI MAG B550 TOMAHAWK', 12000,
 '{"Socket":"AM4","Chipset":"B550","Form Factor":"ATX","RAM Type":"DDR4","RAM Slots":"4","Max RAM":"128GB","PCIe x16 Slots":"2","M.2 Slots":"2"}'),

('Motherboard', 'ASUS ROG Strix B550-F Gaming', 16000,
 '{"Socket":"AM4","Chipset":"B550","Form Factor":"ATX","RAM Type":"DDR4","RAM Slots":"4","Max RAM":"128GB","PCIe x16 Slots":"2","M.2 Slots":"2"}'),

('Motherboard', 'MSI MPG X570 Gaming Edge', 18000,
 '{"Socket":"AM4","Chipset":"X570","Form Factor":"ATX","RAM Type":"DDR4","RAM Slots":"4","Max RAM":"128GB","PCIe x16 Slots":"2","M.2 Slots":"2"}'),

-- AM5 (DDR5)
('Motherboard', 'MSI PRO B650M-A WiFi', 14000,
 '{"Socket":"AM5","Chipset":"B650","Form Factor":"mATX","RAM Type":"DDR5","RAM Slots":"4","Max RAM":"192GB","PCIe x16 Slots":"1","M.2 Slots":"2"}'),

('Motherboard', 'ASRock B650M Pro RS WiFi', 15500,
 '{"Socket":"AM5","Chipset":"B650","Form Factor":"mATX","RAM Type":"DDR5","RAM Slots":"4","Max RAM":"192GB","PCIe x16 Slots":"1","M.2 Slots":"3"}'),

('Motherboard', 'Gigabyte B650 AORUS Elite AX', 20000,
 '{"Socket":"AM5","Chipset":"B650","Form Factor":"ATX","RAM Type":"DDR5","RAM Slots":"4","Max RAM":"192GB","PCIe x16 Slots":"2","M.2 Slots":"3"}'),

('Motherboard', 'MSI MAG B650 TOMAHAWK WiFi', 22000,
 '{"Socket":"AM5","Chipset":"B650","Form Factor":"ATX","RAM Type":"DDR5","RAM Slots":"4","Max RAM":"192GB","PCIe x16 Slots":"2","M.2 Slots":"3"}'),

('Motherboard', 'ASUS ROG Strix X670E-F Gaming', 35000,
 '{"Socket":"AM5","Chipset":"X670E","Form Factor":"ATX","RAM Type":"DDR5","RAM Slots":"4","Max RAM":"192GB","PCIe x16 Slots":"3","M.2 Slots":"4"}'),

-- LGA1700 (Intel 12th/13th Gen)
('Motherboard', 'MSI PRO H610M-G', 8500,
 '{"Socket":"LGA1700","Chipset":"H610","Form Factor":"mATX","RAM Type":"DDR4","RAM Slots":"2","Max RAM":"64GB","PCIe x16 Slots":"1","M.2 Slots":"1"}'),

('Motherboard', 'Gigabyte B660M DS3H DDR4', 9500,
 '{"Socket":"LGA1700","Chipset":"B660","Form Factor":"mATX","RAM Type":"DDR4","RAM Slots":"4","Max RAM":"128GB","PCIe x16 Slots":"1","M.2 Slots":"2"}'),

('Motherboard', 'ASUS PRIME Z690-P D4', 16500,
 '{"Socket":"LGA1700","Chipset":"Z690","Form Factor":"ATX","RAM Type":"DDR4","RAM Slots":"4","Max RAM":"128GB","PCIe x16 Slots":"2","M.2 Slots":"4"}'),

('Motherboard', 'MSI MPG Z790 Carbon WiFi', 38000,
 '{"Socket":"LGA1700","Chipset":"Z790","Form Factor":"ATX","RAM Type":"DDR5","RAM Slots":"4","Max RAM":"192GB","PCIe x16 Slots":"2","M.2 Slots":"5"}');


-- ── Monitor (10) ─────────────────────────────────────────────────────────────
INSERT INTO components (category, name, price, details) VALUES
('Monitor', 'AOC 24G2 24" FHD 144Hz IPS', 14000,
 '{"Size":"24 inch","Resolution":"1920x1080 (FHD)","Panel":"IPS","Refresh Rate":"144Hz","Response Time":"1ms","Brightness":"250 nits","Ports":"HDMI 1.4, DisplayPort 1.2"}'),

('Monitor', 'Samsung Odyssey G4 24" FHD 240Hz', 16000,
 '{"Size":"24 inch","Resolution":"1920x1080 (FHD)","Panel":"IPS","Refresh Rate":"240Hz","Response Time":"1ms","Brightness":"300 nits","Ports":"HDMI 2.0, DisplayPort 1.2"}'),

('Monitor', 'LG 27GN800-B 27" QHD 144Hz Nano IPS', 18000,
 '{"Size":"27 inch","Resolution":"2560x1440 (QHD)","Panel":"Nano IPS","Refresh Rate":"144Hz","Response Time":"1ms","Brightness":"350 nits","Ports":"HDMI 1.4, DisplayPort 1.4 x2"}'),

('Monitor', 'Dell S2722DGM 27" QHD 165Hz VA', 20000,
 '{"Size":"27 inch","Resolution":"2560x1440 (QHD)","Panel":"VA","Refresh Rate":"165Hz","Response Time":"1ms","Brightness":"350 nits","Ports":"HDMI 2.0 x2, DisplayPort 1.4"}'),

('Monitor', 'MSI Optix G274QPX 27" QHD 170Hz', 22000,
 '{"Size":"27 inch","Resolution":"2560x1440 (QHD)","Panel":"IPS","Refresh Rate":"170Hz","Response Time":"1ms","Brightness":"400 nits","Ports":"HDMI 2.0 x2, DisplayPort 1.4 x2"}'),

('Monitor', 'ASUS TUF VG279QM 27" FHD 280Hz', 24000,
 '{"Size":"27 inch","Resolution":"1920x1080 (FHD)","Panel":"IPS","Refresh Rate":"280Hz","Response Time":"1ms","Brightness":"400 nits","Ports":"HDMI 2.0, DisplayPort 1.4 x2"}'),

('Monitor', 'LG 27GP850-B 27" QHD 165Hz Nano IPS', 26000,
 '{"Size":"27 inch","Resolution":"2560x1440 (QHD)","Panel":"Nano IPS","Refresh Rate":"165Hz","Response Time":"1ms","Brightness":"400 nits","Ports":"HDMI 2.0, DisplayPort 1.4 x2"}'),

('Monitor', 'Samsung Odyssey G7 32" QHD 240Hz VA', 32000,
 '{"Size":"32 inch","Resolution":"2560x1440 (QHD)","Panel":"VA","Refresh Rate":"240Hz","Response Time":"1ms","Brightness":"600 nits","Ports":"HDMI 2.1, DisplayPort 1.4 x2"}'),

('Monitor', 'ASUS ROG Swift PG279QM 27" QHD 240Hz', 45000,
 '{"Size":"27 inch","Resolution":"2560x1440 (QHD)","Panel":"IPS","Refresh Rate":"240Hz","Response Time":"1ms","Brightness":"400 nits","Ports":"HDMI 2.0, DisplayPort 1.4 x3"}'),

('Monitor', 'LG 27GR95QE-B 27" QHD 240Hz OLED', 70000,
 '{"Size":"27 inch","Resolution":"2560x1440 (QHD)","Panel":"OLED","Refresh Rate":"240Hz","Response Time":"0.03ms","Brightness":"1000 nits","Ports":"HDMI 2.1 x2, DisplayPort 1.4"}');


-- ── Keyboard (10) ─────────────────────────────────────────────────────────────
INSERT INTO components (category, name, price, details) VALUES
('Keyboard', 'Zebronics Zeb-K21 USB Keyboard', 600,
 '{"Type":"Membrane","Layout":"Full Size","Connection":"USB","Backlight":"No","Switch":"N/A"}'),

('Keyboard', 'Ant Esports MK1300 Pro TKL', 2500,
 '{"Type":"Membrane","Layout":"TKL (87 key)","Connection":"USB","Backlight":"RGB","Switch":"N/A"}'),

('Keyboard', 'Zebronics Zeb-MAX PRO Mechanical', 3000,
 '{"Type":"Mechanical","Layout":"Full Size","Connection":"USB","Backlight":"LED","Switch":"Blue"}'),

('Keyboard', 'Redragon K552 KUMARA TKL', 4500,
 '{"Type":"Mechanical","Layout":"TKL (87 key)","Connection":"USB","Backlight":"RGB","Switch":"Blue"}'),

('Keyboard', 'HyperX Alloy Core RGB', 5000,
 '{"Type":"Membrane","Layout":"Full Size","Connection":"USB","Backlight":"RGB","Switch":"N/A"}'),

('Keyboard', 'Ant Esports MK3400W TKL Wireless', 5500,
 '{"Type":"Mechanical","Layout":"TKL (87 key)","Connection":"USB / 2.4GHz / Bluetooth","Backlight":"RGB","Switch":"Red"}'),

('Keyboard', 'Redragon K530 Pro 75% Wireless', 7000,
 '{"Type":"Mechanical","Layout":"75%","Connection":"USB / Bluetooth","Backlight":"RGB","Switch":"Brown"}'),

('Keyboard', 'Keychron K2 V2 75% Wireless', 9000,
 '{"Type":"Mechanical","Layout":"75%","Connection":"USB-C / Bluetooth","Backlight":"RGB","Switch":"Gateron Red"}'),

('Keyboard', 'Logitech G815 LIGHTSYNC', 14000,
 '{"Type":"Mechanical","Layout":"Full Size","Connection":"USB","Backlight":"RGB","Switch":"GL Linear"}'),

('Keyboard', 'SteelSeries Apex Pro TKL Wireless', 18000,
 '{"Type":"Mechanical","Layout":"TKL (87 key)","Connection":"USB / 2.4GHz","Backlight":"RGB","Switch":"OmniPoint Adjustable"}');


-- ── Mouse (10) ───────────────────────────────────────────────────────────────
INSERT INTO components (category, name, price, details) VALUES
('Mouse', 'Zebronics Zeb-Comfort Wired Mouse', 400,
 '{"DPI":"1200","Sensor":"Optical","Buttons":"3","Connection":"USB Wired","Weight":"75g","RGB":"No"}'),

('Mouse', 'Ant Esports GM60 RGB Gaming Mouse', 1500,
 '{"DPI":"3200","Sensor":"Optical","Buttons":"7","Connection":"USB Wired","Weight":"120g","RGB":"Yes"}'),

('Mouse', 'Logitech G102 LIGHTSYNC', 2000,
 '{"DPI":"200 - 8000","Sensor":"Optical","Buttons":"6","Connection":"USB Wired","Weight":"85g","RGB":"Yes"}'),

('Mouse', 'Redragon M711 COBRA Gaming Mouse', 2500,
 '{"DPI":"500 - 10000","Sensor":"Optical","Buttons":"7","Connection":"USB Wired","Weight":"130g","RGB":"Yes"}'),

('Mouse', 'Razer DeathAdder Essential', 3000,
 '{"DPI":"200 - 6400","Sensor":"5G Optical","Buttons":"5","Connection":"USB Wired","Weight":"96g","RGB":"Yes"}'),

('Mouse', 'HyperX Pulsefire Haste Wired', 5000,
 '{"DPI":"100 - 16000","Sensor":"Optical","Buttons":"6","Connection":"USB Wired","Weight":"59g","RGB":"Yes"}'),

('Mouse', 'SteelSeries Aerox 3 Wireless', 7000,
 '{"DPI":"100 - 18000","Sensor":"TrueMove Air","Buttons":"6","Connection":"USB / 2.4GHz / Bluetooth","Weight":"68g","RGB":"Yes"}'),

('Mouse', 'Logitech G502 X Plus Wireless', 7500,
 '{"DPI":"100 - 25600","Sensor":"HERO 25K","Buttons":"13","Connection":"Wireless 2.4GHz","Weight":"106g","RGB":"Yes"}'),

('Mouse', 'Logitech G Pro X Superlight 2', 12000,
 '{"DPI":"100 - 32000","Sensor":"HERO 2","Buttons":"5","Connection":"Wireless 2.4GHz","Weight":"60g","RGB":"No"}'),

('Mouse', 'Razer Viper V2 Pro', 16000,
 '{"DPI":"100 - 30000","Sensor":"Focus Pro 30K","Buttons":"5","Connection":"Wireless 2.4GHz","Weight":"58g","RGB":"No"}');
