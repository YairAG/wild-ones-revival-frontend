// Avisa qué textos fijos traducidos quedaron más anchos que el original (probablemente se salen de su espacio).
// Compara el renglón más largo de cada texto en los dos SWF.
//
//   java -cp "<carpeta de JPEXS>/lib/*" scripts/swf/CheckOverflow.java <original.swf> <traducido.swf>
import com.jpexs.decompiler.flash.SWF;
import com.jpexs.decompiler.flash.tags.DefineTextTag;
import com.jpexs.decompiler.flash.tags.base.CharacterTag;
import com.jpexs.decompiler.flash.types.GLYPHENTRY;
import com.jpexs.decompiler.flash.types.TEXTRECORD;
import java.io.FileInputStream;

public class CheckOverflow {
  static final double TOLERANCE = 1.05; // 5 % más ancho todavía se ve bien

  public static void main(String[] args) throws Exception {
    SWF original = load(args[0]);
    SWF translated = load(args[1]);
    int count = 0;
    for (CharacterTag tag : translated.getCharacters(false).values()) {
      if (!(tag instanceof DefineTextTag text)) continue;
      if (!(original.getCharacter(text.getCharacterId()) instanceof DefineTextTag before)) continue;
      int widthBefore = width(before);
      int widthAfter = width(text);
      if (widthAfter > widthBefore * TOLERANCE) {
        System.out.printf("Texto %d: %d%% del ancho original%n", text.getCharacterId(), 100 * widthAfter / widthBefore);
        count++;
      }
    }
    System.out.println(count + " textos más anchos que el original");
  }

  // Borde derecho del renglón más largo (en twips)
  static int width(DefineTextTag text) {
    int x = 0;
    int max = 1;
    for (TEXTRECORD record : text.textRecords) {
      if (record.styleFlagsHasXOffset) x = record.xOffset;
      int end = x;
      for (GLYPHENTRY glyph : record.glyphEntries) end += glyph.glyphAdvance;
      max = Math.max(max, end);
      x = end;
    }
    return max;
  }

  static SWF load(String path) throws Exception {
    try (FileInputStream in = new FileInputStream(path)) {
      return new SWF(in, false);
    }
  }
}
