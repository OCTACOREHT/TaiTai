const players = [
  { no: "1", nom: "Pierre", prenom: "Wendy", poste: "GK", poids: "58KG", hauteur: "1M5", photoUrl: "", videoUrl: "" },
  { no: "2", nom: "Traine", prenom: "Johnlove", poste: "Ailier", poids: "63kg", hauteur: "1M45", photoUrl: "", videoUrl: "" },
  { no: "3", nom: "LAURE", prenom: "Angelo", poste: "Aillier Attaquant", poids: "1M40", hauteur: "1M45", photoUrl: "", videoUrl: "" },
  { no: "4", nom: "Meranvil", prenom: "Bill", poste: "Milieu Defensif", poids: "59KG", hauteur: "1M30", photoUrl: "", videoUrl: "" },
  { no: "5", nom: "Paul", prenom: "Jefferson", poste: "Lateral Gauche", poids: "62KG", hauteur: "1M50", photoUrl: "", videoUrl: "" },
  { no: "6", nom: "Andre", prenom: "Ralpholdy", poste: "Lateral Droit", poids: "62KG", hauteur: "1M69", photoUrl: "", videoUrl: "" },
  { no: "7", nom: "Joseph", prenom: "Jean Wood", poste: "Defenseur Central", poids: "65KG", hauteur: "1M50", photoUrl: "", videoUrl: "" },
  { no: "8", nom: "Orelus", prenom: "Andy", poste: "Milieu", poids: "66KG", hauteur: "1M48", photoUrl: "", videoUrl: "" }
];

fetch('http://localhost:3000/api/club/elite', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: players })
})
  .then(r => r.json())
  .then(data => {
    console.log("Response:", data);
  })
  .catch(err => {
    console.error("Error:", err);
  });
