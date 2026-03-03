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
// 1. SETUP VANGOGH SEQUENCE (Bantu-In)
// ==========================================
function setupVangoghSequence() {
  const canvas = document.getElementById("vangogh-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const frameCount = 240;
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
  firstImg.src = `./vangogh-compressed/frame_001.webp`;
  firstImg.onload = () => {
    images[0] = firstImg;
    render();
  };

  // PRE-LOADER (HEAD START): Muat diam-diam sebelum user sampai
  ScrollTrigger.create({
    trigger: "#vangogh-pin-target",
    start: "top 200%", // Trigger saat jaraknya masih 1 layar di bawah
    onEnter: () => {
      if (isLoaded) return;
      isLoaded = true;
      let f = 1;
      const batchSize = 5;
      function loadNext() {
        if (f >= frameCount) return;
        const idx = f++;
        const img = new Image();
        img.src = `./vangogh-compressed/frame_${(idx + 1).toString().padStart(3, "0")}.webp`;
        img.onload = () => {
          images[idx] = img;
          loadNext();
        };
        img.onerror = () => loadNext();
      }
      for (let i = 0; i < batchSize; i++) loadNext();
    },
  });

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#vangogh-pin-target",
      start: "top top",
      end: "+=6000",
      pin: true,
      scrub: true,
    },
  });

  tl.to(
    canvasObj,
    {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      duration: 2,
      onUpdate: render,
    },
    0,
  );
  tl.to(
    "#vangogh-content-wrapper",
    { yPercent: -100, ease: "none", duration: 2 },
    0,
  );
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

// ==========================================
// 4. SETUP DUALITY SCRAPBOOK
// ==========================================
function setupDualityScrapbook() {
  const canvas = document.getElementById("duality-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const frameCount = 150;
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
  const scrapbookPanel = document.getElementById("scrapbook-panel");

  const firstImg = new Image();
  firstImg.src = `./duality-compressed/frame_001.webp`;
  firstImg.onload = () => {
    images[0] = firstImg;
    render();
  };

  ScrollTrigger.create({
    trigger: "#duality-pin-target",
    start: "top 200%",
    onEnter: () => {
      if (isLoaded) return;
      isLoaded = true;
      let f = 1;
      const batch = 4;
      function loadDuality() {
        if (f >= frameCount) return;
        const curr = f++;
        const img = new Image();
        img.src = `./duality-compressed/frame_${(curr + 1).toString().padStart(3, "0")}.webp`;
        img.onload = () => {
          images[curr] = img;
          loadDuality();
        };
        img.onerror = () => loadDuality();
      }
      for (let i = 0; i < batch; i++) loadDuality();
    },
  });

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
    canvasObj,
    {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      duration: 2,
      onUpdate: render,
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
  const canvas = document.getElementById("museum-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const frameCount = 240;
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
  firstImg.src = `./museum-compressed/frame_001.webp`;
  firstImg.onload = () => {
    images[0] = firstImg;
    render();
  };

  ScrollTrigger.create({
    trigger: "#museum-section",
    start: "top 200%",
    onEnter: () => {
      if (isLoaded) return;
      isLoaded = true;
      let f = 1;
      function loadNext() {
        if (f >= frameCount) return;
        const index = f++;
        const img = new Image();
        img.src = `./museum-compressed/frame_${(index + 1).toString().padStart(3, "0")}.webp`;
        img.onload = () => {
          images[index] = img;
          loadNext();
        };
        img.onerror = () => loadNext();
      }
      for (let i = 0; i < 5; i++) loadNext();
    },
  });

  // ------------------------------------------
  // MASTER TIMELINE: JEDA VERTIKAL + ANIMASI BANTU-IN
  // ------------------------------------------
  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#museum-section",
      start: "top top",
      end: "+=60000", // FAKTA: Durasi scroll sangat panjang untuk menampung banyak gambar
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
    const frameStep = Math.floor((frameCount - 1) / (totalPanels + 1));
    let currentFrameTarget = 0;

    panels.forEach((panel) => {
      currentFrameTarget += frameStep;

      // FASE A: Museum berjalan ke titik perhentian, lalu DIAM TOTAL
      tl.to(canvasObj, {
        frame: currentFrameTarget,
        snap: "frame",
        ease: "none",
        duration: 4,
        onUpdate: render,
      });

      // FASE B: Animasi Kloningan Bantu-In (Ditarik lurus ke atas tanpa henti)
      tl.to(panel, {
        // Matematika mutlak: Menarik panel dari bawah lantai sampai melewati atap layar
        y: () => -(window.innerHeight + panel.offsetHeight),
        ease: "none",
        duration: 50, // Durasi panjang agar pengguna bisa baca sambil scroll santai
      });
    });

    // FASE C: Setelah semua proyek habis, museum sisa jalan ke ujung lorong
    tl.to(canvasObj, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      duration: 4,
      onUpdate: render,
    });
  } else {
    tl.to(canvasObj, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      duration: 10,
      onUpdate: render,
    });
  }

  // 3. Buffer Mutlak
  tl.to({}, { duration: 2 });
}

// JANGAN LUPA PANGGIL FUNGSINYA
setupTextReveal();

// EKSEKUSI SEMUA

setupDualityScrapbook();

// Panggil fungsinya
setupMuseumGrandOpening();
setupVangoghSequence();

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
