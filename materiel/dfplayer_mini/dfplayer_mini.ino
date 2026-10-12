/*
 * DFPlayer Mini : jouer la piste 1 au démarrage.
 *
 * Le branchement est dessiné dans images/dfplayer-branchement.svg :
 *
 *   Arduino 5V   → VCC  (patte 1 du DFPlayer)
 *   Arduino GND  → GND  (patte 7 ou 10 : elles sont reliées dedans)
 *   Arduino D11  → résistance de 1 kΩ → RX (patte 2)   les ORDRES partent par là
 *   Arduino D10  ← TX (patte 3)                        les RÉPONSES reviennent par là
 *   Haut-parleur 8 Ω → SPK_1 (patte 6) et SPK_2 (patte 8)
 *
 * La carte microSD (formatée en FAT32) contient un dossier « mp3 » avec des
 * fichiers nommés par leur numéro, sur 4 chiffres : 0001.mp3, 0002.mp3…
 * Le nom compte : « 0001.mp3 » est la piste 1, quoi qu'il contienne.
 *
 * Il faut une bibliothèque : dans l'Arduino IDE, menu Outils → Gérer les
 * bibliothèques…, chercher « DFRobotDFPlayerMini » (de DFRobot), Installer.
 *
 * Avec un « vrai » DFPlayer (puce YX5200 ou AA19HFA440 au dos), tout marche.
 * Avec une copie (puce MH2024K, GD3200B…), la lecture marche presque
 * toujours ; si « begin » échoue, voir la note tout en bas.
 */

/* SoftwareSerial : une liaison série « faite à la main » sur deux broches
   ordinaires. Les broches 0 et 1 (la vraie liaison série) servent déjà à
   parler à l'ordinateur par le câble USB : on les laisse libres. */
#include <SoftwareSerial.h>

/* La bibliothèque qui sait parler au DFPlayer : elle fabrique les messages
   (« joue la piste 3 », « volume 20 »…) à notre place. */
#include <DFRobotDFPlayerMini.h>

/* La liaison avec le DFPlayer : on RÉCOIT sur la broche 10, on ENVOIE sur la
   broche 11. Attention, c'est croisé : ce que l'Arduino envoie (11) arrive
   sur le RX du DFPlayer ; ce que le DFPlayer envoie (son TX) arrive sur 10. */
SoftwareSerial liaison(10, 11);   // (broche qui reçoit, broche qui envoie)

/* Le DFPlayer lui-même, vu par le programme. */
DFRobotDFPlayerMini lecteur;

void setup() {
  /* La liaison avec l'ordinateur, pour lire les messages dans le
     « Moniteur série » (la loupe en haut à droite de l'IDE), réglé à 115200. */
  Serial.begin(115200);

  /* La liaison avec le DFPlayer : il parle TOUJOURS à 9600 bauds. */
  liaison.begin(9600);

  Serial.println("Je cherche le DFPlayer...");

  /* « begin » envoie un premier message et attend la réponse.
     S'il ne répond pas, c'est presque toujours :
       - un fil RX/TX inversé (échange les fils des broches 10 et 11) ;
       - pas de carte microSD, ou mal enfoncée ;
       - un GND oublié. */
  if (!lecteur.begin(liaison)) {
    Serial.println("Pas de reponse : verifie RX/TX, la carte microSD et le GND.");
    while (true) {
      delay(1000);   // on s'arrête là : rien d'autre ne marcherait
    }
  }

  Serial.println("DFPlayer pret !");

  /* Le volume : de 0 (muet) à 30 (le plus fort). 20, c'est déjà bien fort
     sur un petit haut-parleur. */
  lecteur.volume(20);

  /* Jouer la piste 1 : le fichier mp3/0001.mp3 de la carte. */
  lecteur.playMp3Folder(1);
}

void loop() {
  /* Le DFPlayer prévient quand il a fini une piste, ou qu'il y a un souci.
     « available » dit s'il a quelque chose à dire ; on l'affiche. */
  if (lecteur.available()) {
    uint8_t quoi = lecteur.readType();
    int valeur = lecteur.read();

    if (quoi == DFPlayerPlayFinished) {
      Serial.print("Piste finie : ");
      Serial.println(valeur);

      /* Et l'on enchaîne : la piste suivante. Enlève ces deux lignes pour
         ne jouer la piste 1 qu'une seule fois. */
      lecteur.playMp3Folder(valeur + 1);
    } else if (quoi == DFPlayerCardRemoved) {
      Serial.println("Carte microSD retiree.");
    } else if (quoi == DFPlayerCardInserted) {
      Serial.println("Carte microSD remise.");
    } else if (quoi == DFPlayerError) {
      Serial.print("Erreur du DFPlayer, code ");
      Serial.println(valeur);   // 4 ou 5 : souvent un fichier introuvable (mauvais nom ?)
    }
  }
}

/*
 * NOTE — une copie qui ne répond pas à « begin » :
 *
 * Certaines copies ne renvoient pas la réponse attendue, alors que la lecture
 * marche. Remplace la ligne
 *
 *     if (!lecteur.begin(liaison)) {
 *
 * par
 *
 *     if (!lecteur.begin(liaison, false, true)) {
 *
 * (false : ne pas attendre d'accusé de réception ; true : tout remettre à
 * zéro au démarrage). Ça suffit le plus souvent.
 */
