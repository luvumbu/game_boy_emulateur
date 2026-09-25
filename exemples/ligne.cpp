/* Une ligne entière de tuiles : une boucle, un appel. */

Tuile BRIQUE = { "########", "#--#---#", "#--#---#", "########", "---#----", "---#----", "########", "#--#---#" };

int main() {
  for (uint8_t x = 0; x < 20; x++) {
    poser(x, 14, BRIQUE);
  }

  while (true) { image(); }
  return 0;
}
