import { CmsDataSnapshot } from "@/types/cms";

const articleOneBody = `
  <p>Pwogram editoryal TaiTai CMS rasanble piblikasyon restoran an, kominote a ak òf rekritman yo nan yon sèl espas. Objektif la se pibliye pi vit, ak yon rendu pwòp epi yon swivi klè.</p>
  <h2>Ce que couvre le nouveau dispositif</h2>
  <p>Chak atik ka pase an bouyon, ale pou revizyon oswa pibliye. Otè yo gen yon espas senp pou òganize tèks yo, ajoute lyen, mete pasaj an valè epi prepare yon kouvèti.</p>
  <ul>
    <li>Calendrier editorial commun</li>
    <li>Validation plus rapide avant publication</li>
    <li>Swivi vizit ak klik sou lyen yo</li>
  </ul>
  <p>Le site public affiche ensuite le contenu sur une interface coherent avec la marque TaiTai.</p>
`;

const articleTwoBody = `
  <p>Le club lance une campagne de recrutement pour renforcer son equipe communication, sa cellule partenariats et son accompagnement terrain. Les stages sont visibles directement sur la partie publique du site.</p>
  <blockquote>Un seul back-office pour publier, corriger et suivre les performances.</blockquote>
  <p>Chak fich estaj ka gen deskripsyon, dire, mòd travay ak kontak dirèk. Swivi a pèmèt idantifye òf ki bay plis enterè yo.</p>
`;

const articleThreeBody = `
  <p>Le CMS met la page d'accueil au centre de la strategie digitale. Le texte d'accroche, les photos, les blocs mis en avant et la section partenaires sont tous administrables.</p>
  <h3>Priorites du trimestre</h3>
  <ol>
    <li>Publier des actualites plus regulierement</li>
    <li>Mettre en avant les partenaires du club</li>
    <li>Rendre les appels a candidature visibles sur mobile</li>
  </ol>
  <p>Sistèm nan pèmèt tou kenbe tras aksyon enpòtan nan tablo swivi yo.</p>
`;

const stageOneBody = `
  <p>Vous accompagnerez la production des contenus du site et des reseaux du club. Le poste couvre la redaction, la mise en page des articles et la coordination des visuels.</p>
  <ul>
    <li>Preparation des publications hebdomadaires</li>
    <li>Coordination avec les auteurs et les partenaires</li>
    <li>Optimisation des messages pour mobile</li>
  </ul>
  <p>Une bonne maitrise de la redaction web et un vrai sens de l'organisation sont attendus.</p>
`;

const stageTwoBody = `
  <p>Ce stage s'adresse a un profil capable de structurer les demandes partenaires, suivre les activations et organiser la visibilite des sponsors sur le site.</p>
  <p>Le ou la stagiaire interviendra sur les campagnes, les integrations visuelles et les relances commerciales.</p>
`;

export const seedCmsData: CmsDataSnapshot = {
  users: [
    {
      id: "user-admin",
      name: "Kensly Eugene",
      email: "admin@fctoro.cms",
      password: "Admin123!",
      role: "admin",
      title: "Administrateur CMS",
      avatar: "/images/user/owner.jpg",
      bio: "Pilote le site, valide les publications et gere la structure editoriale.",
      active: true,
      lastLoginAt: "2026-03-20T18:30:00.000Z",
    },
    {
      id: "user-editor",
      name: "Mikael Pierre",
      email: "editor@fctoro.cms",
      password: "Editor123!",
      role: "editor",
      title: "Responsable editorial",
      avatar: "/images/user/user-04.jpg",
      bio: "Coordonne les sujets, les revisions et les mises en avant sur la page principale.",
      active: true,
      lastLoginAt: "2026-03-19T13:00:00.000Z",
    },
    {
      id: "user-author",
      name: "Naomi Laurent",
      email: "author@fctoro.cms",
      password: "Author123!",
      role: "author",
      title: "Redactrice club",
      avatar: "/images/user/user-07.jpg",
      bio: "Redige les actualites du club et les annonces de stage.",
      active: true,
      lastLoginAt: "2026-03-18T09:15:00.000Z",
    },
  ],
  articles: [
    {
      id: "article-cms-launch",
      slug: "nouveau-cms-editorial-taitai",
      title: "TaiTai centralise ses contenus avec un nouveau CMS editorial",
      excerpt:
        "Articles, stages, partenaires et page d'accueil sont maintenant pilotes depuis un seul tableau de bord.",
      body: articleOneBody,
      coverImage: "/images/grid-image/image-06.png",
      category: "Actualites",
      tags: ["cms", "site web", "organisation"],
      authorId: "user-admin",
      featured: true,
      status: "published",
      seoTitle: "Nouveau CMS editorial TaiTai",
      seoDescription:
        "Dekouvri nouvo òganizasyon editoryal sit TaiTai a ak tablo swivi li.",
      createdAt: "2026-03-08T08:00:00.000Z",
      updatedAt: "2026-03-15T14:10:00.000Z",
      publishedAt: "2026-03-15T14:10:00.000Z",
      metrics: {
        views: 842,
        linkClicks: 94,
        shares: 26,
        leads: 18,
      },
    },
    {
      id: "article-stages-open",
      slug: "campagne-stages-ouverts-communication-partenariats",
      title: "Ouverture des stages communication et partenariats",
      excerpt:
        "Le club ouvre deux missions prioritaires pour renforcer la production de contenus et la relation partenaires.",
      body: articleTwoBody,
      coverImage: "/images/grid-image/image-04.png",
      category: "Stages",
      tags: ["stage", "communication", "partenariat"],
      authorId: "user-editor",
      featured: true,
      status: "published",
      seoTitle: "Stages FC Toro 2026",
      seoDescription:
        "Consultez les nouveaux stages ouverts par FC Toro dans les domaines communication et partenariats.",
      createdAt: "2026-03-10T09:00:00.000Z",
      updatedAt: "2026-03-17T10:20:00.000Z",
      publishedAt: "2026-03-17T10:20:00.000Z",
      metrics: {
        views: 611,
        linkClicks: 82,
        shares: 14,
        leads: 23,
      },
    },
    {
      id: "article-homepage-focus",
      slug: "priorites-page-principale-printemps-2026",
      title: "Les priorites de la page principale pour le printemps 2026",
      excerpt:
        "Le CMS permet d'ajuster le message principal, l'arriere-plan et les contenus mis en avant en quelques minutes.",
      body: articleThreeBody,
      coverImage: "/images/grid-image/image-02.png",
      category: "Strategie",
      tags: ["homepage", "branding", "contenu"],
      authorId: "user-author",
      featured: false,
      status: "review",
      seoTitle: "Priorites de la page principale FC Toro",
      seoDescription:
        "Tour d'horizon des choix editoriaux retenus pour la nouvelle page d'accueil de FC Toro.",
      createdAt: "2026-03-18T11:00:00.000Z",
      updatedAt: "2026-03-20T12:45:00.000Z",
      publishedAt: null,
      metrics: {
        views: 129,
        linkClicks: 9,
        shares: 2,
        leads: 0,
      },
    },
  ],
  stages: [
    {
      id: "stage-content",
      slug: "stage-assistant-communication-digitale",
      title: "Stage assistant communication digitale",
      excerpt:
        "Une mission orientee publication d'articles, coordination visuelle et animation des contenus du club.",
      body: stageOneBody,
      coverImage: "/images/cards/card-01.jpg",
      department: "Communication",
      location: "Port-au-Prince",
      workMode: "hybrid",
      duration: "4 mois",
      contactEmail: "recrutement@fctoro.cms",
      closeDate: "2026-04-15",
      featured: true,
      status: "published",
      createdAt: "2026-03-11T08:00:00.000Z",
      updatedAt: "2026-03-18T15:35:00.000Z",
      publishedAt: "2026-03-18T15:35:00.000Z",
      metrics: {
        views: 420,
        applications: 17,
        contactClicks: 31,
      },
    },
    {
      id: "stage-partners",
      slug: "stage-charge-partenariats",
      title: "Stage charge de partenariats",
      excerpt:
        "Une opportunite pour suivre les partenaires, organiser les visibilites et structurer les campagnes du club.",
      body: stageTwoBody,
      coverImage: "/images/cards/card-02.jpg",
      department: "Partenariats",
      location: "Remote",
      workMode: "remote",
      duration: "3 mois",
      contactEmail: "partenaires@fctoro.cms",
      closeDate: "2026-04-22",
      featured: true,
      status: "published",
      createdAt: "2026-03-12T10:20:00.000Z",
      updatedAt: "2026-03-19T09:50:00.000Z",
      publishedAt: "2026-03-19T09:50:00.000Z",
      metrics: {
        views: 311,
        applications: 11,
        contactClicks: 22,
      },
    },
    {
      id: "stage-photo",
      slug: "stage-photo-video-club",
      title: "Stage photo et video club",
      excerpt:
        "Mission en preparation pour renforcer la bibliotheque photo du site et la couverture des evenements.",
      body:
        "<p>Une fiche en brouillon est deja prete pour cette mission. Elle servira a publier rapidement une nouvelle offre des validation du staff.</p>",
      coverImage: "/images/cards/card-03.jpg",
      department: "Production",
      location: "Port-au-Prince",
      workMode: "onsite",
      duration: "2 mois",
      contactEmail: "media@fctoro.cms",
      closeDate: "2026-05-05",
      featured: false,
      status: "draft",
      createdAt: "2026-03-20T08:30:00.000Z",
      updatedAt: "2026-03-20T08:30:00.000Z",
      publishedAt: null,
      metrics: {
        views: 0,
        applications: 0,
        contactClicks: 0,
      },
    },
  ],
  partners: [
    {
      id: "partner-1",
      name: "Toro Media",
      website: "https://example.com/toro-media",
      logo: "/images/brand/brand-01.svg",
      category: "Media",
      tier: "principal",
      description: "Partenaire editorial et diffusion digitale.",
      featured: true,
      createdAt: "2026-01-11T08:00:00.000Z",
      clicks: 124,
    },
    {
      id: "partner-2",
      name: "Kreyol Telecom",
      website: "https://example.com/kreyol-telecom",
      logo: "/images/brand/brand-02.svg",
      category: "Tech",
      tier: "gold",
      description: "Soutient les activations et l'infrastructure web.",
      featured: true,
      createdAt: "2026-01-15T08:00:00.000Z",
      clicks: 89,
    },
    {
      id: "partner-3",
      name: "Port City Logistics",
      website: "https://example.com/port-city-logistics",
      logo: "/images/brand/brand-03.svg",
      category: "Transport",
      tier: "silver",
      description: "Appui logistique sur les operations evenementielles.",
      featured: false,
      createdAt: "2026-02-03T08:00:00.000Z",
      clicks: 41,
    },
    {
      id: "partner-4",
      name: "Studio Horizon",
      website: "https://example.com/studio-horizon",
      logo: "/images/brand/brand-04.svg",
      category: "Creative",
      tier: "media",
      description: "Soutient la production photo et video.",
      featured: true,
      createdAt: "2026-02-12T08:00:00.000Z",
      clicks: 66,
    },
  ],
  homePage: {
    heroBadge: "CMS editorial FC Toro",
    heroTitle: "Pilotez articles, stages et partenaires depuis une seule interface.",
    heroSubtitle:
      "Tablo kontwòl la jere piblikasyon, paj akèy la, kont otè yo ak swivi pèfòmans yo, pandan li kenbe yon prezantasyon klè ak modèn.",
    heroPrimaryCtaLabel: "Voir les stages",
    heroPrimaryCtaUrl: "#stages",
    heroSecondaryCtaLabel: "Lire les actualites",
    heroSecondaryCtaUrl: "#articles",
    heroBackgroundImage: "/images/grid-image/image-05.png",
    aboutTitle: "Un CMS pense pour une equipe editoriale complete",
    aboutBody:
      "Ajoute otè, pibliye atik rich, aktive òf estaj, jere patnè yo epi ajiste paj prensipal la san manyen kòd.",
    articleSectionTitle: "Actualites publiees",
    articleSectionIntro:
      "Retrouvez les informations du club, les annonces et les contenus strategiques mis en avant.",
    stageSectionTitle: "Stages ouverts",
    stageSectionIntro:
      "Fich klè, yon apèl pou aksyon ki vizib ak tablo swivi pou konnen sa ki mache byen.",
    partnerSectionTitle: "Partenaires du club",
    partnerSectionIntro:
      "Mettez en avant vos sponsors, leur logo et leur lien dans une section facile a mettre a jour.",
    metrics: [
      { label: "Articles actifs", value: "18", note: "templates inclus" },
      { label: "Estaj swiv", value: "07", note: "plizyè fòma" },
      { label: "Partenaires visibles", value: "12", note: "sections editables" },
    ],
    featuredArticleIds: ["article-cms-launch", "article-stages-open"],
    featuredStageIds: ["stage-content", "stage-partners"],
    visits: 1384,
    ctaClicks: 203,
  },
  siteSettings: {
    siteName: "FC Toro CMS",
    publicTagline: "Back-office editorial et portail public du club",
    primaryEmail: "contact@fctoro.cms",
    phone: "+509 0000 0000",
    address: "Port-au-Prince, Haiti",
    footerText:
      "FC Toro CMS rasanble piblikasyon, swivi ak prezantasyon sit ofisyèl la.",
    partnerPageTitle: "Partenaires",
    partnerPageIntro:
      "Une page dediee pour valoriser les organisations qui accompagnent la croissance du club.",
    articlePageTitle: "Articles et actualites",
    articlePageIntro:
      "Piblikasyon ofisyèl klib la, mete an paj epi swiv depi CMS la.",
    stagePageTitle: "Stages et opportunites",
    stagePageIntro:
      "Consultez les stages ouverts et prenez contact avec les responsables du programme.",
  },
};
