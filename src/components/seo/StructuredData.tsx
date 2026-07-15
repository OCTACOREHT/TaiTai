"use client";

interface RestaurantSchema {
  name: string;
  description: string;
  image: string;
  servesCuisine: string[];
  priceRange: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressCountry: string;
  };
  telephone?: string;
  openingHours?: string[];
}

interface ProductSchema {
  name: string;
  description: string;
  image: string;
  price: number;
  priceCurrency: string;
  availability: string;
}

export function RestaurantStructuredData({
  data
}: {
  data: RestaurantSchema;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": data.name,
    "description": data.description,
    "image": data.image,
    "servesCuisine": data.servesCuisine,
    "priceRange": data.priceRange,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.address.streetAddress,
      "addressLocality": data.address.addressLocality,
      "addressCountry": data.address.addressCountry,
    },
    ...(data.telephone && { "telephone": data.telephone }),
    ...(data.openingHours && { "openingHours": data.openingHours }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductStructuredData({
  data
}: {
  data: ProductSchema;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.name,
    "description": data.description,
    "image": data.image,
    "offers": {
      "@type": "Offer",
      "price": data.price,
      "priceCurrency": data.priceCurrency,
      "availability": `https://schema.org/${data.availability}`,
      "url": typeof window !== 'undefined' ? window.location.href : "",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbStructuredData({
  items
}: {
  items: { name: string; item: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}