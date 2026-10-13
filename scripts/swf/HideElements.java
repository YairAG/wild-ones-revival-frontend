// Oculta botones, sprites y dibujos de un SWF dejándolos vacíos: no se ven ni se pueden pulsar, pero siguen
// existiendo, así que el código del juego que los usa (visible, addEventListener...) no se rompe.
//
//   java -cp "<carpeta de JPEXS>/lib/*" scripts/swf/HideElements.java <entrada.swf> <salida.swf> <id>,<id>,...
//
// Los ids son los de los DefineButton2, DefineSprite o DefineShape dentro del SWF (se ven con JPEXS). Un sprite
// solo se vacía si el código no usa lo que tiene dentro.
import com.jpexs.decompiler.flash.SWF;
import com.jpexs.decompiler.flash.tags.DefineButton2Tag;
import com.jpexs.decompiler.flash.tags.DefineSpriteTag;
import com.jpexs.decompiler.flash.tags.Tag;
import com.jpexs.decompiler.flash.tags.base.CharacterTag;
import com.jpexs.decompiler.flash.tags.base.PlaceObjectTypeTag;
import com.jpexs.decompiler.flash.tags.base.ShapeTag;
import com.jpexs.decompiler.flash.types.SHAPEWITHSTYLE;
import java.io.FileInputStream;
import java.io.FileOutputStream;

public class HideElements {
  public static void main(String[] args) throws Exception {
    SWF swf;
    try (FileInputStream in = new FileInputStream(args[0])) {
      swf = new SWF(in, false);
    }

    for (String id : args[2].split(",")) {
      CharacterTag element = swf.getCharacter(Integer.parseInt(id));
      if (element instanceof DefineButton2Tag button) {
        button.characters.clear(); // sin dibujos ni zona de clic
      } else if (element instanceof DefineSpriteTag sprite) {
        for (Tag tag : sprite.getTags().toArrayList()) {
          if (tag instanceof PlaceObjectTypeTag) sprite.removeTag(tag); // quita lo que muestra
        }
      } else if (element instanceof ShapeTag shape) {
        shape.shapes = SHAPEWITHSTYLE.createEmpty(shape.getShapeNum()); // dibujo vacío
      } else {
        throw new IllegalArgumentException(id + " no es un botón, un sprite ni un dibujo");
      }
      element.setModified(true);
      System.out.println(id + " oculto");
    }

    try (FileOutputStream out = new FileOutputStream(args[1])) {
      swf.saveTo(out);
    }
  }
}
