// Inisialisasi Lenis
const lenis = new Lenis({ duration: 1.2, smooth: true });

// Sinkronisasi posisi scroll Lenis ke GSAP ScrollTrigger
lenis.on("scroll", ScrollTrigger.update);

// Minta GSAP untuk mengendalikan RAF Lenis agar satu irama
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Matikan lag smoothing GSAP agar tidak bentrok dengan kalkulasi Lenis
gsap.ticker.lagSmoothing(0);

gsap.registerPlugin(ScrollTrigger);

function setupVangoghSequence() {
  const canvas = document.getElementById("vangogh-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const frameCount = 240;
  const images = [];
  const canvasObj = { frame: 0 };

  const firstImg = new Image();
  firstImg.src = `./vangogh-frames/frame_001.webp`;
  images.push(firstImg);

  firstImg.onload = () => {
    render();
  };

  // OBSERVER LOGIC
  let isLoaded = false;
  const targetElement = document.getElementById("vangogh-pin-target");
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoaded) {
        isLoaded = true;
        for (let i = 1; i < frameCount; i++) {
          const img = new Image();
          img.src = `./vangogh-frames/frame_${(i + 1).toString().padStart(3, "0")}.webp`;
          images.push(img);
        }
        observer.disconnect();
      }
    },
    { rootMargin: "1500px 0px" },
  );

  if (targetElement) observer.observe(targetElement);

  function render() {
    const frameIndex = Math.round(canvasObj.frame);
    const img = images[frameIndex];

    if (!img || !img.complete) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ratio = Math.max(
      canvas.width / img.width,
      canvas.height / img.height,
    );
    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio,
    );
  }

  window.addEventListener("resize", render);

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

function setupCanvasScrubbing(canvasId, sectionId, imagePathFunc, frameCount) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const images = [];
  const canvasObj = { frame: 0 };

  const firstImg = new Image();
  firstImg.src = imagePathFunc(0);
  images.push(firstImg);

  firstImg.onload = () => {
    render();
  };

  // OBSERVER LOGIC
  let isLoaded = false;
  const targetElement = document.querySelector(sectionId);
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoaded) {
        isLoaded = true;
        for (let i = 1; i < frameCount; i++) {
          const img = new Image();
          img.src = imagePathFunc(i);
          images.push(img);
        }
        observer.disconnect();
      }
    },
    { rootMargin: "1500px 0px" },
  );

  if (targetElement) observer.observe(targetElement);

  function render() {
    const frameIndex = Math.round(canvasObj.frame);
    const img = images[frameIndex];

    if (!img || !img.complete) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ratio = Math.max(
      canvas.width / img.width,
      canvas.height / img.height,
    );
    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio,
    );
  }

  window.addEventListener("resize", render);

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

function setupHeroSequence() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const frameCount = 240;
  const images = [];
  const canvasObj = { frame: 0 };

  // 1. Inisialisasi Frame Pertama
  const firstImg = new Image();
  firstImg.src = `./david-frames/frame_001.webp`;
  images.push(firstImg);

  // --- MASUKKAN KODE INI ---
  firstImg.onload = () => {
    render(); // Langsung tampilkan frame 1 agar user tidak melihat layar hitam

    let frameIndex = 2; // Kita mulai antrean dari frame ke-2

    function loadNext() {
      if (frameIndex > frameCount) return; // Berhenti jika sudah frame 240

      const img = new Image();
      img.src = `./david-frames/frame_${frameIndex.toString().padStart(3, "0")}.webp`;

      img.onload = () => {
        images.push(img); // Masukkan ke array jika unduhan selesai
        frameIndex++;
        loadNext(); // Panggil dirinya sendiri untuk memuat frame berikutnya (Estafet)
      };

      img.onerror = () => {
        frameIndex++; // Jika 1 gambar rusak, jangan berhenti, lanjut ke berikutnya
        loadNext();
      };
    }

    loadNext(); // Jalankan mesin pengunduh otomatis di latar belakang
  };
  // -------------------------

  // 3. Fungsi Render yang Aman
  function render() {
    const frameIndex = Math.round(canvasObj.frame);
    const img = images[frameIndex];

    // Jika Anda scroll sangat cepat dan gambar belum termuat,
    // sistem akan mempertahankan frame terakhir agar tidak crash.
    if (!img || !img.complete) return;

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

  // 4. GSAP Timeline
  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero-pin-target",
      start: "top top",
      end: "+=4000",
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
      duration: 4,
      onUpdate: render,
    },
    0,
  );
  tl.to("#hero-text", { top: "-100%", ease: "none", duration: 1 }, 0);
  tl.to("#hero-text-1", { top: "-100%", ease: "none", duration: 1.5 }, 0.5);
  tl.to("#hero-text-2", { top: "-100%", ease: "none", duration: 1.5 }, 1.5);
  tl.to("#hero-text-3", { top: "-100%", ease: "none", duration: 1.5 }, 2.5);
}

function setupDualityScrapbook() {
  const canvas = document.getElementById("duality-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const frameCount = 150;
  const images = [];
  const canvasObj = { frame: 0 };

  const firstImg = new Image();
  firstImg.src = `./duality-frames/frame_001.webp`;
  images.push(firstImg);

  firstImg.onload = () => {
    render();
  };

  // OBSERVER LOGIC
  let isLoaded = false;
  const targetElement = document.getElementById("duality-pin-target");
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoaded) {
        isLoaded = true;
        for (let i = 1; i < frameCount; i++) {
          const img = new Image();
          img.src = `./duality-frames/frame_${(i + 1).toString().padStart(3, "0")}.webp`;
          images.push(img);
        }
        observer.disconnect();
      }
    },
    { rootMargin: "1500px 0px" },
  );

  if (targetElement) observer.observe(targetElement);

  function render() {
    const frameIndex = Math.round(canvasObj.frame);
    const img = images[frameIndex];

    if (!img || !img.complete) return;

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

// PASTIKAN SEMUA FUNGSI DIPANGGIL AGAR ANIMASI JALAN
setupHeroSequence();
setupDualityScrapbook();
setupVangoghSequence();

// Panggil fungsi generik untuk Museum
setupCanvasScrubbing(
  "museum-canvas",
  "#museum-section",
  (i) => `./museum-frames/frame_${(i + 1).toString().padStart(3, "0")}.webp`,
  240,
);
