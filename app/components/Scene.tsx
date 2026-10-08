import type { ReactNode } from "react";

/** Fondo de las pantallas de título: cielo, nubes y colinas, con el contenido encima */
export function Scene({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-escena">
      <div aria-hidden="true">
        <span className="absolute top-[90px] left-[8%] h-11 w-44 rounded-full bg-nube" />
        <span className="absolute top-[66px] left-[12%] h-15 w-24 rounded-full bg-nube" />
        <span className="absolute top-40 right-[10%] h-12 w-56 rounded-full bg-nube" />
        <span className="absolute top-32 right-[15%] h-18 w-28 rounded-full bg-nube" />
        <svg
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 h-64 w-full"
        >
          <path
            d="M0 150 C 240 70, 420 90, 620 150 S 1060 200, 1440 110 L1440 260 L0 260 Z"
            className="fill-colina"
          />
          <path
            d="M0 210 C 300 150, 560 170, 820 210 S 1240 230, 1440 190 L1440 260 L0 260 Z"
            className="fill-pasto"
          />
        </svg>
      </div>
      {children}
    </div>
  );
}
