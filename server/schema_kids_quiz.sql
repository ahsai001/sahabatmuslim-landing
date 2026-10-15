-- ==============================================================================
-- Schema & Seed Data: Kids Quiz for Sahabat Muslim Kids
-- Database: sahabatmuslim_db
-- ==============================================================================

CREATE TABLE IF NOT EXISTS kids_quiz_questions (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'aqidah', 'sirah', 'adab', 'ibadah', 'quran'
    level VARCHAR(20) DEFAULT 'mudah', -- 'mudah', 'sedang'
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of string options: ["Opsi A", "Opsi B", "Opsi C"]
    correct_index INT NOT NULL, -- 0, 1, or 2
    explanation TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kids_quiz_cat_active ON kids_quiz_questions(category, is_active);

CREATE TABLE IF NOT EXISTS kids_quiz_scores (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    player_name VARCHAR(100) NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    stars INT NOT NULL DEFAULT 3, -- 1 to 3
    category VARCHAR(50) DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kids_quiz_scores ON kids_quiz_scores(score DESC, created_at DESC);

-- ==============================================================================
-- SEED DATA (36 Soal Pilihan Bergambar & Berdalil)
-- ==============================================================================

-- 1. AQIDAH & TAUHID
INSERT INTO kids_quiz_questions (category, level, question, options, correct_index, explanation) VALUES
('aqidah', 'mudah', 'Siapakah satu-satunya Tuhan yang wajib kita sembah dan menciptakan alam semesta?', 
 '["Malaikat", "Allah Subhanahu wa Ta''ala", "Nabi dan Rasul"]'::jsonb, 1, 
 'Masya Allah benar! Hanya Allah yang berhak disembah dan tiada sekutu bagi-Nya (QS. Al-Ikhlas: 1-4).'),

('aqidah', 'mudah', 'Ada berapa jumlah Rukun Iman yang wajib diyakini setiap muslim?', 
 '["5 Rukun", "6 Rukun", "7 Rukun"]'::jsonb, 1, 
 'Hebat! Rukun Iman ada 6: Iman kepada Allah, Malaikat, Kitab-kitab, Rasul, Hari Kiamat, dan Qadha & Qadar.'),

('aqidah', 'mudah', 'Di manakah Allah Subhanahu wa Ta''ala berada?', 
 '["Di atas ''Arsy di langit tertinggi", "Di mana-mana di dalam benda", "Di dalam gua"]'::jsonb, 0, 
 'Benar sekali! Allah berada di atas ''Arsy di langit yang tinggi, sebagaimana disebutkan dalam Al-Qur''an (QS. Thaha: 5).'),

('aqidah', 'mudah', 'Siapakah nama malaikat yang bertugas menyampaikan wahyu kepada Nabi Muhammad ﷺ?', 
 '["Malaikat Mikail", "Malaikat Israfil", "Malaikat Jibril"]'::jsonb, 2, 
 'Tepat! Malaikat Jibril ''alaihissalam adalah malaikat mulia yang bertugas membawa wahyu Allah.'),

('aqidah', 'mudah', 'Kitab suci yang Allah turunkan kepada Nabi Muhammad ﷺ sebagai petunjuk manusia adalah...?', 
 '["Al-Qur''an", "Taurat", "Injil"]'::jsonb, 0, 
 'Alhamdulillah benar! Al-Qur''an adalah firman Allah yang menjadi pedoman hidup seluruh kaum muslimin.'),

('aqidah', 'mudah', 'Malaikat diciptakan oleh Allah dari...?', 
 '["Tanah", "Cahaya (Nur)", "Api"]'::jsonb, 1, 
 'Benar! Rasulullah ﷺ mengabarkan bahwa malaikat diciptakan dari cahaya, jin dari api, dan manusia dari tanah.'),

('aqidah', 'sedang', 'Apa arti dari nama Allah "Ar-Rahman"?', 
 '["Maha Mendengar", "Maha Pengasih kepada seluruh makhluk", "Maha Perkasa"]'::jsonb, 1, 
 'Masya Allah! Ar-Rahman artinya Allah Maha Pengasih dan melimpahkan kasih sayang-Nya.'),

('aqidah', 'mudah', 'Siapakah manusia pertama yang diciptakan Allah Subhanahu wa Ta''ala?', 
 '["Nabi Ibrahim ''alaihissalam", "Nabi Adam ''alaihissalam", "Nabi Nuh ''alaihissalam"]'::jsonb, 1, 
 'Tepat! Nabi Adam ''alaihissalam adalah manusia pertama dan bapak dari seluruh umat manusia.');

-- 2. SIRAH & KISAH NABI
INSERT INTO kids_quiz_questions (category, level, question, options, correct_index, explanation) VALUES
('sirah', 'mudah', 'Siapakah Nabi dan Rasul terakhir yang diutus oleh Allah untuk seluruh manusia?', 
 '["Nabi Isa ''alaihissalam", "Nabi Muhammad ﷺ", "Nabi Musa ''alaihissalam"]'::jsonb, 1, 
 'Masya Allah benar! Nabi Muhammad ﷺ adalah penutup para Nabi dan Rasul (Khatamun Nabiyyin).'),

('sirah', 'mudah', 'Nabi yang diperintahkan Allah membuat kapal bahtera besar untuk menyelamatkan orang beriman dari banjir adalah...?', 
 '["Nabi Nuh ''alaihissalam", "Nabi Yunus ''alaihissalam", "Nabi Yusuf ''alaihissalam"]'::jsonb, 0, 
 'Hebat! Nabi Nuh membuat kapal besar dengan bimbingan wahyu Allah untuk menyelamatkan orang-orang beriman.'),

('sirah', 'mudah', 'Nabi yang pernah ditelan ikan paus besar lalu selamat atas pertolongan Allah adalah...?', 
 '["Nabi Yunus ''alaihissalam", "Nabi Luth ''alaihissalam", "Nabi Sulaiman ''alaihissalam"]'::jsonb, 0, 
 'Tepat sekali! Nabi Yunus terus berdzikir "Laa ilaaha illa anta subhaanaka inni kuntu minazh-zhalimin" di dalam perut paus.'),

('sirah', 'mudah', 'Nabi yang memiliki mukjizat tongkat yang dapat berubah menjadi ular besar dan membelah lautan adalah...?', 
 '["Nabi Musa ''alaihissalam", "Nabi Isa ''alaihissalam", "Nabi Daud ''alaihissalam"]'::jsonb, 0, 
 'Benar! Nabi Musa memukulkan tongkatnya ke lautan atas izin Allah untuk menyelamatkan Bani Israil dari Fir''aun.'),

('sirah', 'mudah', 'Nabi yang tidak hangus terbakar saat dilemparkan ke dalam kobaran api yang besar oleh Raja Namrud adalah...?', 
 '["Nabi Ibrahim ''alaihissalam", "Nabi Ismail ''alaihissalam", "Nabi Zakariya ''alaihissalam"]'::jsonb, 0, 
 'Masya Allah benar! Allah berfirman kepada api: "Wahai api, jadilah dingin dan selamatkan Ibrahim!" (QS. Al-Anbiya: 69).'),

('sirah', 'mudah', 'Nabi yang dikaruniai mukjizat memahami bahasa hewan dan memerintah angin adalah...?', 
 '["Nabi Sulaiman ''alaihissalam", "Nabi Ayyub ''alaihissalam", "Nabi Syu''aib ''alaihissalam"]'::jsonb, 0, 
 'Hebat! Nabi Sulaiman adalah raja yang shalih dan bisa mendengar percakapan semut serta burung hud-hud.'),

('sirah', 'sedang', 'Di kota manakah Nabi Muhammad ﷺ dilahirkan?', 
 '["Kota Madinah", "Kota Makkah", "Kota Yerusalem"]'::jsonb, 1, 
 'Tepat! Rasulullah ﷺ dilahirkan di kota suci Makkah Al-Mukarramah pada Tahun Gajah.'),

('sirah', 'mudah', 'Siapakah sahabat Nabi yang menjadi khalifah pertama setelah wafatnya Rasulullah ﷺ?', 
 '["Umar bin Khattab radhiyallahu ''anhu", "Abu Bakar Ash-Shiddiq radhiyallahu ''anhu", "Ali bin Abi Thalib radhiyallahu ''anhu"]'::jsonb, 1, 
 'Benar sekali! Abu Bakar Ash-Shiddiq adalah sahabat terdekat Rasulullah yang paling awal beriman.');

-- 3. ADAB SUNNAH & AKHLAK
INSERT INTO kids_quiz_questions (category, level, question, options, correct_index, explanation) VALUES
('adab', 'mudah', 'Saat hendak makan dan minum, tangan manakah yang diajarkan oleh Rasulullah ﷺ?', 
 '["Tangan kanan", "Tangan kiri", "Bebas tangan mana saja"]'::jsonb, 0, 
 'Masya Allah! Rasulullah bersabda: "Wahai anak, sebutlah nama Allah dan makanlah dengan tangan kananmu!" (HR. Bukhari & Muslim).'),

('adab', 'mudah', 'Ucapan doa dan salam yang disunnahkan saat bertemu sesama saudara muslim adalah...?', 
 '["Halo apa kabar", "Assalamu''alaikum warahmatullah", "Selamat pagi kawan"]'::jsonb, 1, 
 'Tepat! Menyebarkan salam adalah tanda cinta dan doa keselamatan bagi sesama muslim.'),

('adab', 'mudah', 'Kaki manakah yang disunnahkan melangkah lebih dulu saat masuk ke dalam Masjid?', 
 '["Kaki kiri", "Kaki kanan", "Kedua kaki bersamaan"]'::jsonb, 1, 
 'Benar! Masuk masjid menggunakan kaki kanan sambil membaca doa masuk masjid, keluar masjid menggunakan kaki kiri.'),

('adab', 'mudah', 'Kaki manakah yang disunnahkan melangkah lebih dulu saat masuk ke kamar mandi / toilet?', 
 '["Kaki kiri", "Kaki kanan", "Bebas yang mana saja"]'::jsonb, 0, 
 'Hebat! Masuk tempat buang hajat dengan kaki kiri sambil berdoa meminta perlindungan dari godaan syaitan.'),

('adab', 'mudah', 'Apa yang harus kita ucapkan setelah selesai bersin?', 
 '["Alhamdulillah", "Astagfirullah", "Bismillah"]'::jsonb, 0, 
 'Benar sekali! Orang yang bersin memuji Allah dengan mengucapkan "Alhamdulillah", dan saudaranya mendoakan "Yarhamukallah".'),

('adab', 'mudah', 'Bagaimanakah sikap seorang anak muslim kepada kedua orang tuanya (Ayah dan Ibu)?', 
 '["Berkata kasar jika tidak dituruti", "Berbakti, santun, dan mendoakan kebaikan", "Mengabaikan nasihatnya"]'::jsonb, 1, 
 'Masya Allah! Berbakti kepada orang tua (Birrul Walidain) adalah salah satu amalan yang paling dicintai Allah.'),

('adab', 'sedang', 'Sebelum tidur di malam hari, posisi tidur yang disunnahkan oleh Rasulullah ﷺ adalah miring ke arah...?', 
 '["Miring ke sebelah kanan", "Miring ke sebelah kiri", "Tidur tengkurap"]'::jsonb, 0, 
 'Tepat! Rasulullah ﷺ menganjurkan tidur berbaring miring ke sisi kanan dan menghadap kiblat.'),

('adab', 'mudah', 'Bolehkah kita berbohong atau mengejek teman kita saat bercanda?', 
 '["Boleh asal ramai", "Tidak boleh, muslim selalu jujur dan santun", "Boleh sekali-kali"]'::jsonb, 1, 
 'Hebat! Seorang muslim sejati selalu menjaga lisannya, jujur, dan tidak menyakiti perasaan saudaranya.');

-- 4. IBADAH, SHOLAT & QURAN
INSERT INTO kids_quiz_questions (category, level, question, options, correct_index, explanation) VALUES
('ibadah', 'mudah', 'Ada berapa waktu sholat fardhu (wajib) yang harus dikerjakan setiap hari?', 
 '["3 waktu", "5 waktu", "7 waktu"]'::jsonb, 1, 
 'Alhamdulillah tepat! Sholat fardhu ada 5: Subuh, Dzuhur, Ashar, Maghrib, dan Isya.'),

('ibadah', 'mudah', 'Berapa jumlah raka''at pada sholat Subuh?', 
 '["2 raka''at", "3 raka''at", "4 raka''at"]'::jsonb, 0, 
 'Benar sekali! Sholat Subuh berjumlah 2 raka''at dan dikerjakan sebelum terbit fajar.'),

('ibadah', 'mudah', 'Berapa jumlah raka''at pada sholat Maghrib?', 
 '["2 raka''at", "3 raka''at", "4 raka''at"]'::jsonb, 1, 
 'Tepat! Sholat Maghrib berjumlah 3 raka''at.'),

('ibadah', 'mudah', 'Sebelum melaksanakan sholat, kita wajib bersuci dari hadats kecil dengan cara...?', 
 '["Berwudhu dengan air bersih", "Mencuci pakaian saja", "Menggosok gigi saja"]'::jsonb, 0, 
 'Masya Allah benar! Wudhu adalah syarat sah sholat yang diajarkan oleh Rasulullah ﷺ.'),

('ibadah', 'mudah', 'Surah apakah di dalam Al-Qur''an yang wajib dibaca pada setiap raka''at sholat?', 
 '["Surah Al-Ikhlas", "Surah Al-Fatihah", "Surah An-Nas"]'::jsonb, 1, 
 'Hebat! Surah Al-Fatihah (Ummul Qur''an) wajib dibaca di setiap raka''at sholat.'),

('ibadah', 'mudah', 'Apakah surah pembuka (pertama) di dalam mushaf Al-Qur''an?', 
 '["Surah Al-Baqarah", "Surah Al-Fatihah", "Surah Yasin"]'::jsonb, 1, 
 'Benar! Surah Al-Fatihah artinya adalah "Pembukaan".'),

('ibadah', 'mudah', 'Bulan mulia di mana seluruh umat Islam diwajibkan berpuasa satu bulan penuh adalah bulan...?', 
 '["Bulan Ramadhan", "Bulan Syawal", "Bulan Dzulhijjah"]'::jsonb, 0, 
 'Tepat sekali! Bulan Ramadhan adalah bulan penuh berkah dan ampunan bagi orang yang berpuasa.'),

('ibadah', 'sedang', 'Berapa jumlah ayat dalam Surah Al-Ikhlas?', 
 '["3 ayat", "4 ayat", "5 ayat"]'::jsonb, 1, 
 'Alhamdulillah tepat! Surah Al-Ikhlas terdiri dari 4 ayat yang menegaskan keesaan Allah Subhanahu wa Ta''ala.');
