-- PCMaxing User Management Setup

-- 1. users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 3. saved_builds
CREATE TABLE saved_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    parts JSONB NOT NULL,
    total_price INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_public BOOLEAN DEFAULT false
);

-- 4. favourite_components
CREATE TABLE favourite_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, component_id)
);

-- 5. build_history
CREATE TABLE build_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parts JSONB NOT NULL,
    total_price INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. popular_builds
CREATE TABLE popular_builds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    parts JSONB NOT NULL,
    total_price INTEGER NOT NULL,
    tier VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_saved_builds_user_id ON saved_builds(user_id);
CREATE INDEX idx_build_history_user_id ON build_history(user_id);

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourite_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_builds ENABLE ROW LEVEL SECURITY;

-- users policies
CREATE POLICY "Public can insert users (signup)" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- sessions policies
-- No public policies, handled via service role only

-- saved_builds policies
CREATE POLICY "Users can manage own saved builds" ON saved_builds FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read public builds" ON saved_builds FOR SELECT USING (is_public = true);

-- favourite_components policies
CREATE POLICY "Users can manage own favourite components" ON favourite_components FOR ALL USING (auth.uid() = user_id);

-- build_history policies
CREATE POLICY "Users can manage own build history" ON build_history FOR ALL USING (auth.uid() = user_id);

-- popular_builds policies
CREATE POLICY "Anyone can read popular builds" ON popular_builds FOR SELECT USING (true);


-- INSERT 15 Popular Builds
INSERT INTO popular_builds (name, description, parts, total_price, tier) VALUES
-- Budget (30k-50k)
('AMD Budget Office Build', 'Perfect for everyday tasks and light work.',
 '[
   {"category": "CPU", "name": "AMD Ryzen 3 3100", "price": 7500},
   {"category": "Motherboard", "name": "MSI PRO B450M-A PRO MAX", "price": 6500},
   {"category": "RAM", "name": "Kingston Fury Beast 8GB DDR4-3200", "price": 2200},
   {"category": "GPU", "name": "AMD Radeon RX 6500 XT 4GB", "price": 13500},
   {"category": "Storage", "name": "Kingston A400 480GB SATA SSD", "price": 3500},
   {"category": "PSU", "name": "Corsair CV450 450W", "price": 3000},
   {"category": "Case", "name": "Ant Esports ICE-100 Mid Tower", "price": 2500}
 ]'::jsonb, 38700, 'Budget'),

('Intel Budget Gaming Build', 'Entry-level gaming build featuring Intel 12th gen.',
 '[
   {"category": "CPU", "name": "Intel Core i3-12100F", "price": 9500},
   {"category": "Motherboard", "name": "MSI PRO H610M-G", "price": 8500},
   {"category": "RAM", "name": "Corsair Vengeance LPX 8GB DDR4-3200", "price": 2500},
   {"category": "GPU", "name": "NVIDIA GeForce GTX 1650 4GB", "price": 12500},
   {"category": "Storage", "name": "Kingston A400 480GB SATA SSD", "price": 3500},
   {"category": "PSU", "name": "Cooler Master Elite 600W", "price": 3500},
   {"category": "Case", "name": "Cooler Master Q300L Micro ATX", "price": 3000}
 ]'::jsonb, 43000, 'Budget'),

('AMD Budget Gaming', 'Great 1080p performance on a tight budget.',
 '[
   {"category": "CPU", "name": "AMD Ryzen 5 5500", "price": 11000},
   {"category": "Motherboard", "name": "Gigabyte B550M DS3H", "price": 8000},
   {"category": "RAM", "name": "Kingston Fury Beast 16GB DDR4-3200", "price": 4200},
   {"category": "GPU", "name": "NVIDIA GeForce GTX 1650 4GB", "price": 12500},
   {"category": "Storage", "name": "Kingston NV2 1TB NVMe SSD", "price": 5100},
   {"category": "PSU", "name": "Cooler Master Elite 600W", "price": 3500},
   {"category": "Case", "name": "Cooler Master Q300L Micro ATX", "price": 3000}
 ]'::jsonb, 47300, 'Budget'),

('AMD Entry 1080p', 'Reliable AMD components for solid 1080p gaming.',
 '[
   {"category": "CPU", "name": "AMD Ryzen 3 3100", "price": 7500},
   {"category": "Motherboard", "name": "ASRock B450M Steel Legend", "price": 7500},
   {"category": "RAM", "name": "G.Skill Ripjaws V 16GB DDR4-3600", "price": 5000},
   {"category": "GPU", "name": "AMD Radeon RX 6500 XT 4GB", "price": 13500},
   {"category": "Storage", "name": "WD Blue SN580 1TB NVMe SSD", "price": 6000},
   {"category": "PSU", "name": "Cooler Master MasterWatt 550W", "price": 4500},
   {"category": "Case", "name": "Phanteks Eclipse P300A", "price": 5500}
 ]'::jsonb, 49500, 'Budget'),

('Intel Entry 1080p', 'Intel paired with reliable storage and decent GPU.',
 '[
   {"category": "CPU", "name": "Intel Core i3-12100F", "price": 9500},
   {"category": "Motherboard", "name": "Gigabyte B660M DS3H DDR4", "price": 9500},
   {"category": "RAM", "name": "Corsair Vengeance LPX 16GB DDR4-3200", "price": 4500},
   {"category": "GPU", "name": "NVIDIA GeForce GTX 1650 4GB", "price": 12500},
   {"category": "Storage", "name": "Kingston NV2 1TB NVMe SSD", "price": 5100},
   {"category": "PSU", "name": "Cooler Master MasterWatt 550W", "price": 4500},
   {"category": "Case", "name": "Ant Esports ICE-100 Mid Tower", "price": 2500}
 ]'::jsonb, 48100, 'Budget'),


-- Mid-Range (50k-90k)
('AMD Mid-Range Gaming', 'Sweet spot for 1080p high refresh rate gaming.',
 '[
   {"category": "CPU", "name": "AMD Ryzen 5 5600", "price": 14000},
   {"category": "Motherboard", "name": "Gigabyte B550M DS3H", "price": 8000},
   {"category": "RAM", "name": "Corsair Vengeance RGB Pro 16GB DDR4-3600", "price": 6000},
   {"category": "GPU", "name": "AMD Radeon RX 6600 8GB", "price": 21000},
   {"category": "Storage", "name": "Crucial P3 1TB NVMe SSD", "price": 5600},
   {"category": "PSU", "name": "Corsair CX650M 650W", "price": 5500},
   {"category": "Case", "name": "Fractal Design Pop Air", "price": 6500}
 ]'::jsonb, 66600, 'Mid-Range'),

('Intel Mid-Range Productivity', 'Excellent balance of gaming and work capabilities.',
 '[
   {"category": "CPU", "name": "Intel Core i5-12400F", "price": 15000},
   {"category": "Motherboard", "name": "Gigabyte B660M DS3H DDR4", "price": 9500},
   {"category": "RAM", "name": "G.Skill Ripjaws V 16GB DDR4-3600", "price": 5000},
   {"category": "GPU", "name": "NVIDIA GeForce RTX 3060 12GB", "price": 27000},
   {"category": "Storage", "name": "WD Blue SN580 1TB NVMe SSD", "price": 6000},
   {"category": "PSU", "name": "Corsair CX650M 650W", "price": 5500},
   {"category": "Case", "name": "Lian Li LANCOOL 205 Mid Tower", "price": 7000}
 ]'::jsonb, 75000, 'Mid-Range'),

('AMD 1080p High FPS', 'Maximize FPS in esports titles.',
 '[
   {"category": "CPU", "name": "AMD Ryzen 7 5700X", "price": 22000},
   {"category": "Motherboard", "name": "MSI MAG B550 TOMAHAWK", "price": 12000},
   {"category": "RAM", "name": "G.Skill Trident Z RGB 16GB DDR4-3600", "price": 6500},
   {"category": "GPU", "name": "NVIDIA GeForce RTX 3060 12GB", "price": 27000},
   {"category": "Storage", "name": "WD Blue SN580 1TB NVMe SSD", "price": 6000},
   {"category": "PSU", "name": "Corsair CX650M 650W", "price": 5500},
   {"category": "Case", "name": "NZXT H510 Mid Tower", "price": 7500}
 ]'::jsonb, 86500, 'Mid-Range'),

('Intel 1440p Entry', 'Stepping into 1440p gaming.',
 '[
   {"category": "CPU", "name": "Intel Core i5-12400F", "price": 15000},
   {"category": "Motherboard", "name": "Gigabyte B660M DS3H DDR4", "price": 9500},
   {"category": "RAM", "name": "Kingston Fury Beast 16GB DDR4-3200", "price": 4200},
   {"category": "GPU", "name": "NVIDIA GeForce RTX 3060 Ti 8GB", "price": 32000},
   {"category": "Storage", "name": "Kingston NV2 1TB NVMe SSD", "price": 5100},
   {"category": "PSU", "name": "EVGA SuperNOVA 650 G6", "price": 7000},
   {"category": "Case", "name": "NZXT H510 Mid Tower", "price": 7500}
 ]'::jsonb, 80300, 'Mid-Range'),

('AMD High Storage Gaming', 'Generous RAM and storage for games and media.',
 '[
   {"category": "CPU", "name": "Intel Core i5-12400F", "price": 15000},
   {"category": "Motherboard", "name": "Gigabyte B660M DS3H DDR4", "price": 9500},
   {"category": "RAM", "name": "Kingston Fury Beast 32GB DDR4-3200", "price": 8500},
   {"category": "GPU", "name": "AMD Radeon RX 6650 XT 8GB", "price": 24000},
   {"category": "Storage", "name": "Seagate FireCuda 520 1TB NVMe SSD", "price": 9000},
   {"category": "PSU", "name": "Corsair RM650 650W", "price": 7500},
   {"category": "Case", "name": "Cooler Master MasterBox TD500 Mesh", "price": 9000}
 ]'::jsonb, 82500, 'Mid-Range'),


-- High-End (90k-150k)
('AMD 1440p Gaming', 'Uncompromising 1440p performance.',
 '[
   {"category": "CPU", "name": "AMD Ryzen 7 5800X", "price": 26000},
   {"category": "Motherboard", "name": "ASUS ROG Strix B550-F Gaming", "price": 16000},
   {"category": "RAM", "name": "Corsair Vengeance 32GB DDR4-3200", "price": 9000},
   {"category": "GPU", "name": "AMD Radeon RX 6800 XT 16GB", "price": 45000},
   {"category": "Storage", "name": "WD Black SN850X 1TB NVMe SSD", "price": 11000},
   {"category": "PSU", "name": "Corsair RM850x 850W", "price": 11000},
   {"category": "Case", "name": "Fractal Design Meshify C", "price": 10500}
 ]'::jsonb, 128500, 'High-End'),

('Intel 1440p/4K Entry', 'Powerful Intel processor and RTX 4070.',
 '[
   {"category": "CPU", "name": "Intel Core i5-13600K", "price": 27000},
   {"category": "Motherboard", "name": "ASUS PRIME Z690-P D4", "price": 16500},
   {"category": "RAM", "name": "G.Skill Ripjaws V 32GB DDR4-3600", "price": 10000},
   {"category": "GPU", "name": "NVIDIA GeForce RTX 4070 12GB", "price": 60000},
   {"category": "Storage", "name": "Samsung 970 EVO Plus 1TB NVMe SSD", "price": 8500},
   {"category": "PSU", "name": "Seasonic Focus GX-750 750W", "price": 9500},
   {"category": "Case", "name": "NZXT H7 Flow", "price": 12000}
 ]'::jsonb, 143500, 'High-End'),

('AMD AM5 Premium', 'Future-proof AM5 socket with top-tier components.',
 '[
   {"category": "CPU", "name": "AMD Ryzen 7 7700X", "price": 33000},
   {"category": "Motherboard", "name": "Gigabyte B650 AORUS Elite AX", "price": 20000},
   {"category": "RAM", "name": "G.Skill Trident Z5 32GB DDR5-6000", "price": 15500},
   {"category": "GPU", "name": "AMD Radeon RX 7900 GRE 16GB", "price": 52000},
   {"category": "Storage", "name": "WD Blue SN580 1TB NVMe SSD", "price": 6000},
   {"category": "PSU", "name": "be quiet! Straight Power 11 850W", "price": 10500},
   {"category": "Case", "name": "Corsair 5000D Airflow", "price": 12500}
 ]'::jsonb, 149500, 'High-End'),


-- Enthusiast (150k+)
('Intel 4K Ultimate', 'Zero compromises 4K gaming powerhouse.',
 '[
   {"category": "CPU", "name": "Intel Core i9-13900K", "price": 58000},
   {"category": "Motherboard", "name": "MSI MPG Z790 Carbon WiFi", "price": 38000},
   {"category": "RAM", "name": "Corsair Dominator Titanium 64GB DDR5-6000", "price": 36000},
   {"category": "GPU", "name": "NVIDIA GeForce RTX 4080 16GB", "price": 98000},
   {"category": "Storage", "name": "Samsung 990 Pro 2TB NVMe SSD", "price": 18000},
   {"category": "PSU", "name": "Corsair AX1000 1000W", "price": 20000},
   {"category": "Case", "name": "Corsair iCUE 7000X RGB", "price": 22000}
 ]'::jsonb, 290000, 'Enthusiast'),

('AMD Ultimate Creator', 'The absolute best for creative professionals and hardcore gamers.',
 '[
   {"category": "CPU", "name": "AMD Ryzen 9 7950X", "price": 67000},
   {"category": "Motherboard", "name": "ASUS ROG Strix X670E-F Gaming", "price": 35000},
   {"category": "RAM", "name": "Kingston Fury Beast 64GB DDR5-5200", "price": 24000},
   {"category": "GPU", "name": "NVIDIA GeForce RTX 4090 24GB", "price": 165000},
   {"category": "Storage", "name": "Samsung 990 Pro 2TB NVMe SSD", "price": 18000},
   {"category": "PSU", "name": "Corsair AX1000 1000W", "price": 20000},
   {"category": "Case", "name": "be quiet! Dark Base 700", "price": 18000}
 ]'::jsonb, 347000, 'Enthusiast');
