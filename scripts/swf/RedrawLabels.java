// Redibuja palabras que en el SWF son dibujos (no texto), p. ej. "HOME" junto al ícono del menú.
// En cada dibujo, la palabra es la figura que está más a la derecha: se quita y se dibuja la nueva palabra
// con la fuente dada, a la misma altura, posición y color (si tiene varias capas, como una sombra, cada una).
// Con "<id>=<PALABRA>>" la nueva queda alineada a la derecha, donde terminaba la vieja, y con "<id>=<PALABRA>~"
// centrada donde estaba la vieja. Con "_" al final (antes de ">" o "~"), la palabra es la figura de más abajo
// en vez de la de más a la derecha (p. ej. "BACK" debajo de una flecha).
//
//   java -cp "<carpeta de JPEXS>/lib/*" scripts/swf/RedrawLabels.java <entrada.swf> <salida.swf> \
//        <carpeta con los SVG exportados> <fuente.ttf> <id>=<PALABRA> ...
//
// Los SVG se exportan antes con JPEXS: -format shape:svg -selectid <ids> -export shape <carpeta> <entrada.swf>
import com.jpexs.decompiler.flash.SWF;
import com.jpexs.decompiler.flash.importers.svg.SvgImporter;
import com.jpexs.decompiler.flash.tags.base.ShapeTag;
import java.awt.Font;
import java.awt.Shape;
import java.awt.font.FontRenderContext;
import java.awt.geom.AffineTransform;
import java.awt.geom.PathIterator;
import java.awt.geom.Rectangle2D;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RedrawLabels {
  static final Pattern PATH = Pattern.compile("<path d=\"([^\"]+)\"[^>]*fill=\"([^\"]+)\"[^>]*/>");
  static final Pattern NUMBER = Pattern.compile("-?\\d+(\\.\\d+)?");

  public static void main(String[] args) throws Exception {
    SWF swf;
    try (FileInputStream in = new FileInputStream(args[0])) {
      swf = new SWF(in, false);
    }
    Font font = Font.createFont(Font.TRUETYPE_FONT, new File(args[3])).deriveFont(1000f);

    for (int i = 4; i < args.length; i++) {
      if (args[i].contains("*")) {
        widen(swf, args[2], args[i].split("\\*"));
        continue;
      }
      if (args[i].contains("@")) {
        lengthenRow(swf, args[2], args[i]);
        continue;
      }
      String[] pair = args[i].split("=", 2);
      String svg = Files.readString(Path.of(args[2], pair[0] + ".svg"));
      // Opciones al final de la palabra: ">" (a la derecha) o "~" (centrada), y antes "_" (la de más abajo)
      boolean alignRight = pair[1].endsWith(">");
      boolean center = pair[1].endsWith("~");
      String word = alignRight || center ? pair[1].substring(0, pair[1].length() - 1) : pair[1];
      boolean lowest = word.endsWith("_");
      if (lowest) word = word.substring(0, word.length() - 1);

      // La palabra: la figura que empieza más a la derecha y las de su mismo color y altura parecida (a veces
      // cada letra es una figura). Una figura del mismo color pero mucho más alta (un fondo) no cuenta
      List<String[]> paths = new ArrayList<>(); // [figura completa, trazo, color]
      Matcher m = PATH.matcher(svg);
      while (m.find()) paths.add(new String[] {m.group(0), m.group(1), m.group(2)});
      Comparator<String[]> order = lowest
          ? Comparator.comparingDouble(p -> bounds(p[1]).getMinY())
          : Comparator.comparingDouble(p -> bounds(p[1]).getMinX());
      String[] last = paths.stream().max(order).orElseThrow();
      double height = bounds(last[1]).getHeight();
      Rectangle2D wordBounds = null;
      for (String[] p : paths) {
        Rectangle2D b = bounds(p[1]);
        if (!p[2].equals(last[2]) || b.getHeight() > height * 1.5) continue;
        // "_": solo lo que está a la altura de la palabra (lo de arriba, p. ej. un icono, no es parte de ella)
        if (lowest && b.getMinY() < bounds(last[1]).getMinY() - 3) continue;
        wordBounds = wordBounds == null ? b : wordBounds.createUnion(b);
      }

      // Capas de la palabra (p. ej. letras naranjas con su sombra negra un poco corrida): las figuras de cualquier
      // color que caen dentro de la palabra. Cada capa se redibuja con su color y su desplazamiento, en su orden
      Rectangle2D area = new Rectangle2D.Double(wordBounds.getX() - 3, wordBounds.getY() - 3,
          wordBounds.getWidth() + 6, wordBounds.getHeight() + 6);
      java.util.Map<String, Rectangle2D> layers = new java.util.LinkedHashMap<>();
      for (String[] p : paths) {
        Rectangle2D b = bounds(p[1]);
        if (!area.contains(b)) continue;
        layers.merge(p[2], b, Rectangle2D::createUnion);
        svg = svg.replace(p[0], "");
      }

      StringBuilder newPaths = new StringBuilder();
      double endX = -Double.MAX_VALUE;
      for (var layer : layers.entrySet()) {
        Rectangle2D b = layer.getValue();
        // Misma escala para todas las capas (la de la palabra): solo cambia dónde empieza cada una
        Rectangle2D target = new Rectangle2D.Double(b.getMinX(), b.getMaxY() - wordBounds.getHeight(),
            wordBounds.getWidth(), wordBounds.getHeight());
        String newOutline = outline(font, word, target);
        if (alignRight || center) {
          Rectangle2D nb = bounds(newOutline);
          double dx = alignRight ? b.getMaxX() - nb.getMaxX() : b.getCenterX() - nb.getCenterX();
          target.setRect(target.getX() + dx, target.getY(), target.getWidth(), target.getHeight());
          newOutline = outline(font, word, target);
        }
        newPaths.append("<path d=\"" + newOutline + "\" fill=\"" + layer.getKey() + "\" stroke=\"none\"/>");
        endX = Math.max(endX, bounds(newOutline).getMaxX());
      }
      System.out.printf(Locale.ROOT, "%s: la palabra terminaba en x=%.1f y ahora en x=%.1f (px), %d capa(s)%n",
          pair[0], wordBounds.getMaxX(), endX, layers.size());
      importAt(swf, pair[0], svg.replace("</g>", newPaths + "</g>"), 1);
      System.out.println(pair[0] + ": " + pair[1]);
    }

    try (FileOutputStream out = new FileOutputStream(args[1])) {
      swf.saveTo(out);
    }
  }

  // "<id>*<factor>": estira el dibujo a lo ancho desde su borde izquierdo (p. ej. el fondo de una palabra que
  // ahora es más larga)
  static void widen(SWF swf, String svgDir, String[] idFactor) throws Exception {
    importAt(swf, idFactor[0], Files.readString(Path.of(svgDir, idFactor[0] + ".svg")), Double.parseDouble(idFactor[1]));
    System.out.println(idFactor[0] + ": " + idFactor[1] + " veces más ancho");
  }

  // "<id>@<y0>:<y1>+<dx>,<y0>:<y1>+<dx>...": cuando un dibujo junta varios fondos (uno por renglón), alarga
  // solo los que están entre y0 e y1 (px): su mitad derecha se corre dx px a la derecha. Las figuras empiezan
  // con "M"
  static void lengthenRow(SWF swf, String svgDir, String arg) throws Exception {
    String id = arg.substring(0, arg.indexOf('@'));
    String svg = Files.readString(Path.of(svgDir, id + ".svg"));
    for (String row : arg.substring(arg.indexOf('@') + 1).split(",")) {
      Matcher a = Pattern.compile("(-?[\\d.]+):(-?[\\d.]+)\\+([\\d.]+)").matcher(row);
      if (!a.matches()) throw new IllegalArgumentException(row);
      svg = lengthen(svg, Double.parseDouble(a.group(1)), Double.parseDouble(a.group(2)), Double.parseDouble(a.group(3)));
      System.out.println(id + ": fondo entre y=" + a.group(1) + " y " + a.group(2) + " alargado " + a.group(3) + " px");
    }
    importAt(swf, id, svg, 1);
  }

  static String lengthen(String svg, double y0, double y1, double dx) {
    Matcher p = Pattern.compile("<path d=\"([^\"]+)\"").matcher(svg);
    StringBuilder result = new StringBuilder();
    while (p.find()) {
      StringBuilder d = new StringBuilder();
      for (String figure : p.group(1).split("(?=M)")) {
        Rectangle2D b = bounds(figure);
        boolean inRow = b.getMinY() >= y0 && b.getMaxY() <= y1;
        Matcher n = NUMBER.matcher(figure);
        StringBuilder moved = new StringBuilder();
        boolean x = true;
        while (n.find()) {
          double v = Double.parseDouble(n.group());
          if (x && inRow && v > b.getCenterX()) v += dx;
          n.appendReplacement(moved, String.format(Locale.ROOT, "%.2f", v));
          x = !x;
        }
        n.appendTail(moved);
        d.append(moved);
      }
      p.appendReplacement(result, Matcher.quoteReplacement("<path d=\"" + d + "\""));
    }
    p.appendTail(result);
    return result.toString();
  }

  // Importa el SVG al dibujo sin moverlo. El SVG exportado lleva las figuras en sus coordenadas reales y una
  // matriz inicial que las corre al origen (matrix(1, 0, 0, 1, -xmin, -ymin)); el importador pone el origen del
  // SVG en el (0, 0) del dibujo, así que esa matriz se quita (y si factor != 1, estira desde xmin)
  static void importAt(SWF swf, String id, String svg, double factor) throws Exception {
    Matcher m = Pattern.compile("matrix\\(1\\.0, 0\\.0, 0\\.0, 1\\.0, (-?[\\d.]+), (-?[\\d.]+)\\)").matcher(svg);
    if (!m.find()) throw new IllegalStateException(id + ": no encontré la matriz inicial del SVG");
    double xmin = -Double.parseDouble(m.group(1));
    svg = svg.replace(m.group(0), String.format(Locale.ROOT, "matrix(%f, 0.0, 0.0, 1.0, %f, 0.0)", factor, xmin * (1 - factor)));
    new SvgImporter().importSvg((ShapeTag) swf.getCharacter(Integer.parseInt(id)), svg, false);
  }

  // Contorno de la palabra, escalado a la altura de la palabra original y puesto en su lugar
  static String outline(Font font, String word, Rectangle2D target) {
    Shape glyphs = font.createGlyphVector(new FontRenderContext(null, true, true), word).getOutline();
    Rectangle2D b = glyphs.getBounds2D();
    double scale = target.getHeight() / b.getHeight();
    AffineTransform t = new AffineTransform();
    t.translate(target.getMinX(), target.getMaxY());
    t.scale(scale, scale);
    t.translate(-b.getMinX(), -b.getMaxY());

    StringBuilder d = new StringBuilder();
    double[] c = new double[6];
    for (PathIterator it = glyphs.getPathIterator(t); !it.isDone(); it.next()) {
      switch (it.currentSegment(c)) {
        case PathIterator.SEG_MOVETO -> d.append(String.format(Locale.ROOT, "M%.2f %.2f ", c[0], c[1]));
        case PathIterator.SEG_LINETO -> d.append(String.format(Locale.ROOT, "L%.2f %.2f ", c[0], c[1]));
        case PathIterator.SEG_QUADTO -> d.append(String.format(Locale.ROOT, "Q%.2f %.2f %.2f %.2f ", c[0], c[1], c[2], c[3]));
        case PathIterator.SEG_CUBICTO -> d.append(String.format(Locale.ROOT, "C%.2f %.2f %.2f %.2f %.2f %.2f ", c[0], c[1], c[2], c[3], c[4], c[5]));
        case PathIterator.SEG_CLOSE -> d.append("Z ");
      }
    }
    return d.toString().trim();
  }

  // Rectángulo que ocupa una figura (aproximado con todos los puntos del trazo)
  static Rectangle2D bounds(String d) {
    Matcher n = NUMBER.matcher(d);
    double minX = Double.MAX_VALUE, minY = Double.MAX_VALUE, maxX = -Double.MAX_VALUE, maxY = -Double.MAX_VALUE;
    for (boolean x = true; n.find(); x = !x) {
      double v = Double.parseDouble(n.group());
      if (x) { minX = Math.min(minX, v); maxX = Math.max(maxX, v); }
      else { minY = Math.min(minY, v); maxY = Math.max(maxY, v); }
    }
    return new Rectangle2D.Double(minX, minY, maxX - minX, maxY - minY);
  }
}
