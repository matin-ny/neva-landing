gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// --- ذرات معلق (تونل زمان) ---
const particleCount = 400;
const particleGeo = new THREE.BufferGeometry();
const posArray = new Float32Array(particleCount * 3);
for(let i = 0; i < particleCount * 3; i++) { posArray[i] = (Math.random() - 0.5) * 20; }
particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particleMat = new THREE.PointsMaterial({ size: 0.03, color: 0x87CEEB, transparent: true, opacity: 0.6 });
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

let effectParams = { warpSpeed: 1 }; 

// --- حباب‌های بلور شده ---
const bokehGroup = new THREE.Group();
scene.add(bokehGroup);
for(let i=0; i<15; i++) {
    const bokeh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x87CEEB, transparent: true, opacity: Math.random() * 0.15 + 0.05 })
    );
    bokeh.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, -5 - (Math.random() * 10));
    const scale = Math.random() * 1.5 + 0.5;
    bokeh.scale.setScalar(scale);
    bokehGroup.add(bokeh);
}

// --- آماده سازی ۴ عکس دو بعدی گوشی ---
const textureLoader = new THREE.TextureLoader();
function prepareTexture(tex) { tex.colorSpace = THREE.SRGBColorSpace; tex.flipY = true; tex.center.set(0.5, 0.5); return tex; }
const tex1 = textureLoader.load('screen1.png', prepareTexture);
const tex2 = textureLoader.load('screen2.png', prepareTexture);
const tex3 = textureLoader.load('screen3.png', prepareTexture);
const tex4 = textureLoader.load('screen4.png', prepareTexture); // عکس جدید برای رسپی ها

const screenMaterial = new THREE.MeshBasicMaterial({ map: tex1, transparent: true });
const phoneGroup = new THREE.Group();
scene.add(phoneGroup);

const screenWidth = 1.72; 
const screenHeight = screenWidth * (1504 / 726);
const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(screenWidth, screenHeight), screenMaterial);
phoneGroup.add(screenMesh);

// --- درخشش واکنشی زیر عکس ---
const canvasGlow = document.createElement('canvas');
canvasGlow.width = 256; canvasGlow.height = 256;
const ctx = canvasGlow.getContext('2d');
const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
gradient.addColorStop(0, 'rgba(135, 206, 235, 0.8)'); 
gradient.addColorStop(1, 'rgba(135, 206, 235, 0)');   
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 256, 256);

const glowTex = new THREE.CanvasTexture(canvasGlow);
const glowMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0.6, depthWrite: false });
const glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(screenWidth * 1.8, screenHeight * 1.5), glowMat);
glowMesh.position.z = -0.1; 
phoneGroup.add(glowMesh);


// --- انیمیشن واترمارک پشت صفحه ---
gsap.to(".marquee-right", { xPercent: 30, ease: "none", scrollTrigger: { trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: 1 } });
gsap.to(".marquee-left", { xPercent: -30, ease: "none", scrollTrigger: { trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: 1 } });

// --- منطق تغییر ۴ عکس ---
const onUpdateLogic = function() {
    let t = this.time();
    if (t < 2.5) {
        if(screenMaterial.map !== tex1) { screenMaterial.map = tex1; screenMaterial.needsUpdate = true; }
    } else if (t >= 2.5 && t < 5.5) {
        if(screenMaterial.map !== tex2) { screenMaterial.map = tex2; screenMaterial.needsUpdate = true; }
    } else if (t >= 5.5 && t < 8.5) {
        if(screenMaterial.map !== tex3) { screenMaterial.map = tex3; screenMaterial.needsUpdate = true; }
    } else {
        if(screenMaterial.map !== tex4) { screenMaterial.map = tex4; screenMaterial.needsUpdate = true; }
    }
};

// --- تغییر رنگ هاله‌ها ---
function addDynamicColors(timeline) {
    // مرحله 2: درشت مغذی ها (گرم/نارنجی)
    timeline.to(".blob-1", { backgroundColor: "#FFB74D", duration: 1 }, 1.5);
    timeline.to(".blob-2", { backgroundColor: "#FFCDD2", duration: 1 }, 1.5);
    // مرحله 3: هوش مصنوعی (بنفش مدرن و هوشمند)
    timeline.to(".blob-1", { backgroundColor: "#CE93D8", duration: 1 }, 4.5);
    timeline.to(".blob-2", { backgroundColor: "#F3E5F5", duration: 1 }, 4.5);
    // مرحله 4: رسپی ها (سبز و زرد/طراوت)
    timeline.to(".blob-1", { backgroundColor: "#A5D6A7", duration: 1 }, 7.5);
    timeline.to(".blob-2", { backgroundColor: "#FFF59D", duration: 1 }, 7.5);
}

let mm = gsap.matchMedia();

// --- تایم لاین دسکتاپ ---
mm.add("(min-width: 851px)", () => {
    // 🟢 این ۳ خط جایگزین کدهای قبلی شوند:
    gsap.set(phoneGroup.position, { x: -2.8, y: 0, z: 0 }); 
    gsap.set(phoneGroup.rotation, { x: 0, y: 0, z: 0 }); 
    gsap.set(phoneGroup.scale, { x: 0.01, y: 0.01, z: 0.01 });
    
    screenMaterial.map = tex1;

    let tl = gsap.timeline({ scrollTrigger: { trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: 1.2 }, onUpdate: onUpdateLogic });
    addDynamicColors(tl);

    tl.to(".panel-0", { opacity: 0, scale: 2, duration: 1 }, 0)
      .to(phoneGroup.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "back.out(1.5)" }, 0)
      .to(".panel-1", { opacity: 1, duration: 0.5 }, 0.5);

    // عبور به پنل 2 (هر 3 محور x,y,z صریحاً نوشته شده است)
    tl.to(".panel-1", { opacity: 0, x: 50, duration: 0.8 }, 1.5)
      .to(phoneGroup.position, { x: 0, y: 0, z: 5.5, duration: 1, ease: "power2.in" }, 1.5)
      .to(effectParams, { warpSpeed: 15, duration: 1, ease: "power1.in" }, 1.5)
      .to(glowMesh.material, { opacity: 1, duration: 1 }, 1.5)
      .set(phoneGroup.position, { x: -2.8, y: 0, z: 0 }, 2.5)
      .set(phoneGroup.scale, { x: 0.01, y: 0.01, z: 0.01 }, 2.5)
      .set(effectParams, { warpSpeed: 1 }, 2.5)
      .to(phoneGroup.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "back.out(1.5)" }, 2.5)
      .to(glowMesh.material, { opacity: 0.6, duration: 1 }, 2.5)
      .fromTo(".panel-2", { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.8 }, 2.7);

    // عبور به پنل 3
    tl.to(".panel-2", { opacity: 0, x: 50, duration: 0.8 }, 4.5)
      .to(phoneGroup.position, { x: 0, y: 0, z: 5.5, duration: 1, ease: "power2.in" }, 4.5)
      .to(effectParams, { warpSpeed: 15, duration: 1, ease: "power1.in" }, 4.5)
      .to(glowMesh.material, { opacity: 1, duration: 1 }, 4.5)
      .set(phoneGroup.position, { x: -2.8, y: 0, z: 0 }, 5.5)
      .set(phoneGroup.scale, { x: 0.01, y: 0.01, z: 0.01 }, 5.5)
      .set(effectParams, { warpSpeed: 1 }, 5.5)
      .to(phoneGroup.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "back.out(1.5)" }, 5.5)
      .to(glowMesh.material, { opacity: 0.6, duration: 1 }, 5.5)
      .fromTo(".panel-3", { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.8 }, 5.7);

    // عبور به پنل 4
    tl.to(".panel-3", { opacity: 0, x: 50, duration: 0.8 }, 7.5)
      .to(phoneGroup.position, { x: 0, y: 0, z: 5.5, duration: 1, ease: "power2.in" }, 7.5)
      .to(effectParams, { warpSpeed: 15, duration: 1, ease: "power1.in" }, 7.5)
      .to(glowMesh.material, { opacity: 1, duration: 1 }, 7.5)
      .set(phoneGroup.position, { x: -2.8, y: 0, z: 0 }, 8.5)
      .set(phoneGroup.scale, { x: 0.01, y: 0.01, z: 0.01 }, 8.5)
      .set(effectParams, { warpSpeed: 1 }, 8.5)
      .to(phoneGroup.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "back.out(1.5)" }, 8.5)
      .to(glowMesh.material, { opacity: 0.6, duration: 1 }, 8.5)
      .fromTo(".panel-4", { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.8 }, 8.7);
});

// --- تایم لاین موبایل ---
mm.add("(max-width: 850px)", () => {
    // ریست کردن صریح و قطعی آبجکت برای موبایل
    phoneGroup.position.set(0, 0.8, 0); 
    phoneGroup.rotation.set(0, 0, 0);
    phoneGroup.scale.set(0.01, 0.01, 0.01);
    screenMaterial.map = tex1;

    let tlMobile = gsap.timeline({ scrollTrigger: { trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: 1.2 }, onUpdate: onUpdateLogic });
    addDynamicColors(tlMobile);

    tlMobile.to(".panel-0", { opacity: 0, scale: 2, duration: 1 }, 0)
      .to(phoneGroup.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 1, ease: "back.out(1.5)" }, 0) 
      .to(".panel-1", { opacity: 1, duration: 0.5 }, 0.5);

    // عبور به پنل 2 (جلوگیری از کَش شدن x دسکتاپ با درج x:0)
    tlMobile.to(".panel-1", { opacity: 0, y: 50, duration: 0.8 }, 1.5)
      .to(phoneGroup.position, { x: 0, y: 0, z: 5.5, duration: 1, ease: "power2.in" }, 1.5)
      .to(effectParams, { warpSpeed: 15, duration: 1, ease: "power1.in" }, 1.5)
      .to(glowMesh.material, { opacity: 1, duration: 1 }, 1.5)
      .set(phoneGroup.position, { x: 0, y: 0.8, z: 0 }, 2.5)
      .set(phoneGroup.scale, { x: 0.01, y: 0.01, z: 0.01 }, 2.5)
      .set(effectParams, { warpSpeed: 1 }, 2.5)
      .to(phoneGroup.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 1, ease: "back.out(1.5)" }, 2.5)
      .to(glowMesh.material, { opacity: 0.6, duration: 1 }, 2.5)
      .fromTo(".panel-2", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8 }, 2.7);

    // عبور به پنل 3
    tlMobile.to(".panel-2", { opacity: 0, y: 50, duration: 0.8 }, 4.5)
      .to(phoneGroup.position, { x: 0, y: 0, z: 5.5, duration: 1, ease: "power2.in" }, 4.5)
      .to(effectParams, { warpSpeed: 15, duration: 1, ease: "power1.in" }, 4.5)
      .to(glowMesh.material, { opacity: 1, duration: 1 }, 4.5)
      .set(phoneGroup.position, { x: 0, y: 0.8, z: 0 }, 5.5)
      .set(phoneGroup.scale, { x: 0.01, y: 0.01, z: 0.01 }, 5.5)
      .set(effectParams, { warpSpeed: 1 }, 5.5)
      .to(phoneGroup.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 1, ease: "back.out(1.5)" }, 5.5)
      .to(glowMesh.material, { opacity: 0.6, duration: 1 }, 5.5)
      .fromTo(".panel-3", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8 }, 5.7);

    // عبور به پنل 4
    tlMobile.to(".panel-3", { opacity: 0, y: 50, duration: 0.8 }, 7.5)
      .to(phoneGroup.position, { x: 0, y: 0, z: 5.5, duration: 1, ease: "power2.in" }, 7.5)
      .to(effectParams, { warpSpeed: 15, duration: 1, ease: "power1.in" }, 7.5)
      .to(glowMesh.material, { opacity: 1, duration: 1 }, 7.5)
      .set(phoneGroup.position, { x: 0, y: 0.8, z: 0 }, 8.5)
      .set(phoneGroup.scale, { x: 0.01, y: 0.01, z: 0.01 }, 8.5)
      .set(effectParams, { warpSpeed: 1 }, 8.5)
      .to(phoneGroup.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 1, ease: "back.out(1.5)" }, 8.5)
      .to(glowMesh.material, { opacity: 0.6, duration: 1 }, 8.5)
      .fromTo(".panel-4", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8 }, 8.7);
});

// --- رندر لوپ ---
function animate() {
    requestAnimationFrame(animate);
    
    const positions = particles.geometry.attributes.position.array;
    for(let i = 0; i < particleCount; i++) {
        positions[i * 3 + 2] += 0.02 * effectParams.warpSpeed; 
        if(positions[i * 3 + 2] > 5) { positions[i * 3 + 2] = -15; }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    
    bokehGroup.rotation.y += 0.002;
    bokehGroup.rotation.x += 0.001;
    
    renderer.render(scene, camera);
}
animate();

// --- محاسبه دقیق محل لبه‌های گوشی برای کارت‌های شناور ---
// --- محاسبه دقیق محل لبه‌های گوشی برای کارت‌های شناور ---
function updateWidgetPositions() {
    const isDesktop = window.innerWidth > 850;
    
    // ابعاد و مختصات سه‌بعدی گوشی
    const posX = isDesktop ? -2.8 : 0;
    const posY = isDesktop ? 0 : 0.8;
    const scale = isDesktop ? 1.0 : 1.15;
    const halfWidth = (screenWidth * scale) / 2;

    const leftEdge3D = new THREE.Vector3(posX - halfWidth, posY, 0);
    const rightEdge3D = new THREE.Vector3(posX + halfWidth, posY, 0);

    leftEdge3D.project(camera);
    rightEdge3D.project(camera);

    const leftScreenPixel = ((leftEdge3D.x + 1) / 2) * window.innerWidth;
    const rightScreenPixel = ((rightEdge3D.x + 1) / 2) * window.innerWidth;

    // 🟢 فاصله هوشمند: ۲۵ پیکسل در دسکتاپ، و ۱۰- پیکسل در موبایل (هم‌پوشانی شیک با گوشی)
    const gap = isDesktop ? 25 : -10;

    document.documentElement.style.setProperty('--widget-right-pos', `${rightScreenPixel + gap}px`);
    document.documentElement.style.setProperty('--widget-left-pos', `${(window.innerWidth - leftScreenPixel) + gap}px`);
}

// اجرای یکباره در ابتدای لود سایت
updateWidgetPositions();

// --- آپدیت زنده هنگام تغییر سایز صفحه ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // آپدیت آنی جایگاه کارت‌ها هنگام تغییر سایز صفحه
    updateWidgetPositions();
    ScrollTrigger.refresh();
});