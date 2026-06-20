import Link from "next/link";

export const metadata = {
  title: "Konfidansyalite — TaïTaï",
  description: "Politik konfidansyalite ak pwoteksyon done pèsonèl sou platfòm TaïTaï.",
};

export default function KonfidansyalitePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 py-12 px-4">
      <div className="space-y-3 border-b border-gray-200 pb-8">
        <p className="text-xs font-black uppercase tracking-widest text-[#F4A640]">Done pèsonèl</p>
        <h1 className="text-4xl font-black text-[#101828]">Politik Konfidansyalite</h1>
        <p className="text-sm text-[#667085]">Dènye mizajou : Jen 2026</p>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-[#475467]">
          <span className="font-bold text-[#101828]">TaïTaï</span> kolekte epi jere done pèsonèl
          kliyan ki itilize platfòm nan. Paj sa a eksplike ki done nou kolekte, kijan nou itilize yo,
          ak ki dwa ou genyen.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">1. Done nou kolekte</h2>
        <p className="text-sm text-[#475467] mb-3">
          Lè ou kreye yon kont oswa pase yon kòmand, TaïTaï ka kolekte done sa yo :
        </p>
        <ul className="space-y-2 text-sm text-[#475467]">
          {[
            "Non ak siyati ou",
            "Adrès imèl ou",
            "Nimewo telefòn ou",
            "Adrès livrezon ou",
            "Istwa kòmand ou yo",
            "Done koneksyon (dat, lè, aparèy)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#F4A640]" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">2. Kijan nou itilize done yo</h2>
        <p className="text-sm text-[#475467] mb-3">Done ou yo itilize sèlman pou :</p>
        <ul className="space-y-2 text-sm text-[#475467]">
          {[
            "Trete epi konfime kòmand ou yo",
            "Kontakte ou si gen pwoblèm ak kòmand lan",
            "Swiv istwa kòmand ou yo",
            "Amelyore sèvis TaïTaï",
            "Reponn a demann sipò kliyan",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#F4A640]" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">3. Pataj done</h2>
        <p className="text-sm leading-relaxed text-[#475467]">
          TaïTaï <span className="font-bold text-[#101828]">pa vann</span> epi{" "}
          <span className="font-bold text-[#101828]">pa pataje</span> done pèsonèl ou
          ak twazyèm pati, eksepte si lalwa egzije li oswa si ou bay konsantman espesifik ou.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">4. Konsèvasyon done</h2>
        <p className="text-sm leading-relaxed text-[#475467]">
          Done ou yo konsève pandan peryòd ki nesesè pou reyalize sèvis yo epi pou respekte
          obligasyon legal. Ou ka mande efasman done ou yo nenpòt ki lè (gade seksyon 6).
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">5. Sekirite done</h2>
        <p className="text-sm leading-relaxed text-[#475467]">
          TaïTaï itilize mezi sekirite teknik ak òganizasyonèl apwopriye pou pwoteje done
          pèsonèl ou kont pèt, aksè san otorizasyon oswa modifikasyon.
          Tout done transmèt atravè koneksyon HTTPS chifre.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">6. Dwa ou yo</h2>
        <p className="text-sm text-[#475467] mb-3">Ou gen dwa :</p>
        <ul className="space-y-2 text-sm text-[#475467]">
          {[
            "Aksede ak done pèsonèl ou yo",
            "Korije enfòmasyon ki pa kòrèk",
            "Mande efasman kont ou",
            "Opoze tretman done yo pou rezon mache",
            "Resevwa done ou yo nan yon fòma pòtab",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#F4A640]" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[#475467]">
          Pou egzèse dwa sa yo, kontakte nou nan{" "}
          <a href="mailto:info@taitai.com" className="font-bold text-[#F4A640] hover:underline">
            info@taitai.com
          </a>{" "}
          oswa nan <span className="font-bold text-[#101828]">+509 31 19 1999</span>.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#101828]">7. Cookies</h2>
        <p className="text-sm leading-relaxed text-[#475467]">
          Platfòm nan ka itilize cookies teknik pou kenbe sesyon koneksyon ak preferans ou yo.
          Nou pa itilize cookies reklamasyon oswa tracking twazyèm pati.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-6 text-sm">
        <Link href="/" className="font-semibold text-[#F4A640] hover:underline">← Retounen akèy</Link>
        <Link href="/legal" className="text-[#667085] hover:text-[#F4A640]">Enfòmasyon legal</Link>
      </div>
    </div>
  );
}
