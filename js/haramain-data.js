/**
 * Sahabat Muslim — Data Siaran Langsung & Video Tilawah Haramain (Makkah & Madinah)
 * Sumber resmi: Saudi Broadcasting Authority (SBA), Saudi Quran TV, Saudi Sunnah TV, & Haramain Archives.
 */

const HARAMAIN_STREAMS = {
    makkah: {
        id: "makkah",
        title: "Masjid Al-Haram, Makkah Al-Mukarramah",
        subtitle: "Saudi Quran TV (قناة القرآن الكريم) — Siaran Langsung Ka'bah & Murottal 24 Jam",
        channelId: "UC5-X_wJkUbcX6UAPFX0l4rw",
        embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC5-X_wJkUbcX6UAPFX0l4rw&autoplay=1&mute=0",
        youtubeLiveUrl: "https://www.youtube.com/@QuranTvChannel/live",
        badge: "🕋 Makkah Live 24/7",
        badgeColor: "#047857",
        description: "Menampilkan pemandangan langsung Ka'bah Syarifah, Thawaf, pelataran Masjidil Haram dari berbagai sudut resolusi tinggi, diiringi lantunan Murottal Al-Qur'an non-stop dan siaran sholat 5 waktu di Makkah."
    },
    madinah: {
        id: "madinah",
        title: "Masjid An-Nabawi, Madinah Al-Munawwarah",
        subtitle: "Saudi Sunnah TV (قناة السنة النبوية) — Siaran Langsung Nabawi & Hadits 24 Jam",
        channelId: "UCROKYPep-UuODNwyipe6JMw",
        embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCROKYPep-UuODNwyipe6JMw&autoplay=1&mute=0",
        youtubeLiveUrl: "https://www.youtube.com/@SaudiSunnahTv/live",
        badge: "🕌 Madinah Live 24/7",
        badgeColor: "#059669",
        description: "Menampilkan pemandangan langsung Masjid An-Nabawi, Kubah Hijau (Green Dome), Raudhah Syarifah, dan pelataran payung raksasa Madinah, diiringi pembacaan Hadits Shahih dan siaran sholat berjamaah."
    }
};

const HARAMAIN_VIDEOS = [
    {
        id: "dossari-haqqah",
        title: "Tilawah Paling Menggetarkan Jiwa — Surah Al-Haqqah",
        imam: "Syaikh Dr. Yasser Ad-Dossari",
        location: "makkah",
        locationLabel: "🕋 Masjidil Haram, Makkah",
        category: "makkah",
        momen: "Sholat Isya Berjamaah",
        videoId: "g7chAV4UWmo",
        duration: "09:42",
        description: "Lantunan khusyuk dan penuh penghayatan Surah Al-Haqqah dari Syaikh Yasser Ad-Dossari saat mengimami Sholat Isya di hadapan Ka'bah.",
        tags: ["Al-Haqqah", "Yasser Ad-Dossari", "Makkah", "Isya", "Mengharukan"]
    },
    {
        id: "sudais-rahman",
        title: "Lantunan Legendaris Makkah — Surah Ar-Rahman",
        imam: "Syaikh Dr. Abdurrahman As-Sudais",
        location: "makkah",
        locationLabel: "🕋 Masjidil Haram, Makkah",
        category: "makkah",
        momen: "Tilawah Khas Makkah",
        videoId: "Lbcta_bVxP4",
        duration: "14:15",
        description: "Lantunan ayat suci Surah Ar-Rahman dengan irama khas Makkah yang melegenda oleh Imam Besar Masjidil Haram, Syaikh Abdurrahman As-Sudais.",
        tags: ["Ar-Rahman", "Sudais", "Makkah", "Tartil", "Legendaris"]
    },
    {
        id: "muaiqly-maghrib",
        title: "Sholat Maghrib Sangat Syahdu di Depan Ka'bah",
        imam: "Syaikh Dr. Mahir Al-Muaiqly",
        location: "makkah",
        locationLabel: "🕋 Masjidil Haram, Makkah",
        category: "makkah",
        momen: "Sholat Maghrib Makkah",
        videoId: "86Fwq1ncxNo",
        duration: "06:30",
        description: "Suasana syahdu sholat Maghrib berjamaah di Masjidil Haram dipimpin oleh Syaikh Mahir Al-Muaiqly dengan lantunan tartil yang lembut dan menenangkan.",
        tags: ["Maghrib", "Mahir Al-Muaiqly", "Makkah", "Ka'bah", "Syahdu"]
    },
    {
        id: "juhany-taraweeh",
        title: "Sholat Tarawih Malam Ramadhan Makkah",
        imam: "Syaikh Abdullah Awad Al-Juhany",
        location: "makkah",
        locationLabel: "🕋 Masjidil Haram, Makkah",
        category: "tarawih",
        momen: "Tarawih Ramadhan",
        videoId: "nXtnM7-xXRc",
        duration: "18:20",
        description: "Lantunan merdu dan penuh penghayatan Syaikh Abdullah Al-Juhany saat mengimami ribuan jamaah sholat Tarawih di Masjidil Haram Makkah.",
        tags: ["Tarawih", "Abdullah Al-Juhany", "Ramadhan", "Makkah"]
    },
    {
        id: "baleelah-yasin",
        title: "Tartil Mengagumkan — Surah Yasin Penuh",
        imam: "Syaikh Dr. Bandar Baleelah",
        location: "makkah",
        locationLabel: "🕋 Masjidil Haram, Makkah",
        category: "makkah",
        momen: "Tilawah Penuh Khidmat",
        videoId: "r6fgDx1LbZM",
        duration: "21:45",
        description: "Bacaan utuh Surah Yasin dengan makhraj fasih dan intonasi indah oleh Syaikh Bandar Baleelah, Imam dan Khathib Masjidil Haram.",
        tags: ["Yasin", "Bandar Baleelah", "Makkah", "Lengkap"]
    },
    {
        id: "dossari-fatihah-tones",
        title: "7 Variasi Irama Surah Al-Fatihah yang Memukau",
        imam: "Syaikh Dr. Yasser Ad-Dossari",
        location: "makkah",
        locationLabel: "🕋 Masjidil Haram, Makkah",
        category: "makkah",
        momen: "Sholat Maghrib Makkah",
        videoId: "N2RJNdzafDw",
        duration: "08:12",
        description: "Kompilasi variasi nada dan maqam bacaan Surah Al-Fatihah dari Syaikh Yasser Al-Dossari saat mengimami sholat jahriyah di Masjidil Haram.",
        tags: ["Al-Fatihah", "Maqam", "Yasser Ad-Dossari", "Makkah"]
    },
    {
        id: "makkah-rain-quran",
        title: "Momen Syahdu: Hujan Deras di Ka'bah & Murottal Menyentuh",
        imam: "Murottal Harmoni Haramain",
        location: "makkah",
        locationLabel: "🕋 Masjidil Haram, Makkah",
        category: "hujan",
        momen: "Hujan Rahmat di Ka'bah",
        videoId: "8J38rhuDlK8",
        duration: "15:30",
        description: "Suasana syahdu ketika hujan lebat mengguyur Ka'bah dan ribuan jamaah tetap khusyuk berthawaf diiringi lantunan tilawah Al-Qur'an.",
        tags: ["Hujan Ka'bah", "Momen Syahdu", "Thawaf", "Makkah"]
    },
    {
        id: "qasim-madinah-taraweeh",
        title: "Sholat Tarawih Penuh Ketenangan di Masjid Nabawi",
        imam: "Syaikh Dr. Abdul Muhsin Al-Qasim",
        location: "madinah",
        locationLabel: "🕌 Masjid An-Nabawi, Madinah",
        category: "tarawih",
        momen: "Tarawih Masjid Nabawi",
        videoId: "8AP60bpEn8A",
        duration: "22:10",
        description: "Lantunan sholat Tarawih yang tenang, tertib, dan mendalam oleh Syaikh Abdul Muhsin Al-Qasim di hadapan jamaah Masjid Nabawi Madinah.",
        tags: ["Tarawih", "Abdul Muhsin Al-Qasim", "Madinah", "Nabawi"]
    },
    {
        id: "qasim-madinah-maghrib",
        title: "Sholat Maghrib Paling Berkesan di Masjid Nabawi",
        imam: "Syaikh Dr. Abdul Muhsin Al-Qasim",
        location: "madinah",
        locationLabel: "🕌 Masjid An-Nabawi, Madinah",
        category: "madinah",
        momen: "Sholat Maghrib Madinah",
        videoId: "BJ7FdgHKiOk",
        duration: "07:15",
        description: "Dokumentasi sholat Maghrib berjamaah penuh kekhidmatan di Masjid Rasulullah ﷺ Madinah Al-Munawwarah.",
        tags: ["Maghrib", "Abdul Muhsin Al-Qasim", "Madinah", "Nabawi"]
    },
    {
        id: "hudhaify-madinah-isha",
        title: "Wibawa Bacaan Tartil Sholat Isya Masjid Nabawi",
        imam: "Syaikh Ali Al-Hudhaify",
        location: "madinah",
        locationLabel: "🕌 Masjid An-Nabawi, Madinah",
        category: "madinah",
        momen: "Sholat Isya Malam Ramadhan",
        videoId: "5q_DG2UiGdI",
        duration: "11:05",
        description: "Tartil khas Madinah yang berwibawa, tajwid presisi, dan tenang dari Syaikh Ali Al-Hudhaify, sesepuh Imam Masjid Nabawi.",
        tags: ["Isya", "Ali Al-Hudhaify", "Madinah", "Tartil Khas"]
    },
    {
        id: "qasim-tahajjud-aliimran",
        title: "Tahajjud Menggetarkan Jiwa — Surah Ali 'Imran",
        imam: "Syaikh Dr. Abdul Muhsin Al-Qasim",
        location: "madinah",
        locationLabel: "🕌 Masjid An-Nabawi, Madinah",
        category: "tarawih",
        momen: "Tahajjud 10 Malam Terakhir",
        videoId: "ag8g3hXl_gc",
        duration: "16:40",
        description: "Sholat Tahajjud di sepertiga malam terakhir Ramadhan di Masjid Nabawi melantunkan ayat-ayat mulia Surah Ali 'Imran.",
        tags: ["Tahajjud", "Ali 'Imran", "Abdul Muhsin Al-Qasim", "Madinah"]
    },
    {
        id: "muaiqly-isha-makkah",
        title: "Lantunan Menyejukkan Hati Sholat Isya di Depan Ka'bah",
        imam: "Syaikh Dr. Mahir Al-Muaiqly",
        location: "makkah",
        locationLabel: "🕋 Masjidil Haram, Makkah",
        category: "makkah",
        momen: "Sholat Isya Makkah",
        videoId: "DlVB71OHGfE",
        duration: "08:50",
        description: "Sholat Isya berjamaah di sekeliling Ka'bah diimami oleh Syaikh Mahir Al-Muaiqly dengan suara bening dan penuh kelembutan.",
        tags: ["Isya", "Mahir Al-Muaiqly", "Makkah", "Ka'bah"]
    }
];
