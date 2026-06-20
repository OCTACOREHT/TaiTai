import Link from "next/link";

export const metadata = {
  title: "Enfòmasyon Legal — TaïTaï",
  description: "Enfòmasyon legal sou TaïTaï ak pwodwi Octacore.",
};

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 py-12 px-4">
      <div className="space-y-3 border-b border-gray-200 pb-8">
        <p className="text-xs font-black uppercase tracking-widest text-[#F4A640]">Dokiman ofisyèl</p>
        <h1 className="text-4xl font-black text-[#101828]">Enfòmasyon Legal</h1>
        <p className="text-sm text-[#667085]">Dènye mizajou : Jen 2026</p>
      </div>

      <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">1. Idantite antrepriz la</h2>
        <div className="space-y-2 text-sm leading-relaxed text-[#475467]">
          <p><span className="font-bold text-[#101828]">Non mak la :</span> TaïTaï</p>
          <p><span className="font-bold text-[#101828]">Propriyetè :</span> Thaïna Stacy .C Pierre</p>
          <p><span className="font-bold text-[#101828]">Peyi anrejistreman :</span> Repiblik d Ayiti</p>
          <p><span className="font-bold text-[#101828]">Adrès :</span> Pòtoprens, Ayiti</p>
          <p><span className="font-bold text-[#101828]">Telefòn :</span> +509 31 19 1999</p>
          <p><span className="font-bold text-[#101828]">Imèl :</span> info@taitai.com</p>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">2. Pwodwi Octacore</h2>
        <p className="text-sm leading-relaxed text-[#475467]">
          Sit entènèt sa a se yon pwodwi{" "}
          <a
            href="https://www.octacore.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#F4A640] hover:underline"
          >
            Octacore
          </a>.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">3. Peman</h2>
        <p className="text-sm leading-relaxed text-[#475467]">
          <span className="font-bold text-amber-700">TaïTaï pa aksepte okenn peman an liy.</span>{" "}
          Pa gen katredi, virement oswa tranzaksyon finansyè ki fèt sou platfòm sa a.
          Tout peman fèt an lajan kach oswa pa lòt mwayen aksepte{" "}
          <strong>dirèkteman</strong> lè yo livre kòmand lan.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">4. Politik Ranbousman</h2>
        <p className="text-sm leading-relaxed text-[#475467]">
          <span className="font-bold text-red-700">TaïTaï pa ranbouse okenn kòmand.</span>{" "}
          Yon fwa yon kòmand konfime epi an preparasyon, li pa ka anile ni ranbouse.
          Si ou gen yon pwoblèm ak kòmand ou, tanpri kontakte nou dirèkteman
          nan <span className="font-bold text-[#101828]">+509 31 19 1999</span>.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">5. Responsablite</h2>
        <p className="text-sm leading-relaxed text-[#475467]">
          TaïTaï pa responsab pou nenpòt pèt oswa domaj ki soti nan itilizasyon sit entènèt la,
          entèripsyon sèvis, oswa enfòmasyon ki pa kòrèk ki te bay san entansyon.
          Nou rezève dwa pou chanje enfòmasyon sou sit la nenpòt ki lè san avètisman.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">6. Lwa aplikab</h2>
        <p className="text-sm leading-relaxed text-[#475467]">
          Dokiman legal sa a gouvène pa lwa Repiblik d Ayiti. Tout litij ki ka genyen
          ant kliyan ak TaïTaï pral rezoud anba jiridiksyon tribinal konpetan nan Pòtoprens, Ayiti.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-6 text-sm">
        <Link href="/" className="font-semibold text-[#F4A640] hover:underline">← Retounen akèy</Link>
        <Link href="/konfidansyalite" className="text-[#667085] hover:text-[#F4A640]">Konfidansyalite</Link>
      </div>
    </div>
  );
}
