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
  images[0] = firstImg;

  firstImg.onload = () => {
    render();
  };

  function loadVangogh() {
    let f = 1;
    const speed = 5;
    function innerLoad() {
      if (f >= frameCount) return;
      const idx = f++;
      const img = new Image();
      img.src = `./vangogh-frames/frame_${(idx + 1).toString().padStart(3, "0")}.webp`;
      img.onload = () => {
        images[idx] = img;
        innerLoad();
      };
      img.onerror = () => innerLoad();
    }
    for (let i = 0; i < speed; i++) innerLoad();
  }

  let isLoaded = false;
  const targetElement = document.getElementById("vangogh-pin-target");
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoaded) {
        isLoaded = true;
        loadVangogh();
        observer.disconnect();
      }
    },
    { rootMargin: "800px 0px" },
  );

  if (targetElement) observer.observe(targetElement);

  // NOMOR 3: Memory Management Vangogh (Hapus saat ke atas jauh)
  ScrollTrigger.create({
    trigger: "#vangogh-pin-target",
    start: "top bottom",
    onLeaveBack: () => {
      images.length = 0; // Bersihkan RAM
      isLoaded = false; // Izinkan muat ulang jika balik lagi
    },
  });

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
  const images = [];
  const canvasObj = { frame: 0 };

  const firstImg = new Image();
  firstImg.src = imagePathFunc(0);
  images[0] = firstImg;
  firstImg.onload = () => {
    render();
  };

  function loadMuseum() {
    let f = 1;
    const workers = 5;
    function innerLoad() {
      if (f >= frameCount) return;
      const index = f++;
      const img = new Image();
      img.src = imagePathFunc(index);
      img.onload = () => {
        images[index] = img;
        innerLoad();
      };
      img.onerror = () => innerLoad();
    }
    for (let i = 0; i < workers; i++) innerLoad();
  }

  let isLoaded = false;
  const targetElement = document.querySelector(sectionId);
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoaded) {
        isLoaded = true;
        loadMuseum();
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

  gsap.to(canvasObj, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      trigger: sectionId,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      // NOMOR 3: Memory Management Museum
      onLeave: () => {
        images.length = 0;
      },
      onLeaveBack: () => {
        images.length = 0;
      },
      onEnter: () => {
        isLoaded = false;
      }, // Trigger muat ulang dari cache
      onEnterBack: () => {
        isLoaded = false;
      },
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
  firstImg.src = `./david-frames/frame_001.webp`;
  images[0] = firstImg;

  function loadHero() {
    let frameIndex = 1;
    const batchSize = 5;
    function innerLoad() {
      if (frameIndex >= frameCount) return;
      const current = frameIndex++;
      const img = new Image();
      img.src = `./david-frames/frame_${(current + 1).toString().padStart(3, "0")}.webp`;
      img.onload = () => {
        images[current] = img;
        innerLoad();
      };
      img.onerror = () => innerLoad();
    }
    for (let i = 0; i < batchSize; i++) innerLoad();
  }

  firstImg.onload = () => {
    render();
    loadHero();
  };

  // NOMOR 3: Memory Management Hero
  ScrollTrigger.create({
    trigger: "#duality-pin-target",
    start: "top center",
    onEnter: () => {
      images.length = 0; // Hapus RAM saat masuk section berikutnya
    },
    onLeaveBack: () => {
      loadHero(); // Ambil lagi dari cache saat user balik ke atas
    },
  });

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
  images[0] = firstImg;

  firstImg.onload = () => {
    render();
  };

  function loadDuality() {
    let f = 1;
    const batch = 4;
    function innerLoad() {
      if (f >= frameCount) return;
      const curr = f++;
      const img = new Image();
      img.src = `./duality-frames/frame_${(curr + 1).toString().padStart(3, "0")}.webp`;
      img.onload = () => {
        images[curr] = img;
        innerLoad();
      };
      img.onerror = () => innerLoad();
    }
    for (let i = 0; i < batch; i++) innerLoad();
  }

  let isLoaded = false;
  const targetElement = document.getElementById("duality-pin-target");
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoaded) {
        isLoaded = true;
        loadDuality();
        observer.disconnect();
      }
    },
    { rootMargin: "800px 0px" },
  );

  if (targetElement) observer.observe(targetElement);

  // NOMOR 3: Memory Management Duality
  ScrollTrigger.create({
    trigger: "#duality-pin-target",
    start: "top bottom",
    onLeave: () => {
      images.length = 0;
    },
    onLeaveBack: () => {
      images.length = 0;
    },
    onEnter: () => {
      isLoaded = false;
    },
    onEnterBack: () => {
      isLoaded = false;
    },
  });

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

// EKSEKUSI
setupHeroSequence();
setupDualityScrapbook();
setupVangoghSequence();
setupCanvasScrubbing(
  "museum-canvas",
  "#museum-section",
  (i) => `./museum-frames/frame_${(i + 1).toString().padStart(3, "0")}.webp`,
  240,
);
