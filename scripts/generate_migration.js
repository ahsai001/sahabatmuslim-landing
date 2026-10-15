const fs = require('fs');
const path = require('path');

function escapeSql(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'object') {
        const json = JSON.stringify(val).replace(/'/g, "''");
        return `'${json}'::jsonb`;
    }
    const str = String(val).replace(/'/g, "''");
    return `'${str}'`;
}

// Read data
const kidsJs = fs.readFileSync('js/kids-data.js', 'utf8').replace('const KIDS_CHANNELS', 'global.KIDS_CHANNELS');
const doaJs = fs.readFileSync('js/doa-data.js', 'utf8').replace('const DOA_DATA', 'global.DOA_DATA');
const dzikirJs = fs.readFileSync('js/dzikir-data.js', 'utf8').replace('const DZIKIR_DATA', 'global.DZIKIR_DATA');

eval(kidsJs);
eval(doaJs);
eval(dzikirJs);

let sql = `-- ==============================================================================
-- Full Database Migration: Kids Channels, Duas (Doa Harian), and Dhikr
-- Database: sahabatmuslim_db
-- ==============================================================================

-- 1. KIDS CHANNELS
CREATE TABLE IF NOT EXISTS kids_channels (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    category_label VARCHAR(100),
    handle VARCHAR(100) NOT NULL,
    youtube_url TEXT NOT NULL,
    avatar VARCHAR(10) DEFAULT '📺',
    badge_color VARCHAR(20) DEFAULT '#059669',
    description TEXT,
    featured_video_id VARCHAR(50),
    featured_title TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kids_channels_cat ON kids_channels(category, is_active);

-- 2. DUAS (DOA HARIAN)
CREATE TABLE IF NOT EXISTS duas (
    id INT PRIMARY KEY,
    grup VARCHAR(150) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    ar TEXT NOT NULL,
    tr TEXT,
    idn TEXT NOT NULL,
    tentang TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_duas_grup ON duas(grup, is_active);
CREATE INDEX IF NOT EXISTS idx_duas_search ON duas USING gin(to_tsvector('simple', nama || ' ' || idn || ' ' || grup));

-- 3. DHIKR (DZIKIR HARIAN)
CREATE TABLE IF NOT EXISTS dhikr (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'pagi', 'petang', 'sholat_subuh', 'sholat_maghrib', 'sholat_dz_a_i'
    item_index INT,
    title VARCHAR(255) NOT NULL,
    bacaan_key TEXT,
    target INT DEFAULT 1,
    runningtext VARCHAR(255),
    arabic TEXT NOT NULL,
    latin TEXT,
    terjemah TEXT NOT NULL,
    dalil TEXT,
    sound VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dhikr_category ON dhikr(category, sort_order, is_active);

-- ==============================================================================
-- INSERTS: KIDS CHANNELS
-- ==============================================================================
`;

// Insert Kids Channels
global.KIDS_CHANNELS.forEach((ch, idx) => {
    sql += `INSERT INTO kids_channels (id, title, category, category_label, handle, youtube_url, avatar, badge_color, description, featured_video_id, featured_title, tags, sort_order)
VALUES (${escapeSql(ch.id)}, ${escapeSql(ch.title)}, ${escapeSql(ch.category)}, ${escapeSql(ch.categoryLabel)}, ${escapeSql(ch.handle)}, ${escapeSql(ch.youtubeUrl)}, ${escapeSql(ch.avatar)}, ${escapeSql(ch.badgeColor)}, ${escapeSql(ch.description)}, ${escapeSql(ch.featuredVideoId)}, ${escapeSql(ch.featuredTitle)}, ${escapeSql(ch.tags)}, ${idx + 1})
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  category_label = EXCLUDED.category_label,
  handle = EXCLUDED.handle,
  youtube_url = EXCLUDED.youtube_url,
  avatar = EXCLUDED.avatar,
  badge_color = EXCLUDED.badge_color,
  description = EXCLUDED.description,
  featured_video_id = EXCLUDED.featured_video_id,
  featured_title = EXCLUDED.featured_title,
  tags = EXCLUDED.tags,
  sort_order = EXCLUDED.sort_order;
`;
});

sql += `\n-- ==============================================================================
-- INSERTS: DUAS (227 DOA HARIAN)
-- ==============================================================================
`;

// Insert Duas
global.DOA_DATA.forEach(d => {
    sql += `INSERT INTO duas (id, grup, nama, ar, tr, idn, tentang, tags)
VALUES (${escapeSql(d.id)}, ${escapeSql(d.grup)}, ${escapeSql(d.nama)}, ${escapeSql(d.ar)}, ${escapeSql(d.tr)}, ${escapeSql(d.idn)}, ${escapeSql(d.tentang)}, ${escapeSql(d.tag)})
ON CONFLICT (id) DO UPDATE SET
  grup = EXCLUDED.grup,
  nama = EXCLUDED.nama,
  ar = EXCLUDED.ar,
  tr = EXCLUDED.tr,
  idn = EXCLUDED.idn,
  tentang = EXCLUDED.tentang,
  tags = EXCLUDED.tags;
`;
});

sql += `\n-- ==============================================================================
-- INSERTS: DHIKR (DZIKIR PAGI, PETANG, SHOLAT)
-- ==============================================================================
`;

// Insert Dhikr
const dzikirCats = ['pagi', 'petang', 'sholat_subuh', 'sholat_maghrib', 'sholat_dz_a_i'];
dzikirCats.forEach(cat => {
    const list = global.DZIKIR_DATA[cat] || [];
    list.forEach((item, idx) => {
        sql += `INSERT INTO dhikr (id, category, item_index, title, bacaan_key, target, runningtext, arabic, latin, terjemah, dalil, sound, sort_order)
VALUES (${escapeSql(item.id)}, ${escapeSql(cat)}, ${escapeSql(item.index)}, ${escapeSql(item.title)}, ${escapeSql(item.bacaan_key)}, ${escapeSql(item.target)}, ${escapeSql(item.runningtext)}, ${escapeSql(item.arabic)}, ${escapeSql(item.latin)}, ${escapeSql(item.terjemah)}, ${escapeSql(item.dalil)}, ${escapeSql(item.sound)}, ${idx + 1})
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  item_index = EXCLUDED.item_index,
  title = EXCLUDED.title,
  bacaan_key = EXCLUDED.bacaan_key,
  target = EXCLUDED.target,
  runningtext = EXCLUDED.runningtext,
  arabic = EXCLUDED.arabic,
  latin = EXCLUDED.latin,
  terjemah = EXCLUDED.terjemah,
  dalil = EXCLUDED.dalil,
  sound = EXCLUDED.sound,
  sort_order = EXCLUDED.sort_order;
`;
    });
});

fs.writeFileSync('server/schema_full_migration.sql', sql, 'utf8');
console.log('Migration generated successfully: server/schema_full_migration.sql');
