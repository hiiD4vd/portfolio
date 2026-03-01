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
  firstImg.src = `./vangogh-compressed/frame_001.webp`;
  images[0] = firstImg;

  firstImg.onload = () => {
    render();
  };

  let isLoaded = false;
  const targetElement = document.getElementById("vangogh-pin-target");
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoaded) {
        isLoaded = true;
        // Di dalam IntersectionObserver Vangogh:
        let f = 1;
        const speed = 5;

        function loadVangogh() {
          if (f >= frameCount) return;
          const idx = f++;
          const img = new Image();
          img.src = `./vangogh-compressed/frame_${(idx + 1).toString().padStart(3, "0")}.webp`;
          img.onload = () => {
            images[idx] = img;
            loadVangogh();
          };
          img.onerror = () => loadVangogh();
        }
        for (let i = 0; i < speed; i++) loadVangogh();
        observer.disconnect();
      }
    },
    { rootMargin: "800px 0px" },
  );

  if (targetElement) observer.observe(targetElement);

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
  const images = []; // Array untuk menampung objek Image
  const canvasObj = { frame: 0 };

  // 1. Muat Frame Pertama sebagai Anchor
  const firstImg = new Image();
  firstImg.src = imagePathFunc(0);
  images[0] = firstImg;

  firstImg.onload = () => {
    render();
  };

  // 2. Observer dengan Sequential Loading (Anti-DDoS Jaringan)
  let isLoaded = false;
  const targetElement = document.querySelector(sectionId);
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoaded) {
        isLoaded = true;
        // Di dalam IntersectionObserver Museum:
        let f = 1;
        const workers = 5;

        function loadMuseum() {
          if (f >= frameCount) return;
          const index = f++;
          const img = new Image();
          img.src = imagePathFunc(index);
          img.onload = () => {
            images[index] = img;
            loadMuseum();
          };
          img.onerror = () => loadMuseum();
        }
        for (let i = 0; i < workers; i++) loadMuseum();

        function loadSequentially() {
          if (f >= frameCount) return;
          const img = new Image();
          img.src = imagePathFunc(f);
          img.onload = () => {
            images[f] = img; // Simpan di indeks yang tepat
            f++;
            loadSequentially(); // Lanjut ke frame berikutnya
          };
          img.onerror = () => {
            f++;
            loadSequentially();
          };
        }
        loadSequentially();
        observer.disconnect();
      }
    },
    { rootMargin: "800px 0px" }, // Disesuaikan agar tidak terlalu agresif
  );

  if (targetElement) observer.observe(targetElement);

  // 3. Render Engine dengan Fallback Frame (Anti-Layar Hitam)
  function render() {
    const targetFrame = Math.round(canvasObj.frame);

    // Cari frame terakhir yang benar-benar sudah selesai didownload
    let bestFrame = targetFrame;
    while (
      bestFrame >= 0 &&
      (!images[bestFrame] || !images[bestFrame].complete)
    ) {
      bestFrame--;
    }

    if (bestFrame < 0) return; // Belum ada gambar sama sekali

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

  gsap.to(canvasObj, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      trigger: sectionId,
      start: "top top",
      end: "bottom bottom", // Pastikan end sesuai dengan tinggi section di CSS
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

  const firstImg = new Image();
  firstImg.src = `./david-compressed/frame_001.webp`;
  images[0] = firstImg; // Simpan di index 0

  firstImg.onload = () => {
    render();
    let frameIndex = 1;
    const batchSize = 5; // 5 unduhan sekaligus

    function loadNext() {
      if (frameIndex >= frameCount) return;
      const current = frameIndex++;
      const img = new Image();
      img.src = `./david-compressed/frame_${(current + 1).toString().padStart(3, "0")}.webp`;
      img.onload = () => {
        images[current] = img;
        loadNext();
      };
      img.onerror = () => loadNext();
    }
    for (let i = 0; i < batchSize; i++) loadNext();
  };

  // MEMORY MANAGEMENT: Hapus saat scroll jauh ke bawah (Gunakan ScrollTrigger)
  ScrollTrigger.create({
    trigger: "#duality-pin-target", // Trigger saat masuk section 2
    onEnter: () => {
      images.length = 0;
    }, // Kosongkan RAM Hero
    onLeaveBack: () => setupHeroSequence(), // Re-init (ambil dari Cache) jika naik lagi
  });

  function render() {
    const targetFrame = Math.round(canvasObj.frame);
    let bestFrame = targetFrame;
    // Cari frame tersedia ke belakang untuk cegah layar hitam
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
  firstImg.src = `./duality-compressed/frame_001.webp`;
  images[0] = firstImg;

  firstImg.onload = () => {
    render();
  };

  let isLoaded = false;
  const targetElement = document.getElementById("duality-pin-target");
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoaded) {
        // Di dalam IntersectionObserver duality:
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
      }
    },
    { rootMargin: "800px 0px" },
  );

  if (targetElement) observer.observe(targetElement);

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
  (i) =>
    `./museum-compressed/frame_${(i + 1).toString().padStart(3, "0")}.webp`,
  240,
);
