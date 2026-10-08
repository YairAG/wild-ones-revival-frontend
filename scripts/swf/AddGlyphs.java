// Agrega a las fuentes de un SWF las letras que les faltan (acentos, ñ, ¿, ¡ y todo el alfabeto), para poder
// traducir sus textos. Cada fuente de Flash solo trae las letras que usaba su texto original.
//
//   java -cp "<carpeta de JPEXS>/lib/*" scripts/swf/AddGlyphs.java <entrada.swf> <salida.swf> [carpeta de fuentes]
//
// La forma de cada letra nueva sale de un archivo <nombre de la fuente>.ttf en la carpeta de fuentes (si está),
// si no de la fuente instalada en Windows con ese nombre y, si tampoco, de Arial.
import com.jpexs.decompiler.flash.SWF;
import com.jpexs.decompiler.flash.tags.base.CharacterTag;
import com.jpexs.decompiler.flash.tags.base.FontTag;
import java.awt.Font;
import java.awt.GraphicsEnvironment;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.List;

public class AddGlyphs {
  static final String CHARS = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`"
      + "abcdefghijklmnopqrstuvwxyz{|}~áéíóúÁÉÍÓÚñÑüÜ¿¡";

  public static void main(String[] args) throws Exception {
    File fontsDir = args.length > 2 ? new File(args[2]) : null;
    List<String> installed = List.of(GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames());
    SWF swf;
    try (FileInputStream in = new FileInputStream(args[0])) {
      swf = new SWF(in, false);
    }

    for (CharacterTag tag : swf.getCharacters(false).values()) {
      if (!(tag instanceof FontTag font)) continue;
      Font source = sourceFont(font, fontsDir, installed);
      int added = 0;
      for (char c : CHARS.toCharArray()) {
        if (!font.containsChar(c) && source.canDisplay(c) && font.addCharacter(c, source)) added++;
      }
      System.out.println(font.getCharacterId() + " " + font.getFontNameIntag() + ": +" + added + " letras (de "
          + source.getFontName() + ")");
    }

    try (FileOutputStream out = new FileOutputStream(args[1])) {
      swf.saveTo(out);
    }
  }

  static Font sourceFont(FontTag font, File fontsDir, List<String> installed) throws Exception {
    String name = font.getFontNameIntag();
    int style = (font.isBold() ? Font.BOLD : 0) | (font.isItalic() ? Font.ITALIC : 0);
    File file = fontsDir == null ? null : new File(fontsDir, name + ".ttf");
    if (file != null && file.exists()) return Font.createFont(Font.TRUETYPE_FONT, file).deriveFont(style, 1024f);
    return new Font(installed.contains(name) ? name : "Arial", style, 1024);
  }
}
