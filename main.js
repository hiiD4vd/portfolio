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

// EKSEKUSI SEMUA

setupDualityScrapbook();
setupVangoghSequence();
setupCanvasScrubbing(
  "museum-canvas",
  "#museum-section",
  (i) =>
    `./museum-compressed/frame_${(i + 1).toString().padStart(3, "0")}.webp`,
  240,
);

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
