// Redibuja palabras que en el SWF son dibujos (no texto), p. ej. "HOME" junto al ícono del menú.
// En cada dibujo, la palabra es la figura que está más a la derecha: se quita y se dibuja la nueva palabra
// con la fuente dada, a la misma altura, posición y color.
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
      String[] pair = args[i].split("=", 2);
      String svg = Files.readString(Path.of(args[2], pair[0] + ".svg"));

      // La palabra: la figura que empieza más a la derecha
      Matcher m = PATH.matcher(svg);
      String wordPath = null;
      String color = null;
      Rectangle2D wordBounds = null;
      while (m.find()) {
        Rectangle2D bounds = bounds(m.group(1));
        if (wordBounds == null || bounds.getMinX() > wordBounds.getMinX()) {
          wordPath = m.group(0);
          color = m.group(2);
          wordBounds = bounds;
        }
      }

      String newOutline = outline(font, pair[1], wordBounds);
      String newPath = "<path d=\"" + newOutline + "\" fill=\"" + color + "\" stroke=\"none\"/>";
      System.out.printf(Locale.ROOT, "%s: la palabra terminaba en x=%.1f y ahora en x=%.1f (px)%n", pair[0],
          wordBounds.getMaxX(), bounds(newOutline).getMaxX());
      importAt(swf, pair[0], svg.replace(wordPath, newPath), 1);
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
