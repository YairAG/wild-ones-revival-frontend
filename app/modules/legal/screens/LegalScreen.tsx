// Página de un documento legal (reglas, términos o privacidad), con enlaces a los otros dos. Es pública: se
// puede abrir sin sesión, p. ej. desde la casilla del registro.
import { Link } from "react-router";
import { Scene } from "@/components/Scene";
import { LEGAL_DOCS } from "../content";
import type { LegalDoc } from "../types";

export function LegalScreen({ doc }: { doc: LegalDoc }) {
  return (
    <Scene>
      <main className="relative flex flex-1 flex-col items-center gap-6 px-4 pt-10 pb-36">
        <Link to="/login" className="logo text-5xl no-underline">
          Wild Revival
        </Link>

        <nav aria-label="Documentos" className="flex flex-wrap justify-center gap-x-5 gap-y-1">
          {LEGAL_DOCS.map((other) => (
            <Link
              key={other.path}
              to={other.path}
              aria-current={other.path === doc.path ? "page" : undefined}
              className="text-etiqueta font-extrabold text-enlace hover:text-enlace-hover aria-[current=page]:text-texto aria-[current=page]:no-underline"
            >
              {other.title}
            </Link>
          ))}
        </nav>

        <article className="flex w-full max-w-[720px] flex-col gap-5 rounded-modal border-2 border-cielo-profundo bg-panel p-6 shadow-nivel-2 sm:p-8">
          <header className="flex flex-col gap-1">
            <h1 className="text-titulo font-display">{doc.title}</h1>
            <p className="text-ayuda text-texto-secundario">Última actualización: {doc.updated}</p>
          </header>
          <p className="text-cuerpo leading-relaxed text-texto-cuerpo">{doc.intro}</p>

          {doc.sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-2">
              <h2 className="text-(length:--text-panel) font-display">{section.title}</h2>
              {section.items && (
                <ul className="flex list-disc flex-col gap-1.5 pl-5 text-cuerpo leading-relaxed text-texto-cuerpo">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-cuerpo leading-relaxed text-texto-cuerpo">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      </main>
    </Scene>
  );
}
