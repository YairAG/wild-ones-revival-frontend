// Cambia cadenas del código ActionScript compilado de un SWF (textos que el juego pone por código, p. ej.
// "unlock at level "). Solo cambia cadenas idénticas a las de la lista: la misma cadena podría usarse como
// clave interna, así que la lista se revisa a mano.
//
//   java -cp "<carpeta de JPEXS>/lib/*" scripts/swf/ReplaceStrings.java <entrada.swf> <salida.swf> <lista.tsv>
//
// lista.tsv: un reemplazo por renglón, "original<TAB>nuevo", con los saltos de línea escritos como \n.
import com.jpexs.decompiler.flash.SWF;
import com.jpexs.decompiler.flash.abc.ABC;
import com.jpexs.decompiler.flash.tags.ABCContainerTag;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class ReplaceStrings {
  public static void main(String[] args) throws Exception {
    Map<String, String> replacements = new HashMap<>();
    for (String line : Files.readAllLines(Path.of(args[2]), StandardCharsets.UTF_8)) {
      String[] parts = line.split("\t", -1);
      if (parts.length == 2) replacements.put(unescape(parts[0]), unescape(parts[1]));
    }

    SWF swf;
    try (FileInputStream in = new FileInputStream(args[0])) {
      swf = new SWF(in, false);
    }

    Set<String> found = new HashSet<>();
    for (ABCContainerTag container : swf.getAbcList()) {
      ABC abc = container.getABC();
      for (int i = 1; i < abc.constants.getStringCount(); i++) {
        String replacement = replacements.get(abc.constants.getString(i));
        if (replacement == null) continue;
        found.add(abc.constants.getString(i));
        abc.constants.setString(i, replacement);
        ((com.jpexs.decompiler.flash.tags.Tag) container).setModified(true);
      }
    }

    for (String original : replacements.keySet()) {
      if (!found.contains(original)) System.out.println("No está en el código: " + original.replace("\n", "\\n"));
    }
    System.out.println("Cadenas cambiadas: " + found.size() + " de " + replacements.size());

    try (FileOutputStream out = new FileOutputStream(args[1])) {
      swf.saveTo(out);
    }
  }

  static String unescape(String text) {
    return text.replace("\\n", "\n").replace("\\t", "\t");
  }
}
