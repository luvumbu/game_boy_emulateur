#include <Tuile>   // un dessin de 8 × 8 pixels
#include <poser>   // pose une tuile sur une case du fond

Tuile C = { ".##..##.", "########", "########", "########", ".######.", "..####..", "...##...", "........" };

int main() { poser(9, 8, C); while (true) image(); return 0; }
