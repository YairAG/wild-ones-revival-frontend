// Reglas de la comunidad. Describen lo que de verdad hace el chat (filtro, 1 mensaje cada 2 s, moderadores que
// borran y silencian, reportes, bloqueos); si eso cambia, cambiar también esto.
import { CONTACT_EMAIL, UPDATED } from "../config";
import type { LegalDoc } from "../types";

export const rules: LegalDoc = {
  path: "/reglas",
  title: "Reglas de la comunidad",
  updated: UPDATED,
  intro:
    "Wild Revival es un lugar para jugar y pasarla bien con gente de todas partes, también con menores de edad. Estas reglas aplican en el chat global, en los mensajes privados, en las salas y en tu nombre de usuario.",
  sections: [
    {
      title: "Respeta a los demás",
      items: [
        "Nada de insultos, acoso, amenazas ni burlas dirigidas a alguien.",
        "Nada de odio o discriminación por origen, religión, género, orientación, discapacidad o cualquier otra razón.",
        "Nada de contenido sexual, violento o que no sea apropiado para menores.",
        "Si alguien te pide que lo dejes en paz, déjalo en paz.",
      ],
    },
    {
      title: "Cuida tu información y la de los demás",
      items: [
        "No compartas datos personales: nombre completo, dirección, teléfono, escuela, fotos ni redes sociales. Tampoco los de otras personas.",
        "Nunca compartas tu contraseña. Nadie del equipo te la va a pedir.",
        "No pidas ni aceptes encuentros en persona con gente que conociste en el juego.",
      ],
    },
    {
      title: "Chat y nombres",
      items: [
        "El chat tiene un filtro de groserías. Intentar saltártelo cuenta como decir la grosería.",
        "Nada de spam: mensajes repetidos, cadenas, enlaces sin sentido o publicidad.",
        "Tu nombre de usuario sigue las mismas reglas: nada ofensivo y nada que se haga pasar por alguien más, incluido el equipo o los moderadores.",
      ],
    },
    {
      title: "Juego limpio",
      items: [
        "No uses trampas, programas externos ni versiones modificadas del juego.",
        "Si encuentras un error que da ventaja, repórtalo en lugar de aprovecharlo.",
        "No intentes entrar a la cuenta de otra persona ni dañar los servidores.",
        "No vendas ni compres cuentas, mascotas u objetos con dinero real. El juego es gratis y no tiene compras.",
      ],
    },
    {
      title: "Reportes y bloqueos",
      paragraphs: [
        "Si alguien rompe las reglas, repórtalo desde su perfil o desde el mensaje. Los reportes los revisan los moderadores; quien reportaste no sabe que fuiste tú.",
        "Puedes bloquear a cualquier jugador: deja de poder escribirte en privado, mandarte solicitudes de amistad o invitarte. En ajustes eliges quién puede escribirte en privado.",
      ],
    },
    {
      title: "Qué pasa si rompes las reglas",
      paragraphs: [
        "Según la gravedad, un moderador puede borrar tus mensajes, silenciarte en el chat por un tiempo o, en casos graves o repetidos, suspender o cerrar tu cuenta. Las sanciones quedan registradas.",
        `Si crees que una sanción fue un error, escríbenos a ${CONTACT_EMAIL} con tu nombre de usuario.`,
      ],
    },
  ],
};
