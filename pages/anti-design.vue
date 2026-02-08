<template>
  <div class="anti-design">
    <!-- SCROLL PROGRESS -->
    <div class="scroll-progress" ref="scrollProgress"></div>

    <!-- HEADER CHAOS -->
    <header class="header-chaos">
      <h1 class="glitch-text" data-text="M A C O J A U N E">M A C O J A U N E</h1>
      <div class="header-ornaments">
        <span class="ornament orb-1">★</span>
        <span class="ornament orb-2">⚡</span>
        <span class="ornament orb-3">☾</span>
      </div>
      <p class="tagline-ugly">PHOTOGRAPHE • DÉVELOPPEUR • ENTREPRENEUR</p>
    </header>

    <!-- INTRO CHAOS -->
    <section class="intro-chaos">
      <div class="ugly-card ugly-card-1">
        <h2>WTF IS THIS?</h2>
        <p>Oublie tout ce que tu sais sur le design. Ici, c'est chaos total.</p>
      </div>
      <div class="ugly-card ugly-card-2">
        <h2>ESTHÉTIQUE? NON.</h2>
        <p>Anti-design. Pas de règles. Juste de l'énergie brute.</p>
      </div>
      <div class="ugly-card ugly-card-3">
        <h2>POURQUOI?</h2>
        <p>Parce que le web trop propre c'est chiant.</p>
      </div>
    </section>

    <!-- OVERLAPPING CARDS -->
    <section class="overlap-section">
      <div class="overlap-card overlap-1">
        <div class="card-content">
          <h3>PHOTO</h3>
          <p>Capturer l'instant</p>
        </div>
      </div>
      <div class="overlap-card overlap-2">
        <div class="card-content">
          <h3>CODE</h3>
          <p>Construire l'avenir</p>
        </div>
      </div>
      <div class="overlap-card overlap-3">
        <div class="card-content">
          <h3>BIZ</h3>
          <p>Créer de la valeur</p>
        </div>
      </div>
    </section>

    <!-- MARQUEE -->
    <section class="marquee-section">
      <div class="marquee-container">
        <div class="marquee-content">
          <span>★ MACOJAUNE ★ PHOTOGRAPHIE ★ DÉVELOPPEMENT ★ ENTREPRENEURIAT ★ CRÉATIVITÉ ★ CHAOS ★</span>
          <span>★ MACOJAUNE ★ PHOTOGRAPHIE ★ DÉVELOPPEMENT ★ ENTREPRENEURIAT ★ CRÉATIVITÉ ★ CHAOS ★</span>
          <span>★ MACOJAUNE ★ PHOTOGRAPHIE ★ DÉVELOPPEMENT ★ ENTREPRENEURIAT ★ CRÉATIVITÉ ★ CHAOS ★</span>
          <span>★ MACOJAUNE ★ PHOTOGRAPHIE ★ DÉVELOPPEMENT ★ ENTREPRENEURIAT ★ CRÉATIVITÉ ★ CHAOS ★</span>
        </div>
      </div>
    </section>

    <!-- GRID BREAKER -->
    <section class="grid-breaker">
      <div class="breaker-item breaker-1">
        <span class="breaker-number">01</span>
        <h3>EXPÉRIENCES</h3>
        <p>Des shoots partout en France et ailleurs.</p>
      </div>
      <div class="breaker-item breaker-2">
        <span class="breaker-number">02</span>
        <h3>PROJETS</h3>
        <p>Du code, des sites, des apps.</p>
      </div>
      <div class="breaker-item breaker-3">
        <span class="breaker-number">03</span>
        <h3>SHOP</h3>
        <p>Tirages, prints, merch limitée.</p>
      </div>
      <div class="breaker-item breaker-4">
        <span class="breaker-number">04</span>
        <h3>LIVRES</h3>
        <p>Mes publications, mes réflexions.</p>
      </div>
    </section>

    <!-- HUGE TEXT -->
    <section class="typo-overload">
      <h2 class="huge-text">DESIGN<br>IS<br>DEAD</h2>
    </section>

    <!-- COLOR SPLASHES -->
    <section class="color-splashes">
      <div class="splash splash-1"></div>
      <div class="splash splash-2"></div>
      <div class="splash splash-3"></div>
    </section>

    <!-- CONTACT -->
    <section class="contact-chaos">
      <h2 class="contact-title">DIS<br>MOI<br>TOUT</h2>
      <a href="mailto:hello@macojaune.com" class="chaos-email">hello@macojaune.com</a>
      <div class="social-chaos">
        <a href="#" class="social-ugly">INSTA</a>
        <a href="#" class="social-ugly">LINKEDIN</a>
        <a href="#" class="social-ugly">GITHUB</a>
        <a href="#" class="social-ugly">X</a>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer-mess">
      <p>© 2024 MACOJAUNE. OU PAS. who cares.</p>
      <p class="footer-chaos">DESIGNED IN CHAOS ☢️</p>
    </footer>

    <!-- FLOATING EMOJI -->
    <div class="floating-emoji e1">👁️</div>
    <div class="floating-emoji e2">✦</div>
    <div class="floating-emoji e3">⬡</div>
    <div class="floating-emoji e4">⚠️</div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

useHead({
  title: 'Macojaune - Anti-Design',
  meta: [
    { name: 'description', content: 'Anti-design portfolio de Macojaune' }
  ]
})

onMounted(() => {
  const scrollProgress = document.querySelector('.scroll-progress')
  window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    scrollProgress.style.width = scrollPercent + '%'
  })
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;700&family=Unbounded:wght@400;700&display=swap');

.anti-design {
  min-height: 100vh;
  background: #000;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* SCROLL PROGRESS */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 8px;
  background: #fbbf24;
  z-index: 9999;
  transition: width 0.1s;
}

/* HEADER CHAOS */
.header-chaos {
  padding: 60px 20px;
  text-align: center;
  position: relative;
  border-bottom: 4px dashed #fbbf24;
}

.glitch-text {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(3rem, 12vw, 8rem);
  color: #fbbf24;
  text-shadow: 6px 6px 0 #fff, -3px -3px 0 #f00;
  animation: glitch 2s infinite;
  margin: 0;
  line-height: 0.9;
}

@keyframes glitch {
  0%, 90%, 100% { transform: translate(0); }
  92% { transform: translate(-5px, 2px); }
  94% { transform: translate(5px, -2px); }
  96% { transform: translate(-3px, -1px); }
  98% { transform: translate(3px, 1px); }
}

.header-ornaments {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.ornament {
  position: absolute;
  font-size: 3rem;
  animation: spin 10s linear infinite;
}

.orb-1 { top: 10%; left: 5%; color: #f00; }
.orb-2 { top: 20%; right: 8%; color: #0f0; animation-direction: reverse; }
.orb-3 { bottom: 15%; left: 15%; color: #00f; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.tagline-ugly {
  font-family: 'Unbounded', sans-serif;
  font-size: 1.2rem;
  letter-spacing: 0.5em;
  margin-top: 30px;
  color: #888;
  transform: rotate(-2deg);
}

/* INTRO CHAOS */
.intro-chaos {
  display: flex;
  flex-wrap: wrap;
  padding: 60px 20px;
  gap: 30px;
  justify-content: center;
}

.ugly-card {
  background: #111;
  border: 4px solid #fbbf24;
  padding: 30px;
  width: 300px;
  transform: rotate(var(--rotation, 0deg));
  transition: transform 0.3s;
}

.ugly-card:hover {
  transform: rotate(0deg) scale(1.05);
}

.ugly-card-1 { --rotation: 3deg; background: #220000; }
.ugly-card-2 { --rotation: -5deg; background: #002200; }
.ugly-card-3 { --rotation: 2deg; background: #000022; }

.ugly-card h2 {
  font-family: 'Archivo Black', sans-serif;
  font-size: 2rem;
  color: #fbbf24;
  margin-bottom: 15px;
}

.ugly-card p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #ccc;
}

/* OVERLAP CARDS */
.overlap-section {
  position: relative;
  height: 600px;
  margin: 60px 0;
  overflow: hidden;
}

.overlap-card {
  position: absolute;
  width: 350px;
  height: 400px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 6px solid #000;
  background: #fbbf24;
  transition: transform 0.3s;
}

.overlap-card:hover {
  z-index: 100 !important;
}

.overlap-1 {
  top: 50px;
  left: 5%;
  background: #ff6b6b;
  z-index: 1;
  transform: rotate(-8deg);
}

.overlap-2 {
  top: 100px;
  left: 35%;
  background: #4ecdc4;
  z-index: 2;
  transform: rotate(5deg);
}

.overlap-3 {
  top: 80px;
  right: 8%;
  background: #ffe66d;
  z-index: 3;
  transform: rotate(-3deg);
}

.overlap-card h3 {
  font-family: 'Archivo Black', sans-serif;
  font-size: 3rem;
  color: #000;
  margin: 0;
}

.overlap-card p {
  font-size: 1.3rem;
  color: #000;
  margin-top: 20px;
}

/* MARQUEE */
.marquee-section {
  background: #fbbf24;
  padding: 20px 0;
  overflow: hidden;
  border-top: 4px solid #fff;
  border-bottom: 4px solid #fff;
}

.marquee-content {
  display: flex;
  animation: marquee 15s linear infinite;
  white-space: nowrap;
}

.marquee-content span {
  font-family: 'Archivo Black', sans-serif;
  font-size: 2rem;
  color: #000;
  padding: 0 50px;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

/* GRID BREAKER */
.grid-breaker {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0;
  border: 4px solid #fff;
  margin: 60px 20px;
}

.breaker-item {
  padding: 50px 30px;
  border: 2px solid #fff;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.breaker-item:hover {
  background: #fbbf24;
  color: #000;
}

.breaker-number {
  font-family: 'Archivo Black', sans-serif;
  font-size: 5rem;
  color: #333;
  position: absolute;
  top: 10px;
  right: 20px;
  opacity: 0.3;
}

.breaker-item:hover .breaker-number {
  color: #000;
  opacity: 0.5;
}

.breaker-item h3 {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.breaker-item p {
  font-size: 1.1rem;
}

/* TYPO OVERLOAD */
.typo-overload {
  padding: 100px 20px;
  text-align: center;
  background: linear-gradient(45deg, #f00, #0f0, #00f, #fbbf24);
  background-size: 400% 400%;
  animation: gradient 5s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.huge-text {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(4rem, 20vw, 15rem);
  color: #fff;
  text-shadow: 8px 8px 0 #000;
  line-height: 0.85;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* COLOR SPLASHES */
.color-splashes {
  position: relative;
  height: 300px;
  margin: 60px 0;
}

.splash {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
}

.splash-1 {
  width: 400px;
  height: 400px;
  background: #f00;
  top: 0;
  left: 10%;
  animation-delay: 0s;
}

.splash-2 {
  width: 500px;
  height: 500px;
  background: #0f0;
  top: 50px;
  right: 5%;
  animation-delay: 2s;
}

.splash-3 {
  width: 350px;
  height: 350px;
  background: #00f;
  bottom: 0;
  left: 40%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(30px, -30px); }
  66% { transform: translate(-20px, 20px); }
}

/* CONTACT */
.contact-chaos {
  padding: 80px 20px;
  text-align: center;
  background: #111;
  border-top: 4px dashed #fbbf24;
}

.contact-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(3rem, 15vw, 10rem);
  color: #fff;
  line-height: 0.8;
  margin-bottom: 40px;
}

.chaos-email {
  display: inline-block;
  font-family: 'Unbounded', sans-serif;
  font-size: 1.5rem;
  color: #fbbf24;
  text-decoration: none;
  padding: 20px 40px;
  border: 4px solid #fbbf24;
  transform: rotate(-3deg);
  transition: all 0.3s;
}

.chaos-email:hover {
  background: #fbbf24;
  color: #000;
  transform: rotate(0deg) scale(1.1);
}

.social-chaos {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.social-ugly {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.2rem;
  color: #fff;
  text-decoration: none;
  padding: 15px 25px;
  background: #333;
  border: 3px solid #fff;
  transform: rotate(var(--rotation, 0deg));
  transition: all 0.3s;
}

.social-ugly:nth-child(1) { --rotation: 5deg; }
.social-ugly:nth-child(2) { --rotation: -3deg; }
.social-ugly:nth-child(3) { --rotation: 4deg; }
.social-ugly:nth-child(4) { --rotation: -2deg; }

.social-ugly:hover {
  background: #fbbf24;
  color: #000;
  border-color: #000;
  transform: rotate(0deg);
}

/* FOOTER */
.footer-mess {
  padding: 40px 20px;
  text-align: center;
  background: #000;
  border-top: 4px solid #fbbf24;
}

.footer-mess p {
  font-size: 0.9rem;
  color: #666;
  margin: 5px 0;
}

.footer-chaos {
  font-family: 'Archivo Black', sans-serif;
  color: #fbbf24 !important;
  font-size: 1.2rem;
  margin-top: 20px !important;
}

/* FLOATING EMOJI */
.floating-emoji {
  position: fixed;
  font-size: 3rem;
  pointer-events: none;
  animation: floatEmoji 10s ease-in-out infinite;
  z-index: 1;
}

.e1 { top: 20%; left: 3%; animation-delay: 0s; }
.e2 { top: 60%; right: 5%; animation-delay: 2s; }
.e3 { bottom: 20%; left: 20%; animation-delay: 4s; }
.e4 { top: 40%; right: 15%; animation-delay: 6s; }

@keyframes floatEmoji {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(20px, -30px) rotate(90deg); }
  50% { transform: translate(-10px, 20px) rotate(180deg); }
  75% { transform: translate(30px, 10px) rotate(270deg); }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .overlap-section {
    height: auto;
    padding: 60px 20px;
  }

  .overlap-card {
    position: relative;
    width: 100%;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    margin-bottom: 30px;
    transform: rotate(0deg) !important;
  }

  .breaker-item {
    padding: 30px 20px;
  }

  .breaker-number {
    font-size: 3rem;
  }
}
</style>
