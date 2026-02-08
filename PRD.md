# PRD - Macojaune.com Refonte Complète

**Version:** 1.0
**Date:** 2026-02-06
**Status:** En cours

---

## 1. Vue d'ensemble

### 1.1 Objectifs du projet
Refonte complète de Macojaune.com pour:
- Améliorer l'identité visuelle avec un style créatif unique
- Optimiser le SEO et la découvrabilité par les LLMs
- Moderniser l'expérience utilisateur
- Consolider les sections existantes (Blog, Shop, Link-in-Bio, Projects)
- Préparer l'avenir (géocaching, mini-sites)

### 1.2 Contexte actuel
- Nuxt 3 + TinaCMS
- Style actuel: colors, mais pas de direction créative forte
- Blog: 50+ articles
- Shop: 6 séries photo, intégration Stripe
- Link page: Simple liste de liens colorés
- Projects: Page basique avec moodboards

### 1.3 Livrables attendus
- 3 prototypes homepage (Neo-Brutalist, Bento, CRT)
- Design system unifié
- Schémas TinaCMS enrichis
- Optimisations SEO/LLM
- Documentation technique

---

## 2. Direction Créative

### 2.1 Style Global
**3 styles à tester en parallèle:**

| Style | Description | Caractéristiques |
|-------|-------------|------------------|
| **Neo-Brutaliste** | Raw, bold, impactant | Bordures épaisses, couleurs contrastées, grilles brisées, typo massive |
| **Bento Grid** | Structure modulaire | Grille régulière, cards uniformes, spacing précis, Apple-inspired |
| **CRT Retro-Futur** | Terminal/VHS années 80 | Scanlines, glow, couleurs néon, effets CRT, vibe cyberpunk |

### 2.2 Palette de couleurs
**Identité conservée:**
- Jaune signature: `#FFC107` (Amber 500)
- Noir profond: `#0A0A0A`
- Blanc cassé: `#F5F5F5`

**Variables par style:**
- Neo-Brutalist: +Noir `#000`, +Blanc, accents Rouge/Bleu
- Bento: Tons neutres, palette monochrome avec jaune accent
- CRT: Neon Vert `#00FF41`, Rose `#FF00FF`, Cyan `#00FFFF`

### 2.3 Typographie
- **Display:** `Righteous` → Migration vers `Clash Display` ou `Space Grotesk`
- **Body:** `Hind` → `Inter` ou `DM Sans`
- **Mono:** `Monaspace` (choix utilisateur) pour tous les éléments mono

---

## 3. Architecture Technique

### 3.1 Stack technologique
```json
{
  "nuxt": "^3.14.0",
  "@nuxt/content": "^2.13.0",
  "@nuxtjs/tailwindcss": "^6.12.0",
  "@nuxt/image": "^1.8.0",
  "@nuxtjs/seo": "^2.0.0",
  "tinacms": "^1.7.0",
  "@vueuse/core": "^11.0.0",
  "gsap": "^3.12.0",
  "lenis": "^1.1.0"
}
```

### 3.2 Structure du projet
```
components/
├── home/
│   ├── NeoBrutalist/
│   │   ├── HeroSection.vue
│   │   ├── ArticleCard.vue
│   │   └── LinkCard.vue
│   ├── Bento/
│   │   ├── BentoGrid.vue
│   │   ├── BentoCard.vue
│   │   └── FeaturedCard.vue
│   └── CRT/
│       ├── TerminalHeader.vue
│       ├── ScanlinesOverlay.vue
│       └── GlitchText.vue
├── ui/
│   ├── Button.vue
│   ├── Card.vue
│   └── Badge.vue
└── ...
```

---

## 4. Refonte par Section

### 4.1 Homepage (3 versions)
**Contenu commun:**
- Hero avec tagline
- Dernier article blog
- Featured photo series (Shop)
- Preview Projects
- Social links/Links
- Newsletter signup

### 4.2 Blog
- Design unifié selon le style choisi
- Schema Article enrichi (FAQ, summaries)
- Table des matières
- Related articles
- Progress bar lecture

### 4.3 Link-in-Bio Page
- Profile card avec status
- Featured media (video thumbnails)
- Bento grid de links
- Latest articles preview

### 4.4 Shop
- Header parallax
- Filtres par série
- Product cards hover reveal
- Checkout optimisé

### 4.5 Projects
- Masonry grid
- Moodboard viewer
- Application form

---

## 5. SEO & LLM Optimization

### 5.1 Technical SEO
- Sitemap automatisé
- Robots.txt
- Canonical URLs
- Open Graph + Twitter Cards

### 5.2 Generative Engine Optimization (GEO)
**Nouveaux champs TinaCMS:**
```typescript
{
  llmSummary: "string (120 mots)",
  keyTakeaways: "list[string]",
  faq: "list[{question, answer}]",
  featured: "boolean"
}
```

### 5.3 Schema.org
- Organization
- Article
- BreadcrumbList
- FAQPage

---

## 6. TinaCMS - Evolution des Schémas

### 6.1 Articles
**Champs ajoutés:**
- `llmSummary`: Résumé optimisé pour IA
- `keyTakeaways`: Points clés
- `faq`: Questions/Réponses structurées
- `featured`: Article mis en avant

### 6.2 Projects
- `moodboard`: Galerie d'inspiration
- `pinterestUrl`: Intégration Pinterest
- `calendar`: Dates de session

### 6.3 Links
- `type`: youtube, instagram, custom, etc.
- `thumbnail`: Image de preview
- `featured`: Mise en avant

---

## 7. Plan d'Execution

### Phase 1: Prototypes Design (En cours)
- [x] PRD initial
- [ ] 3 homepages prototypes
- [ ] Tests utilisateurs (interne)

### Phase 2: Design System
- [ ] Design system final
- [ ] Composants UI unifiés
- [ ] Animations/transitions

### Phase 3: Implementation
- [ ] Migration du style choisi
- [ ] Schémas TinaCMS
- [ ] SEO/LLM optimization

### Phase 4: Testing & Launch
- [ ] Performance
- [ ] Accessibilité
- [ ] Deployment

---

## 8. Design References

### Neo-Brutalisme
- brutalweb.xyz
- Dribbble "Neo-Brutalism"
- NN/g Neobrutalism Guide

### Bento Grid
- Apple.com product pages
- mobbin.com "Bento"
- bentogrid.com

### CRT Retro-Futur
- Fallout.css
- Codepen CRT effects
- Synthwave design

---

## 9. Notes

### 9.1 Contraintes techniques
- Compatible Nuxt 3 existant
- TinaCMS backward compatible
- Pas de breaking changes majeurs

### 9.2 Futurs développements
- Section Géocaching (carte interactive)
- Mini-sites sous-domaines
- Membership/abo system

---

## 10. Historique des versions

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | 2026-02-06 | Version initiale - 3 prototypes homepage |

---

*Document évolutif - Mis à jour au fil du projet*
