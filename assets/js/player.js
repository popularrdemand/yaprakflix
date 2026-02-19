// 1. Veri Kaydetme ve Okuma Fonksiyonları
function saveProgress(episodeId, time, duration) {
  if (!episodeId || !duration) return;

  let progress = JSON.parse(localStorage.getItem("yaprak_progress") || "{}");

  // İzleme yüzdesini hesapla
  const percent = Math.floor((time / duration) * 100);

  // Veriyi obje olarak sakla (Hem saniye hem yüzde)
  progress[episodeId] = {
    time: time,
    percent: percent,
  };

  localStorage.setItem("yaprak_progress", JSON.stringify(progress));
}

function getProgress(episodeId) {
  let progress = JSON.parse(localStorage.getItem("yaprak_progress") || "{}");
  const saved = progress[episodeId];

  // Eğer veri bir objeyse .time kısmını döndür, değilse (eskiden kalmaysa) direkt veriyi döndür
  if (saved && typeof saved === "object") {
    return saved.time;
  }
  return saved || 0;
}

// 2. URL Parametrelerini Al
const params = new URLSearchParams(window.location.search);
const videoId = params.get("id");
const videoUrl = params.get("url");
const posterUrl = params.get("poster");
const videoTitle = params.get("title");

// 3. Player Kurulumu
if (videoUrl) {
  const playerElement = document.getElementById("player");
  playerElement.src = decodeURIComponent(videoUrl);

  if (posterUrl) {
    playerElement.setAttribute("poster", decodeURIComponent(posterUrl));
  }

  // player.js içine ekle
  const player = new Plyr("#player", {
    title: videoTitle,
    autoplay: true,
    keyboard: { focused: true, global: true },
    tooltips: { controls: true, seek: true },
    displayDuration: true,
  });

  // Sayfa yüklendiğinde otomatik odaklanma
  player.on("ready", () => {
    // Mi Box gibi cihazlarda direkt etkileşim için
    document.querySelector(".plyr").focus();
  });

  // Video yüklendiğinde kaldığı yere sar
  player.on("canplay", () => {
    const savedTime = getProgress(videoId);
    // Eğer 10 saniyeden fazla izlenmişse ve player henüz başlangıçtaysa
    if (savedTime > 10 && player.currentTime < 1) {
      player.currentTime = savedTime;
    }
  });

  // İzleme sırasında süreyi ve yüzdeyi kaydet
  let lastSaved = 0;
  player.on("timeupdate", () => {
    const currentTime = Math.floor(player.currentTime);
    const duration = Math.floor(player.duration);

    // Her 5 saniyede bir kaydet (Performans için)
    if (currentTime % 5 === 0 && currentTime !== lastSaved) {
      saveProgress(videoId, currentTime, duration);
      lastSaved = currentTime;
    }
  });

  // Video bittiğinde ilerlemeyi sıfırla (Opsiyonel: Başa dönmemesi için)
  player.on("ended", () => {
    saveProgress(videoId, 0, 100);
  });
}

// player.js dosyanızın en üstüne veya parametrelerin alındığı yere ekleyin:
const urlParams = new URLSearchParams(window.location.search);
const episodeTitle = urlParams.get("title"); // Örn: "1. Bölüm"
const seasonTitle = urlParams.get("season") || "1. Sezon"; // URL'de yoksa varsayılan 1. Sezon

// HTML'deki elementleri güncelle
if (episodeTitle) {
  document.getElementById("info-episode-detail").textContent =
    `${seasonTitle}, ${episodeTitle}`;
}
