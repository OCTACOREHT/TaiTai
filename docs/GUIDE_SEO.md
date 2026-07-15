# Guide SEO - Optimisation pour les moteurs de recherche

## Objectif

Améliorer le référencement du site TaïTaï sur les mots-clés :
- "taitaï"
- "fast food"
- "créole haïtien"
- "Port-au-Prince"
- "livraison Port-au-Prince"

## Modifications effectuées

### 1. Meta Tags (layout.tsx)

✅ **Title** : Optimisé avec le mot-clé principal
- Default: "TaïTaï - Fast Food Créole | Livraison à Port-au-Prince"
- Template: "%s | TaïTaï Fast Food"

✅ **Description** : 150-160 caractères avec mots-clés
- "TaïTaï - Le meilleur fast food créole de Port-au-Prince. Commandez en ligne : poulet grillé, burgers créoles, pâtes, desserts. Livraison rapide dans tout l'Ouest. Goûtez l'authenticité de la cuisine haïtienne !"

✅ **Keywords** : Liste de mots-clés pertinents
- taitaï, taitai, fast food, créole, haïtien, Port-au-Prince, livraison, poulet grillé, burger créole, riz, commande en ligne, restaurant haïtien

✅ **Open Graph** : Pour le partage sur les réseaux sociaux
- Titre, description, image optimisés
- Locale: fr_HT (créole haïtien)

✅ **Twitter Card** : Pour le partage sur Twitter
- Format: summary_large_image
- Image: /images/og-image.jpg

✅ **Robots** : Instructions pour les crawlers
- Index: true
- Follow: true
- GoogleBot optimisé

### 2. Sitemap (sitemap.ts)

✅ **Fichier créé** : src/app/sitemap.ts

Pages incluses :
- `/` - Page d'accueil (priority: 1)
- `/menu` - Menu (priority: 0.9)
- `/panier` - Panier (priority: 0.8)
- `/suivi` - Suivi commande (priority: 0.7)
- `/historique` - Historique (priority: 0.6)
- `/contact` - Contact (priority: 0.5)

Fréquence de mise à jour :
- Accueil et Menu: daily
- Panier et Suivi: weekly
- Contact: monthly

### 3. Robots.txt (public/robots.txt)

✅ **Fichier créé** : public/robots.txt

Règles :
- Autorise l'indexation des pages publiques
- Bloque les pages admin, login, API
- Crawl-delay: 1 (respectueux)
- Règles spécifiques pour Googlebot et Bingbot

### 4. Structured Data (JSON-LD)

✅ **Composant créé** : src/components/seo/StructuredData.tsx

Trois types de structured data :

1. **Restaurant** : Informations sur le restaurant
   - Nom, description, cuisine
   - Adresse, téléphone
   - Horaires d'ouverture

2. **Product** : Pour chaque plat
   - Nom, description, image
   - Prix, disponibilité

3. **Breadcrumb** : Fil d'Ariane
   - Améliore la navigation
   - Aide les moteurs de recherche

✅ **Intégré dans** : Page d'accueil (src/app/(client)/page.tsx)

## Actions à faire pour améliorer le SEO

### 1. Créer l'image Open Graph

**Fichier requis** : `public/images/og-image.jpg`

**Spécifications** :
- Dimensions: 1200x630 pixels
- Format: JPG
- Poids: < 300 KB
- Contenu: Logo TaïTaï + slogan "Fast Food Créole"

**Outil recommandé** : https://www.opengraph.xyz/

### 2. Optimiser le contenu des pages

**Page d'accueil** :
- ✅ Titre H1: "Nanm kizin Kreyòl la"
- ✅ Contenu optimisé avec mots-clés
- ✅ Images avec alt text

**Page Menu** (à vérifier) :
- Titre H1: "Meni nou"
- Description des plats
- Images avec alt text

**Page Contact** :
- Ajouter l'adresse complète
- Numéro de téléphone
- Email
- Horaires

### 3. Ajouter des backlinks

**Stratégies** :
- Répertoires de restaurants haïtiens
- Google My Business (CRITIQUE)
- Facebook Business Page
- Instagram (@taitai.ht)
- TripAdvisor
- Pages jaunes Haiti

### 4. Optimiser la vitesse

**Actions** :
- Compresser les images (WebP)
- Lazy loading des images
- Minifier CSS/JS
- CDN pour les assets statiques

### 5. Contenu local

**Ajouter** :
- Blog avec recettes créoles
- Témoignages clients
- Histoire du restaurant
- Vidéos de préparation

### 6. Google My Business (CRITIQUE)

1. **Créez votre fiche** : https://www.google.com/business/
2. **Informations à remplir** :
   - Nom: TaïTaï Fast Food
   - Catégorie: Restaurant
   - Adresse: Port-au-Prince, Haiti
   - Téléphone: +509 1234-5678
   - Horaires: 11:00 - 23:00
   - Photos: Menu, restaurant, plats

3. **Optimisez** :
   - Description avec mots-clés
   - Services: Livraison, sur place, à emporter
   - Prix: $$
   - Attributs: Cuisine créole, haïtienne

### 7. Suivi et Analytics

**Google Search Console** :
1. Ajoutez le site: https://search.google.com/search-console
2. Vérifiez la propriété (balise meta ou DNS)
3. Soumettez le sitemap: https://taitaï.ht/sitemap.xml
4. Surveillez les performances

**Google Analytics** :
1. Créez un compte GA4
2. Ajoutez le code de suivi dans layout.tsx
3. Configurez les objectifs (commande, ajout panier)

## Mots-clés cibles

### Principaux
- taitaï (brand)
- fast food Port-au-Prince
- restaurant créole Haiti
- livraison Port-au-Prince

### Secondaires
- poulet grillé Haiti
- burger créole
- riz créole
- commande en ligne Haiti
- restaurant Port-au-Prince

### Longue traine
- "meilleur fast food créole Port-au-Prince"
- "livraison rapide Ouest Haiti"
- "commander poulet grillé en ligne"
- "restaurant haïtien Port-au-Prince"

## Checklist SEO

### Technique
- [x] Meta tags optimisés
- [x] Sitemap.xml créé
- [x] Robots.txt créé
- [x] Structured Data (JSON-LD)
- [x] HTTPS (à configurer en production)
- [ ] PageSpeed > 80
- [ ] Mobile-friendly test
- [ ] Core Web Vitals optimisés

### Contenu
- [x] Titres H1 uniques par page
- [x] Contenu de qualité
- [x] Images avec alt text
- [ ] Blog/articles
- [ ] Pages de destination par zone

### Autorité
- [ ] Google My Business
- [ ] Backlinks de qualité
- [ ] Présence sur les réseaux sociaux
- [ ] Avis clients (Google, TripAdvisor)

## Monitoring

### Outils à utiliser
1. **Google Search Console** (gratuit)
   - Performance des mots-clés
   - Erreurs d'indexation
   - Backlinks

2. **Google Analytics 4** (gratuit)
   - Trafic organique
   - Comportement utilisateur
   - Conversions

3. **PageSpeed Insights** (gratuit)
   - Performance mobile/desktop
   - Core Web Vitals

4. **Screaming Frog** (gratuit jusqu'à 500 URLs)
   - Audit SEO technique
   - Détection d'erreurs

## Prochaines étapes

1. **Immédiat** :
   - Créer l'image og-image.jpg (1200x630)
   - Créer Google My Business
   - Configurer Google Search Console

2. **Court terme** (1 semaine) :
   - Ajouter Google Analytics
   - Optimiser les images (WebP)
   - Tester la vitesse (PageSpeed)

3. **Moyen terme** (1 mois) :
   - Créer du contenu (blog)
   - Obtenir des backlinks
   - Encourager les avis clients

4. **Long terme** (3 mois) :
   - Monitorer les positions
   - Ajuster la stratégie
   - Créer du contenu régulier

## Ressources utiles

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Google My Business](https://www.google.com/business/)
- [Open Graph Debugger](https://developers.facebook.com/tools/debug/)