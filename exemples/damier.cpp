/* Un damier : deux tuiles, et le reste de la division par deux. */

#include <Tuile>   // un dessin de 8 × 8 pixels
#include <poser>   // pose une tuile sur une case du fond

Tuile PLEIN = { "########", "########", "########", "########", "########", "########", "########", "########" };
Tuile CREUX = { "#-#-#-#-", "-#-#-#-#", "#-#-#-#-", "-#-#-#-#", "#-#-#-#-", "-#-#-#-#", "#-#-#-#-", "-#-#-#-#" };

int main() {
  for (uint8_t y = 0; y < 18; y++) {
    for (uint8_t x = 0; x < 20; x++) {
      if ((x + y) % 2 == 0) poser(x, y, PLEIN);
      else poser(x, y, CREUX);
    }
  }

  while (true) { image(); }
  return 0;
}
