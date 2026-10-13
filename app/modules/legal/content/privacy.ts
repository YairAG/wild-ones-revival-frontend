// Aviso de privacidad integral (Ley Federal de Protección de Datos Personales en Posesión de los Particulares,
// México, 2025). Describe lo que de verdad guardan wildones-accounts, wildones-server y este frontend: si se
// agrega un dato nuevo (p. ej. correos con Resend), actualizar esto. Borrador sin revisión legal.
import { ADDRESS, CONTACT_EMAIL, MIN_AGE, RESPONSIBLE, UPDATED } from "../config";
import type { LegalDoc } from "../types";

export const privacy: LegalDoc = {
  path: "/privacidad",
  title: "Aviso de privacidad",
  updated: UPDATED,
  intro:
    "Aquí explicamos qué datos tuyos guardamos, para qué y cómo puedes consultarlos, corregirlos o borrarlos. Pedimos lo mínimo para que el juego funcione: no vendemos tus datos, no mostramos publicidad y no usamos herramientas de analítica.",
  sections: [
    {
      title: "Quién es responsable de tus datos",
      paragraphs: [
        `${RESPONSIBLE}, con domicilio en ${ADDRESS}, es responsable del tratamiento de tus datos personales en Wild Revival. Para cualquier asunto de privacidad puedes escribir a ${CONTACT_EMAIL}.`,
      ],
    },
    {
      title: "Qué datos guardamos",
      items: [
        "Al registrarte: tu nombre de usuario, tu correo y tu contraseña. La contraseña se guarda cifrada (con un hash); nadie, ni el equipo, puede verla.",
        "La fecha en que creaste la cuenta y en que aceptaste estos documentos.",
        "Tu progreso en el juego: nivel, experiencia, oro, treats, mascotas, accesorios, armas y partidas ganadas y perdidas.",
        "Tu actividad social: amigos, solicitudes de amistad, jugadores bloqueados, si estás en línea y tus ajustes de privacidad.",
        "Tus mensajes: los del chat global (incluido el texto original si el filtro lo cambió, que solo ven los moderadores) y tus mensajes privados.",
        "Los reportes que hagas o que hagan de ti, y las sanciones que recibas.",
        "Las sesiones abiertas en tus navegadores, para que no tengas que entrar cada vez.",
      ],
      paragraphs: [
        "No pedimos tu nombre real, tu fecha de nacimiento, tu teléfono, tu ubicación ni datos sensibles.",
      ],
    },
    {
      title: "Para qué los usamos",
      paragraphs: [
        "Para darte el servicio: crear y proteger tu cuenta, guardar tu progreso, que puedas jugar con otros, tener amigos y usar el chat. También para moderar la comunidad y atender reportes, y para recuperar tu cuenta por correo cuando esa función exista. Estas finalidades son necesarias para el servicio.",
        "No usamos tus datos para publicidad, perfiles comerciales ni ningún otro fin.",
      ],
    },
    {
      title: "Quién más los ve",
      items: [
        "Los demás jugadores ven tu nombre, tu nivel, tus mascotas, tus estadísticas, si estás en línea y lo que escribes en el chat global. Tus mensajes privados solo los ven tú y quien los recibe (y los moderadores si se reportan).",
        "Los moderadores ven los reportes, el registro de sanciones y el texto original de los mensajes filtrados.",
        "Usamos proveedores para alojar los servidores y la base de datos, y en el futuro para enviar correos. Solo tratan los datos para darnos ese servicio.",
        "Las letras de la página se cargan desde Google Fonts, así que tu navegador se conecta a Google al abrirla.",
        "No vendemos ni compartimos tus datos con nadie más, salvo que una autoridad lo pida conforme a la ley.",
      ],
    },
    {
      title: "Cookies y tu navegador",
      paragraphs: [
        "Usamos una sola cookie, necesaria para mantener tu sesión abierta (dura hasta 30 días y el código de la página no la puede leer). No usamos cookies de terceros ni de rastreo.",
        "Tus preferencias (calidad, volumen, ajustes del chat) y los dibujos de mascotas se guardan solo en tu navegador; puedes borrarlos limpiando los datos del sitio.",
      ],
    },
    {
      title: "Cuánto tiempo los guardamos",
      paragraphs: [
        "Mientras tengas tu cuenta. Si la borras, se borran tu cuenta, tu progreso, tus amistades, tus bloqueos, tus mensajes del chat y tus mensajes privados. Los reportes y el registro de sanciones se conservan para proteger a la comunidad.",
      ],
    },
    {
      title: "Tus derechos",
      paragraphs: [
        "Puedes acceder a tus datos, corregirlos, cancelarlos u oponerte a su uso (derechos ARCO), y retirar tu consentimiento. Desde el juego ya puedes cambiar tu contraseña, elegir quién te escribe en privado, cerrar tus sesiones y borrar tu cuenta.",
        `Para lo demás, escribe a ${CONTACT_EMAIL} desde el correo de tu cuenta, con tu nombre de usuario y lo que necesitas. Te responderemos en un máximo de 20 días hábiles.`,
      ],
    },
    {
      title: "Menores de edad",
      paragraphs: [
        `Para crear una cuenta necesitas tener al menos ${MIN_AGE} años. Si eres menor de 18, tu madre, padre o tutor debe estar de acuerdo con este aviso. Si eres madre, padre o tutor y quieres revisar o borrar la cuenta de tu hijo o hija, escríbenos.`,
      ],
    },
    {
      title: "Cambios a este aviso",
      paragraphs: [
        "Si cambiamos este aviso, lo publicaremos en esta página con una fecha nueva. Si el cambio es importante, también lo avisaremos en el juego.",
      ],
    },
  ],
};
