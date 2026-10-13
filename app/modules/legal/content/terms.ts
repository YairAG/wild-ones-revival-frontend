// Términos de uso. Borrador sin revisión legal: conviene que lo revise un abogado antes de abrir al público.
import { CONTACT_EMAIL, MIN_AGE, RESPONSIBLE, UPDATED } from "../config";
import type { LegalDoc } from "../types";

export const terms: LegalDoc = {
  path: "/terminos",
  title: "Términos de uso",
  updated: UPDATED,
  intro:
    "Al crear una cuenta o jugar en Wild Revival aceptas estos términos, las reglas de la comunidad y el aviso de privacidad. Si no estás de acuerdo, no uses el servicio.",
  sections: [
    {
      title: "Qué es Wild Revival",
      paragraphs: [
        `Wild Revival es un proyecto comunitario sin fines de lucro, operado por ${RESPONSIBLE}, que permite volver a jugar Wild Ones, un juego de 2013 que dejó de existir. Es gratis: no vende nada, no tiene compras dentro del juego, no muestra publicidad y no acepta pagos.`,
        "Wild Revival no está afiliado, patrocinado ni aprobado por The Walt Disney Company, Playdom ni ningún otro dueño del juego original. Wild Ones y sus personajes, dibujos, sonidos y marcas pertenecen a sus respectivos dueños. Si eres titular de algún derecho y quieres que retiremos algo, escríbenos y lo atenderemos.",
        "El código que escribió la comunidad (el servidor, las cuentas y esta página) es software libre con licencia MIT. Los archivos del juego original no forman parte de esa licencia.",
      ],
    },
    {
      title: "Tu cuenta",
      items: [
        `Necesitas tener al menos ${MIN_AGE} años. Si eres menor de 18, necesitas el permiso de tu madre, padre o tutor, que acepta estos términos contigo.`,
        "Eres responsable de lo que pase con tu cuenta. Usa una contraseña que no uses en otros lados y no la compartas.",
        "Tu nombre de usuario debe seguir las reglas de la comunidad. Si no lo hace, podemos suspender la cuenta.",
        "Puedes borrar tu cuenta cuando quieras desde los ajustes; se borra con tu progreso y no se puede recuperar.",
      ],
    },
    {
      title: "Conducta",
      paragraphs: [
        "Debes seguir las reglas de la comunidad. Si no lo haces, podemos borrar tus mensajes, silenciarte, suspender tu cuenta o cerrarla, según la gravedad.",
        "Lo que escribes en el chat es tuyo y eres responsable de ello. Al escribirlo nos permites guardarlo y mostrarlo a los demás jugadores para que el chat funcione, y revisarlo para moderar.",
      ],
    },
    {
      title: "El progreso y los objetos del juego",
      paragraphs: [
        "El oro, los treats, las mascotas, los accesorios, los niveles y todo lo que consigas en el juego no tienen valor en dinero, no son de tu propiedad y no se pueden vender ni cambiar por dinero.",
        "Podemos ajustar, reiniciar o quitar cosas del juego para corregir errores, mantener el juego justo o mejorar el proyecto.",
      ],
    },
    {
      title: "Sin garantías",
      paragraphs: [
        "Wild Revival lo mantienen voluntarios en su tiempo libre. Se ofrece tal como está: puede tener errores, caerse, perder datos o cerrar en cualquier momento, con o sin aviso. Haremos lo posible por avisar con tiempo si el proyecto va a cerrar.",
        "En la medida en que la ley lo permita, ni el equipo ni los voluntarios son responsables de daños o pérdidas por usar o no poder usar el servicio.",
      ],
    },
    {
      title: "Cambios y contacto",
      paragraphs: [
        "Podemos cambiar estos términos. Si el cambio es importante, lo avisaremos en la página o en el juego antes de que aplique; seguir jugando después significa que lo aceptas.",
        `Estos términos se rigen por las leyes de México. Para cualquier duda, escríbenos a ${CONTACT_EMAIL}.`,
      ],
    },
  ],
};
