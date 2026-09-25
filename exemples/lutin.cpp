/* La même tuile, mais en LUTIN : elle bouge au pixel près, hors de la grille. */

Tuile BALLE = { "..####..", ".#----#.", "#--++--#", "#-+##+-#", "#-+##+-#", "#--++--#", ".#----#.", "..####.." };

uint8_t x = 76;
uint8_t y = 68;

int main() {
  texte(2, 1, "LES FLECHES");

  while (true) {
    image();

    if (bouton(DROITE) && x < 152) x++;
    if (bouton(GAUCHE) && x > 0) x--;
    if (bouton(BAS) && y < 136) y++;
    if (bouton(HAUT) && y > 0) y--;

    sprite(0, x, y, BALLE);
  }

  return 0;
}
