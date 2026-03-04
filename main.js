// Inisialisasi Lenis
const lenis = new Lenis({ duration: 1.2, smooth: true });

// Sinkronisasi posisi scroll Lenis ke GSAP ScrollTrigger
lenis.on("scroll", ScrollTrigger.update);

// Minta GSAP untuk mengendalikan RAF Lenis agar satu irama
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// RENAISSANCE PRELOADER LOGIC
// ==========================================
function setupPreloader() {
  // 1. Hentikan fungsi scroll sementara
  lenis.stop();
  window.scrollTo(0, 0);

  const preloader = document.getElementById("brutalist-preloader");
  const progressText = document.getElementById("progress-text");

  if (!preloader) return;

  let progress = 0;
  const speed = 30; // Kecepatan loading (makin kecil makin cepat)

  function updateProgress() {
    progress += Math.floor(Math.random() * 5) + 1; // Angka naik acak agar natural

    if (progress > 100) progress = 100;

    // Format angka 2 digit (01, 09, 99, 100)
    progressText.innerText = progress.toString().padStart(2, "0");

    if (progress < 100) {
      setTimeout(updateProgress, speed);
    } else {
      // 2. Tahan di 100% sebentar agar dramatis, lalu angkat tirai
      setTimeout(revealWebsite, 600);
    }
  }

  function revealWebsite() {
    // Menggunakan GSAP untuk menarik layar hitam ke atas
    gsap.to(preloader, {
      yPercent: -100,
      ease: "power4.inOut",
      duration: 1.5,
      onComplete: () => {
        preloader.style.display = "none"; // Buang dari DOM setelah selesai

        // 3. Buka Kunci Lenis: Pengguna sekarang bisa scroll ke bawah
        lenis.start();
      },
    });
  }

  // Mulai simulasi
  updateProgress();
}

setupPreloader();
// ==========================================
// KELAS ABSTRAKSI CANVAS RENDERER
// ==========================================
class CanvasSequence {
  constructor(canvasId, imagePathCallback, frameCount) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas ? this.canvas.getContext("2d") : null;
    this.frameCount = frameCount;
    this.images = [];
    this.canvasObj = { frame: 0 };
    this.imagePathCallback = imagePathCallback;
    this.isLoaded = false;

    if (this.canvas) {
      this.render = this.render.bind(this);
      window.addEventListener("resize", this.render);
    }
  }

  render() {
    if (!this.canvas) return;
    const targetFrame = Math.round(this.canvasObj.frame);
    let bestFrame = targetFrame;
    while (
      bestFrame >= 0 &&
      (!this.images[bestFrame] || !this.images[bestFrame].complete)
    ) {
      bestFrame--;
    }
    if (bestFrame < 0) return;

    const img = this.images[bestFrame];
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const ratio = Math.max(
      this.canvas.width / img.width,
      this.canvas.height / img.height,
    );

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      (this.canvas.width - img.width * ratio) / 2,
      (this.canvas.height - img.height * ratio) / 2,
      img.width * ratio,
      img.height * ratio,
    );
  }

  loadFirstFrame() {
    if (!this.canvas) return;
    const firstImg = new Image();
    firstImg.src = this.imagePathCallback(0);
    firstImg.onload = () => {
      this.images[0] = firstImg;
      this.render();
    };
  }

  preloadImages(batchSize = 5) {
    if (this.isLoaded || !this.canvas) return;
    this.isLoaded = true;
    let f = 1;
    const loadNext = () => {
      if (f >= this.frameCount) return;
      const idx = f++;
      const img = new Image();
      img.src = this.imagePathCallback(idx);
      img.onload = () => {
        this.images[idx] = img;
        loadNext();
      };
      img.onerror = () => loadNext();
    };
    for (let i = 0; i < batchSize; i++) loadNext();
  }
}

// ==========================================
// 2. SETUP GENERIC CANVAS SCRUBBING (Museum)
// ==========================================
function setupCanvasScrubbing(canvasId, sectionId, imagePathFunc, frameCount) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const images = [];
  const canvasObj = { frame: 0 };
  let isLoaded = false;

  function render() {
    const targetFrame = Math.round(canvasObj.frame);
    let bestFrame = targetFrame;
    while (
      bestFrame >= 0 &&
      (!images[bestFrame] || !images[bestFrame].complete)
    ) {
      bestFrame--;
    }
    if (bestFrame < 0) return;

    const img = images[bestFrame];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ratio = Math.max(
      canvas.width / img.width,
      canvas.height / img.height,
    );
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      (canvas.width - img.width * ratio) / 2,
      (canvas.height - img.height * ratio) / 2,
      img.width * ratio,
      img.height * ratio,
    );
  }

  window.addEventListener("resize", render);

  const firstImg = new Image();
  firstImg.src = imagePathFunc(0);
  firstImg.onload = () => {
    images[0] = firstImg;
    render();
  };

  ScrollTrigger.create({
    trigger: sectionId,
    start: "top 200%",
    onEnter: () => {
      if (isLoaded) return;
      isLoaded = true;
      let f = 1;
      const batchSize = 5;
      function loadNext() {
        if (f >= frameCount) return;
        const index = f++;
        const img = new Image();
        img.src = imagePathFunc(index);
        img.onload = () => {
          images[index] = img;
          loadNext();
        };
        img.onerror = () => loadNext();
      }
      for (let i = 0; i < batchSize; i++) loadNext();
    },
  });

  gsap.to(canvasObj, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      trigger: sectionId,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
    onUpdate: render,
  });
}

function setupDualityScrapbook() {
  const dualityCanvas = new CanvasSequence(
    "duality-canvas",
    (i) =>
      `./duality-compressed/frame_${(i + 1).toString().padStart(3, "0")}.webp`,
    150,
  );
  if (!dualityCanvas.canvas) return;

  dualityCanvas.loadFirstFrame();

  ScrollTrigger.create({
    trigger: "#duality-pin-target",
    start: "top 200%",
    onEnter: () => dualityCanvas.preloadImages(4),
  });

  const scrapbookPanel = document.getElementById("scrapbook-panel");
  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#duality-pin-target",
      start: "top top",
      end: "+=5000",
      pin: true,
      scrub: true,
    },
  });

  tl.to(
    dualityCanvas.canvasObj,
    {
      frame: 149,
      snap: "frame",
      ease: "none",
      duration: 2,
      onUpdate: dualityCanvas.render,
    },
    0,
  );
  tl.to("#duality-text-layer", { top: "-100%", ease: "none", duration: 2 }, 0);
  tl.to(
    scrapbookPanel,
    { y: () => -scrapbookPanel.offsetHeight, ease: "none", duration: 3 },
    0.8,
  );
}

// ==========================================
// 5. SETUP TEXT REVEAL SCRUBBING
// ==========================================
function setupTextReveal() {
  const textElement = document.getElementById("reveal-text");
  if (!textElement) return;

  // 1. Vanilla JS String Splitter (Memecah 1 paragraf menjadi elemen per kata)
  const text = textElement.innerText;
  const words = text.split(" ");
  textElement.innerHTML = ""; // Kosongkan paragraf asli

  // Bungkus setiap kata dengan tag <span>
  words.forEach((word) => {
    const span = document.createElement("span");
    span.className = "reveal-word";
    span.innerText = word;
    textElement.appendChild(span);
  });

  // 2. Eksekusi GSAP ScrollTrigger
  const wordsArray = gsap.utils.toArray(".reveal-word");

  gsap.to(wordsArray, {
    color: "#ffffff", // Berubah menyala menjadi putih murni
    stagger: 1, // Kunci animasi berurutan (kiri ke kanan, turun ke bawah)
    scrollTrigger: {
      trigger: "#text-reveal-section",
      start: "top top", // Trigger saat layar hitam menyentuh atap
      end: "+=150%", // Tahan layar (pin) sejauh 1.5x tinggi layar untuk waktu baca
      pin: true, // Kunci halaman agar tidak melorot ke Duality sebelum teks selesai dibaca
      scrub: 0.5, // Animasi sangat mulus terikat pada scroll wheel
    },
  });
}

function bukaTab(elemenTombol, namaTab) {
  // Tangkap elemen-elemen asli Anda
  const kertas = document.querySelector(".scrapbook-paper");
  const kiri = document.querySelector(".left-column");
  const kanan = document.querySelector(".right-column");
  const semuaTabTambahan = document.querySelectorAll(".isi-tab");

  // 1. Sembunyikan dulu tab tambahan (Perjalanan & Resume)
  for (let i = 0; i < semuaTabTambahan.length; i++) {
    semuaTabTambahan[i].style.display = "none";
  }

  // 2. Logika Sembunyi & Tampil
  if (namaTab === "profil") {
    // KEMBALI KE PROFIL: Hidupkan lagi semuanya seperti semula
    kertas.style.display = "grid"; // Kembalikan ke grid asli
    kiri.style.display = "block"; // Munculkan kiri
    kanan.style.display = "flex"; // Munculkan kanan (aslinya flex)
  } else {
    // PINDAH TAB: Matikan grid dan sembunyikan profil
    kertas.style.display = "block"; // Jadi block agar tab baru full-width
    kiri.style.display = "none"; // Matikan kiri
    kanan.style.display = "none"; // Matikan kanan (Lanyard otomatis ikut hilang!)

    // Munculkan tab yang dituju
    document.getElementById(namaTab).style.display = "block";
  }

  // 3. Atur warna tombol tab yang putih
  const semuaTombol = document.querySelectorAll(".tab");
  for (let i = 0; i < semuaTombol.length; i++) {
    semuaTombol[i].classList.remove("active");
  }
  elemenTombol.classList.add("active");
}

// setupCanvasScrubbing(
//   "museum-canvas",
//   "#museum-section",
//   (i) =>
//     `./museum-compressed/frame_${(i + 1).toString().padStart(3, "0")}.webp`,
//   240,
// );

function setupMuseumGrandOpening() {
  // Inisiasi dari class CanvasSequence yang baru
  const museumCanvas = new CanvasSequence(
    "museum-canvas",
    (i) =>
      `./museum-compressed/frame_${(i + 1).toString().padStart(3, "0")}.webp`,
    240,
  );
  if (!museumCanvas.canvas) return;

  museumCanvas.loadFirstFrame();

  // Pre-loader pintar
  ScrollTrigger.create({
    trigger: "#museum-section",
    start: "top 200%",
    onEnter: () => museumCanvas.preloadImages(5),
  });

  // ------------------------------------------
  // MASTER TIMELINE: JEDA VERTIKAL + ANIMASI BANTU-IN
  // ------------------------------------------
  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#museum-section",
      start: "top top",
      end: "+=40000", // Durasi scroll ekstrem tetap dipertahankan
      pin: true,
      scrub: 1,
    },
  });

  // 1. Pintu Terbelah
  tl.to(
    ".left-door",
    { xPercent: -100, duration: 2, ease: "power2.inOut" },
    "split",
  );
  tl.to(
    ".right-door",
    { xPercent: 100, duration: 2, ease: "power2.inOut" },
    "split",
  );

  // 2. Pemindaian DOM (Looping Proyek)
  const panels = document.querySelectorAll(".project-bantuin-style");
  const totalPanels = panels.length;

  if (totalPanels > 0) {
    const frameStep = Math.floor((240 - 1) / (totalPanels + 1));
    let currentFrameTarget = 0;

    panels.forEach((panel) => {
      currentFrameTarget += frameStep;

      // FASE A: Museum berjalan ke titik perhentian, lalu DIAM TOTAL
      tl.to(museumCanvas.canvasObj, {
        frame: currentFrameTarget,
        snap: "frame",
        ease: "none",
        duration: 4,
        onUpdate: museumCanvas.render, // Terikat pada method render di class
      });

      // FASE B: Animasi Kloningan Bantu-In (Ditarik lurus ke atas tanpa henti)
      tl.to(panel, {
        y: () => -(window.innerHeight + panel.offsetHeight),
        ease: "none",
        duration: 50,
      });
    });

    // FASE C: Setelah semua proyek habis, museum sisa jalan ke ujung lorong
    tl.to(museumCanvas.canvasObj, {
      frame: 240 - 1,
      snap: "frame",
      ease: "none",
      duration: 4,
      onUpdate: museumCanvas.render,
    });
  } else {
    tl.to(museumCanvas.canvasObj, {
      frame: 240 - 1,
      snap: "frame",
      ease: "none",
      duration: 10,
      onUpdate: museumCanvas.render,
    });
  }

  // 3. Buffer Mutlak
  tl.to({}, { duration: 2 });
}
// ==========================================
// SETUP HORIZONTAL SCROLL GALLERY (Sertifikat dengan Efek "Nyangkut/Pause")
// ==========================================
function setupCertificateGallery() {
  const track = document.querySelector(".cert-track");
  const panels = gsap.utils.toArray(".cert-panel");

  // Matikan fungsi jika sertifikat kurang dari 2
  if (!track || panels.length < 2) return;

  // FAKTA MATEMATIKA: Agar durasi scroll menyesuaikan banyaknya sertifikat
  // Kita kalikan lebar 1 layar penuh dengan jumlah panel agar tidak terlalu cepat
  const totalScrollDistance = panels.length * window.innerWidth;

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#certificate-vault",
      pin: true,
      scrub: 1, // Efek inersia/karet saat berhenti
      end: () => "+=" + totalScrollDistance,
    },
  });

  // Looping ke setiap panel sertifikat
  panels.forEach((panel, i) => {
    // 1. Logika Pergerakan: Jika bukan panel pertama, tarik layar ke kiri
    if (i > 0) {
      tl.to(track, {
        x: () => -(window.innerWidth * i),
        // FAKTA UX: Menggunakan "power1.inOut" alih-alih "none"
        // agar geserannya seperti mobil (ada gas awal yang halus, dan rem halus saat mau berhenti)
        ease: "power1.inOut",
        duration: 1,
      });
    }

    // 2. LOGIKA "NYANGKUT" (PAUSE)
    // Menyisipkan durasi kosong di mana elemen diam absolut meski roda scroll diputar.
    // Ubah angka 0.4 menjadi lebih besar (misal 0.8) jika ingin nyangkutnya lebih lama,
    // atau perkecil (misal 0.2) jika ingin nyangkutnya sebentar saja.
    tl.to({}, { duration: 0.4 });
  });
}

// ==========================================
// AI EVALUATOR LOGIC (Terhubung ke Vercel API)
// ==========================================
function setupAITerminal() {
  const btnAnalyze = document.getElementById("btn-analyze");
  const inputJob = document.getElementById("job-input");
  const outputConsole = document.getElementById("console-output");

  if (!btnAnalyze) return;

  btnAnalyze.addEventListener("click", async () => {
    const jobText = inputJob.value.trim();
    if (!jobText) {
      outputConsole.innerHTML =
        "> ERROR: Job Description string cannot be empty.<span class='blink'>_</span>";
      return;
    }

    // 1. Fase Pemindaian Visual
    outputConsole.innerHTML =
      "> Executing NLP semantic analysis via LLM...<br>> Extracting candidate parameters...<br>> Contacting Neural Server...<br><br>";
    btnAnalyze.style.pointerEvents = "none";
    btnAnalyze.innerText = "[ PROCESSING... ]";
    inputJob.disabled = true;

    try {
      // 2. Memanggil API Asli Anda
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobText }),
      });

      if (!response.ok) throw new Error("Server disconnected.");

      const data = await response.json();

      // 3. Efek Pengetikan Hasil Asli
      let outputString = `> <span style="color: #27c93f; font-weight: bold;">MATCH SCORE: ${data.score || "90%"}</span><br><br>`;
      outputString += `> CRITICAL SYNERGY DETECTED:<br>  ${data.synergy || "Kompetensi teknis selaras dengan parameter."}<br><br>`;
      outputString += `> RECOMMENDATION: ${data.verdict || "Proceed to contact."}<span class='blink'>_</span>`;

      // Jeda dramatis 1.5 detik sebelum memunculkan hasil
      setTimeout(() => {
        outputConsole.innerHTML += outputString;

        // Buka Kunci
        btnAnalyze.style.pointerEvents = "auto";
        btnAnalyze.innerText = "[ RUN_NEW_EVALUATION.exe ]";
        inputJob.disabled = false;

        // Jika skor tinggi, paksa browser scroll ke bagian kontak secara mulus
        setTimeout(() => {
          lenis.scrollTo("#contact-grid-section");
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error(error);
      outputConsole.innerHTML += `> <span style="color: #e40a3e;">CRITICAL ERROR: API Server Offline. Menggunakan simulasi lokal...</span><br><br>`;

      // Fallback jika API belum siap
      setTimeout(() => {
        outputConsole.innerHTML += `> <span style="color: #27c93f; font-weight: bold;">MATCH SCORE: 96%</span><br>> CRITICAL OVERLAP DETECTED:<br>  - High-Fidelity UI/UX & Canvas Manipulation<br>  - Full-Stack Architecture<br><br>> RECOMMENDATION: Candidate architecture exceeds parameters. Proceed to contact.<span class='blink'>_</span>`;
        btnAnalyze.style.pointerEvents = "auto";
        btnAnalyze.innerText = "[ RUN_NEW_EVALUATION.exe ]";
        inputJob.disabled = false;
      }, 1000);
    }
  });
}

setupAITerminal();

// JANGAN LUPA PANGGIL FUNGSINYA
setupTextReveal();

// EKSEKUSI SEMUA

setupDualityScrapbook();

// Panggil fungsinya
setupMuseumGrandOpening();

setupCertificateGallery();
// ==========================================
// KONTROL KOORDINAT CIRCULAR CURSOR
// ==========================================
const customCursor = document.getElementById("circular-cursor");

// Mengecek apakah perangkat memiliki mouse (mengabaikan HP/Tablet)
if (window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener("mousemove", (e) => {
    // Menggunakan RequestAnimationFrame secara tidak langsung via CSS calc
    // untuk mencegah lag pada main thread
    customCursor.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
  });
}
