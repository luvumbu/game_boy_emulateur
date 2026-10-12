<?php
/**
 * Les projets, sur le disque.
 *
 * C'est le SEUL morceau de ce dépôt qui tourne côté serveur, et le seul qui
 * écrive un fichier. Tout le reste — le compilateur, l'émulateur, les ateliers
 * — vit dans le navigateur ; on n'ajoute un service que pour ce qu'une page ne
 * peut pas faire, et écrire dans un dossier en fait partie.
 *
 * Un projet est un DOSSIER, et rien d'autre :
 *
 *   projets/mon_jeux/
 *     principal.cpp     le programme, et ses voisins « #include »
 *     capture.png       la vignette, telle que la console l'a rendue
 *     mon_jeux.gb       la cartouche, prête pour une vraie console
 *     projet.json       le titre gravé, la console visée, la date
 *
 * On peut donc l'ouvrir dans l'explorateur, le copier sur une clé, le mettre
 * dans une archive. La page ne fait qu'ouvrir et enregistrer ; elle n'est pas
 * la propriétaire du travail.
 *
 * ------------------------------------------------------------------------
 * CE SERVICE ÉCRIT DES FICHIERS. Il est donc borné, et strictement :
 *
 *   - tout vit sous « projets/ », et nulle part ailleurs ;
 *   - un nom de projet ne peut être que « a-z 0-9 _ - », de 1 à 40 signes :
 *     ni point, ni barre oblique, ni deux-points — donc aucun « .. » possible ;
 *   - un nom de fichier ne peut être que « nom.cpp » avec les mêmes signes ;
 *   - et le chemin final est REVÉRIFIÉ après coup, avec realpath : si par un
 *     chemin qu'on n'a pas prévu il sortait du dossier des projets, on refuse.
 *
 * Deux gardes qui disent la même chose, et c'est voulu. Écrire un fichier sur
 * la foi d'un nom venu du dehors est la faute la plus courante et la plus
 * chère ; une seule vérification suffit tant qu'elle est juste, et personne ne
 * peut jurer qu'elle l'est.
 * ------------------------------------------------------------------------
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const DOSSIER = __DIR__ . '/projets';
const TAILLE_MAX = 2 * 1024 * 1024; // deux méga-octets par fichier : large pour du C++, étroit pour un dépôt

/** Répondre, et s'arrêter là. */
function repondre(array $quoi, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($quoi, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Refuser, en disant quoi — un refus muet fait chercher au mauvais endroit. */
function refuser(string $pourquoi, int $code = 400): never
{
    repondre(['erreur' => $pourquoi], $code);
}

/**
 * Le nom d'un projet, ramené à ce qu'un dossier accepte.
 *
 * « Mon Jeu ! » devient « mon_jeu ». On corrige plutôt que de refuser — c'est
 * ce que fait déjà la boîte de nom de la page — mais on refuse ce qui ne
 * laisse RIEN : un dossier sans nom n'est pas un dossier.
 */
function nomPropre(string $brut): string
{
    $propre = strtolower(trim($brut));
    $propre = strtr($propre, [
        'à' => 'a', 'â' => 'a', 'ä' => 'a', 'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
        'î' => 'i', 'ï' => 'i', 'ô' => 'o', 'ö' => 'o', 'ù' => 'u', 'û' => 'u', 'ü' => 'u',
        'ç' => 'c', 'œ' => 'oe', 'æ' => 'ae',
    ]);
    $propre = preg_replace('/[^a-z0-9_-]+/', '_', $propre);
    $propre = trim($propre, '_');
    return substr($propre, 0, 40);
}

/** Le dossier d'un projet — ou un refus. Rien ne sort de « projets/ ». */
function dossierDuProjet(string $nom, bool $doitExister = true): string
{
    if (!preg_match('/^[a-z0-9_-]{1,40}$/', $nom)) {
        refuser("« $nom » n’est pas un nom de projet : des lettres, des chiffres, « _ » et « - », pas plus.");
    }

    $chemin = DOSSIER . '/' . $nom;

    if ($doitExister && !is_dir($chemin)) {
        refuser("le projet « $nom » n’existe pas", 404);
    }

    /* La seconde garde : le chemin RÉEL doit être dans « projets/ ». Le nom a
       déjà été filtré ; on ne se fie pas pour autant à ce filtre seul. */
    if (is_dir($chemin)) {
        $reel = realpath($chemin);
        $racine = realpath(DOSSIER);
        if ($reel === false || $racine === false || !str_starts_with($reel, $racine . DIRECTORY_SEPARATOR)) {
            refuser('chemin refusé', 403);
        }
    }

    return $chemin;
}

/** Un nom de fichier de programme : « principal.cpp », et rien d'autre. */
function fichierPropre(string $nom): string
{
    if (!preg_match('/^[A-Za-z0-9_-]{1,40}\.cpp$/', $nom)) {
        refuser("« $nom » n’est pas un nom de fichier : « quelquechose.cpp »");
    }
    return $nom;
}

/** Ce que le programme neuf contient, tant que personne n'a rien écrit. */
function programmeNeuf(string $titre): string
{
    $lignes = [
        '/*',
        " * $titre",
        ' *',
        ' * Un programme neuf. Tout part de « int main() » — c\'est là que la console',
        ' * arrive, et nulle part ailleurs.',
        ' */',
        '',
        'int main() {',
        "  texte(4, 6, \"$titre\");",
        '',
        '  while (true) {',
        '    image();',
        '  }',
        '}',
        '',
    ];
    return implode("\n", $lignes);
}

/** Les réglages d'un projet, avec leurs valeurs par défaut. */
function reglagesDuProjet(string $dossier, string $nom): array
{
    $defaut = ['titre' => strtoupper(substr($nom, 0, 11)), 'console' => 'les-deux', 'change' => null];
    $ou = $dossier . '/projet.json';
    if (!is_file($ou)) {
        return $defaut;
    }
    $lu = json_decode((string) file_get_contents($ou), true);
    return is_array($lu) ? array_merge($defaut, $lu) : $defaut;
}

/** Le corps de la requête, en tableau. */
function corps(): array
{
    $brut = file_get_contents('php://input');
    if ($brut === false || $brut === '') {
        return [];
    }
    $lu = json_decode($brut, true);
    return is_array($lu) ? $lu : [];
}

/* ===================================================================
 *  Les CAPTURES d'une cartouche : un dossier par cartouche, sous
 *  « captures/ » (à côté de « projets/ », pour ne pas se mêler aux jeux).
 *
 *    captures/captures_tetris/
 *      capture.json    { titre, empreinte, octets, dessins: [{ nom, cote, rangees, source, adresse }] }
 *      tuiles-1.png    toute la cartouche en tuiles (« 🗂 Toute la cartouche »)
 *      ramasse-1.png   ce que le collecteur a ramassé (« 🧲 »)
 *
 *  Mêmes gardes que les projets, et la traduction exacte de
 *  projets-serveur.mjs.
 * =================================================================== */
const CAPTURES = __DIR__ . '/captures';

function dossierDesCaptures(string $nom, bool $doitExister = true): string
{
    if (!preg_match('/^[a-z0-9_-]{1,40}$/', $nom)) {
        refuser("« $nom » n’est pas un nom de dossier : des lettres, des chiffres, « _ » et « - », pas plus.");
    }
    if (!is_dir(CAPTURES)) {
        @mkdir(CAPTURES, 0777, true);
    }
    $chemin = CAPTURES . '/' . $nom;
    if ($doitExister && !is_file($chemin . '/capture.json')) {
        refuser("le dossier de captures « $nom » n’existe pas", 404);
    }
    if (is_dir($chemin)) {
        $reel = realpath($chemin);
        $racine = realpath(CAPTURES);
        if ($reel === false || $racine === false || !str_starts_with($reel, $racine . DIRECTORY_SEPARATOR)) {
            refuser('chemin refusé', 403);
        }
    }
    return $chemin;
}

function lireCapture(string $dossier): array
{
    $lu = json_decode((string) file_get_contents($dossier . '/capture.json'), true);
    return is_array($lu) ? $lu : ['dessins' => []];
}

function ecrireCapture(string $dossier, array $capture): void
{
    $texte = json_encode($capture, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if (strlen($texte) > TAILLE_MAX * 4) {
        refuser('trop de dessins dans ce dossier (8 Mo au plus)');
    }
    file_put_contents($dossier . '/capture.json', $texte);
}

function imagesDe(string $dossier): array
{
    $images = array_values(array_filter(scandir($dossier) ?: [], static fn ($f) => (bool) preg_match('/^(tuiles|ramasse)-\d{1,4}\.png$/', $f)));
    natsort($images);
    return array_values($images);
}

/** Un dessin venu de la page : vérifié champ par champ, rien d'autre n'est gardé. */
function dessinPropre($d): array
{
    if (!is_array($d)) {
        refuser('un dessin illisible');
    }
    $nom = (string) ($d['nom'] ?? '');
    if (!preg_match('/^[A-Z_][A-Z0-9_]{0,39}$/', $nom)) {
        refuser("« $nom » n’est pas un nom de dessin : MAJUSCULES, chiffres et « _ »");
    }
    $cote = (int) ($d['cote'] ?? 0);
    if (!in_array($cote, [8, 16, 32], true)) {
        refuser("« $nom » : la taille doit être 8, 16 ou 32");
    }
    $rangees = $d['rangees'] ?? null;
    if (!is_array($rangees) || count($rangees) !== $cote) {
        refuser("« $nom » : ses pixels ne font pas $cote × $cote");
    }
    foreach ($rangees as $r) {
        if (!is_string($r) || !preg_match('/^[0-3]{' . $cote . '}$/', $r)) {
            refuser("« $nom » : ses pixels ne font pas $cote × $cote");
        }
    }
    $propre = ['nom' => $nom, 'cote' => $cote, 'rangees' => array_values($rangees)];
    if (isset($d['source']) && is_string($d['source'])) {
        $propre['source'] = substr($d['source'], 0, 20);
    }
    if (isset($d['adresse']) && is_int($d['adresse'])) {
        $propre['adresse'] = $d['adresse'];
    }
    return $propre;
}

/* ------------------------------------------------------------------ */

if (!is_dir(DOSSIER) && !@mkdir(DOSSIER, 0777, true) && !is_dir(DOSSIER)) {
    refuser('le dossier « projets/ » n’a pas pu être créé — droits d’écriture ?', 500);
}

$quoi = $_GET['quoi'] ?? '';
$donnees = corps();
$nom = (string) ($_GET['projet'] ?? $donnees['projet'] ?? '');

switch ($quoi) {
    /* --- la liste, pour le lecteur de projets --- */
    case 'liste': {
        $projets = [];
        foreach (scandir(DOSSIER) ?: [] as $entree) {
            if ($entree === '.' || $entree === '..') {
                continue;
            }
            $dossier = DOSSIER . '/' . $entree;
            if (!is_dir($dossier) || !preg_match('/^[a-z0-9_-]{1,40}$/', $entree)) {
                continue;
            }

            $reglages = reglagesDuProjet($dossier, $entree);
            $fichiers = array_values(array_filter(
                scandir($dossier) ?: [],
                static fn ($f) => (bool) preg_match('/\.cpp$/', $f),
            ));

            $projets[] = [
                'nom' => $entree,
                'titre' => $reglages['titre'],
                'console' => $reglages['console'],
                'fichiers' => $fichiers,
                'capture' => is_file($dossier . '/capture.png'),
                'cartouche' => is_file($dossier . '/' . $entree . '.gb')
                    || is_file($dossier . '/' . $entree . '.gbc'),
                /* Laquelle des deux, ou les deux : le lecteur le montre. */
                'cartouches' => array_values(array_filter(['gb', 'gbc'], fn ($e) =>
                    is_file($dossier . '/' . $entree . '.' . $e))),
                /* La date du programme, et non celle du dossier : c'est le
                   travail qui date le projet, pas la dernière capture. */
                'change' => is_file($dossier . '/principal.cpp')
                    ? filemtime($dossier . '/principal.cpp')
                    : filemtime($dossier),
            ];
        }

        usort($projets, static fn ($a, $b) => $b['change'] <=> $a['change']);
        repondre(['projets' => $projets, 'dossier' => str_replace('\\', '/', realpath(DOSSIER) ?: DOSSIER)]);
    }

    /* --- ouvrir : tous les fichiers du projet --- */
    case 'ouvrir': {
        $dossier = dossierDuProjet($nom);
        $fichiers = [];
        foreach (scandir($dossier) ?: [] as $entree) {
            if (preg_match('/^[A-Za-z0-9_-]{1,40}\.cpp$/', $entree)) {
                $fichiers[$entree] = file_get_contents($dossier . '/' . $entree);
            }
        }
        if ($fichiers === []) {
            $fichiers['principal.cpp'] = programmeNeuf(strtoupper($nom));
        }
        repondre([
            'nom' => $nom,
            'fichiers' => $fichiers,
            'reglages' => reglagesDuProjet($dossier, $nom),
            'dossier' => str_replace('\\', '/', realpath($dossier) ?: $dossier),
        ]);
    }

    /* --- créer : le dossier, et de quoi commencer --- */
    case 'creer': {
        $propre = nomPropre($nom);
        if ($propre === '') {
            refuser('il faut un nom : des lettres, des chiffres, « _ » ou « - »');
        }

        /* Jamais d'écrasement. Un projet qui porte déjà ce nom reçoit un
           numéro — comme la boîte de nom de la page, et pour la même raison :
           perdre le travail de quelqu'un sur une collision de nom est la pire
           chose que ce service puisse faire. */
        $libre = $propre;
        for ($n = 2; is_dir(DOSSIER . '/' . $libre) && $n < 1000; $n++) {
            $libre = substr($propre, 0, 40 - strlen((string) $n)) . $n;
        }

        $dossier = dossierDuProjet($libre, false);
        if (!@mkdir($dossier, 0777, true) && !is_dir($dossier)) {
            refuser("le dossier « $libre » n’a pas pu être créé", 500);
        }

        $titre = (string) ($donnees['titre'] ?? strtoupper(substr($libre, 0, 11)));
        file_put_contents($dossier . '/principal.cpp', programmeNeuf($titre));
        file_put_contents($dossier . '/projet.json', json_encode([
            'titre' => $titre,
            'console' => (string) ($donnees['console'] ?? 'les-deux'),
            'change' => time(),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        repondre(['nom' => $libre, 'dossier' => str_replace('\\', '/', realpath($dossier) ?: $dossier)]);
    }

    /* --- enregistrer : les fichiers, les réglages, et rien d'autre --- */
    case 'enregistrer': {
        $dossier = dossierDuProjet($nom);
        $fichiers = $donnees['fichiers'] ?? [];
        if (!is_array($fichiers) || $fichiers === []) {
            refuser('rien à enregistrer');
        }

        $ecrits = [];
        foreach ($fichiers as $quel => $contenu) {
            $propre = fichierPropre((string) $quel);
            if (!is_string($contenu) || strlen($contenu) > TAILLE_MAX) {
                refuser("« $propre » est vide ou trop gros");
            }
            file_put_contents($dossier . '/' . $propre, $contenu);
            $ecrits[] = $propre;
        }

        /* Un onglet fermé dans la page doit disparaître du dossier : sans cela
           un « #include » d'hier continuerait d'être trouvé, et le projet ne
           dirait plus la même chose que ce qu'on voit. */
        foreach (scandir($dossier) ?: [] as $entree) {
            if (preg_match('/^[A-Za-z0-9_-]{1,40}\.cpp$/', $entree) && !in_array($entree, $ecrits, true)) {
                @unlink($dossier . '/' . $entree);
            }
        }

        $reglages = reglagesDuProjet($dossier, $nom);
        $reglages['titre'] = (string) ($donnees['titre'] ?? $reglages['titre']);
        $reglages['console'] = (string) ($donnees['console'] ?? $reglages['console']);
        $reglages['change'] = time();
        file_put_contents($dossier . '/projet.json', json_encode($reglages, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        repondre(['nom' => $nom, 'fichiers' => $ecrits, 'change' => $reglages['change']]);
    }

    /* --- la vignette : l'écran de la console, tel quel --- */
    case 'capture': {
        $dossier = dossierDuProjet($nom);
        $donnee = (string) ($donnees['png'] ?? '');
        /* On n'accepte QUE du PNG, et l'on vérifie les huit octets de son
           en-tête après décodage : une extension ne prouve rien. */
        if (!preg_match('#^data:image/png;base64,([A-Za-z0-9+/=]+)$#', $donnee, $bouts)) {
            refuser('la capture doit être une image PNG');
        }
        $octets = base64_decode($bouts[1], true);
        if ($octets === false || strlen($octets) > TAILLE_MAX || substr($octets, 0, 8) !== "\x89PNG\r\n\x1a\n") {
            refuser('ce n’est pas un PNG');
        }
        file_put_contents($dossier . '/capture.png', $octets);
        repondre(['nom' => $nom, 'capture' => true, 'octets' => strlen($octets)]);
    }

    /* --- la cartouche, gardée à côté du programme --- */
    case 'cartouche': {
        $dossier = dossierDuProjet($nom);

        /*
         * Une cartouche, ou DEUX.
         *
         * « les deux » sur un programme en couleur en fabrique deux : le
         * « .gbc » avec ses palettes, le « .gb » sans un octet de couleur. Le
         * dossier garde les deux, sous le nom du projet — c’est ce qu’on met
         * sur une vraie console, et l’on choisit laquelle en la branchant.
         *
         * L’extension est le SEUL choix laissé au dehors, et elle est prise
         * dans une liste fermée : ce service écrit des fichiers, et un nom
         * d’extension venu du dehors est un nom de fichier venu du dehors.
         */
        $ecrits = [];
        $prises = ['gb' => 'gb', 'gbc' => 'gbc'];
        foreach ($prises as $cle => $extension) {
            if (!isset($donnees[$cle])) {
                continue;
            }
            $octets = base64_decode((string) $donnees[$cle], true);
            if ($octets === false || strlen($octets) < 0x150 || strlen($octets) > TAILLE_MAX) {
                refuser('ce n’est pas une cartouche');
            }
            file_put_contents($dossier . '/' . $nom . '.' . $extension, $octets);
            $ecrits[$extension] = strlen($octets);
        }

        if (!$ecrits) {
            refuser('ce n’est pas une cartouche');
        }

        /*
         * Une cartouche qui n’est plus fabriquée s’en va.
         *
         * On ôte la couleur d’un programme : le « .gbc » d’hier resterait dans
         * le dossier, plus vieux que le reste, et l’on croirait avoir toujours
         * une version en couleur — jusqu’à la brancher.
         */
        foreach ($prises as $extension) {
            $chemin = $dossier . '/' . $nom . '.' . $extension;
            if (!isset($ecrits[$extension]) && is_file($chemin)) {
                unlink($chemin);
            }
        }

        repondre(['nom' => $nom, 'cartouche' => true, 'cartouches' => $ecrits, 'octets' => array_sum($ecrits)]);
    }

    /* --- renommer : le dossier, et la cartouche qui porte son nom --- */
    case 'renommer': {
        $dossier = dossierDuProjet($nom);
        $vers = nomPropre((string) ($donnees['vers'] ?? ''));
        if ($vers === '') {
            refuser('il faut un nouveau nom');
        }
        if ($vers === $nom) {
            repondre(['nom' => $nom]);
        }
        $ailleurs = dossierDuProjet($vers, false);
        if (is_dir($ailleurs)) {
            refuser("« $vers » existe déjà");
        }
        if (!@rename($dossier, $ailleurs)) {
            refuser('le dossier n’a pas pu être renommé', 500);
        }
        /* Les DEUX cartouches suivent le nom du projet : en laisser une
           derrière, c’est un « mon_jeu.gbc » dans le dossier « mon_jeu2 ». */
        foreach (['gb', 'gbc'] as $extension) {
            $avant = $ailleurs . '/' . $nom . '.' . $extension;
            if (is_file($avant)) {
                @rename($avant, $ailleurs . '/' . $vers . '.' . $extension);
            }
        }
        repondre(['nom' => $vers]);
    }

    /* --- supprimer : le dossier, et ce qu'il contient de connu --- */
    case 'supprimer': {
        $dossier = dossierDuProjet($nom);
        /* On n'efface que ce qu'on sait avoir écrit. Un « rm -rf » sur un
           chemin venu du dehors est ce qu'on ne fera pas ici, quelles que
           soient les gardes posées plus haut. */
        foreach (scandir($dossier) ?: [] as $entree) {
            /* « gbc » comme « gb » : un projet en couleur a DEUX cartouches, et
               les oublier ici rend son dossier ineffaçable depuis la page. */
            if (preg_match('/^[A-Za-z0-9_-]{1,40}\.(cpp|gb|gbc|png|json|sav)$/', $entree)) {
                @unlink($dossier . '/' . $entree);
            }
        }
        $reste = array_diff(scandir($dossier) ?: [], ['.', '..']);
        if ($reste !== []) {
            refuser('le dossier contient autre chose que le projet : à effacer à la main — ' . implode(', ', $reste));
        }
        @rmdir($dossier);
        repondre(['supprime' => $nom]);
    }
}

switch ($quoi) {
    case 'captures-liste': {
        $captures = [];
        foreach (is_dir(CAPTURES) ? (scandir(CAPTURES) ?: []) : [] as $entree) {
            $dossier = CAPTURES . '/' . $entree;
            if (!preg_match('/^[a-z0-9_-]{1,40}$/', $entree) || !is_file($dossier . '/capture.json')) {
                continue;
            }
            $c = lireCapture($dossier);
            $captures[] = [
                'nom' => $entree,
                'titre' => (string) ($c['titre'] ?? ''),
                'empreinte' => (string) ($c['empreinte'] ?? ''),
                'dessins' => count($c['dessins'] ?? []),
                'images' => imagesDe($dossier),
                'change' => filemtime($dossier . '/capture.json'),
            ];
        }
        usort($captures, static fn ($a, $b) => $b['change'] <=> $a['change']);
        repondre(['captures' => $captures, 'dossier' => str_replace('\\', '/', realpath(CAPTURES) ?: CAPTURES)]);
    }

    case 'captures-ouvrir': {
        $dossier = dossierDesCaptures($nom);
        $lireSiLa = static function (string $fichier, $defaut) use ($dossier) {
            if (!is_file("$dossier/$fichier")) {
                return $defaut;
            }
            $lu = json_decode((string) file_get_contents("$dossier/$fichier"), true);
            return is_array($lu) ? $lu : $defaut;
        };
        $roles = $lireSiLa('roles.json', []);
        $decors = is_dir("$dossier/decors")
            ? array_values(array_filter(scandir("$dossier/decors") ?: [], static fn ($f) => (bool) preg_match('/^niveau-\d{1,3}(-\d{1,2})?\.png$/', $f)))
            : [];
        natsort($decors);
        $decors = array_values($decors);
        repondre([
            'nom' => $nom, 'capture' => lireCapture($dossier), 'images' => imagesDe($dossier),
            'dossier' => str_replace('\\', '/', realpath($dossier) ?: $dossier),
            'rangement' => $lireSiLa('rangement.json', null),        // organiser-cartouche.js : banques, paquets, rôles
            'roles' => $roles === [] ? new stdClass() : $roles,      // clé d'une tuile → 'lutin' | 'decor' (ramassé par 🧲)
            'decors' => $decors,                                     // les niveaux enregistrés (🗺)
        ]);
    }

    /* Un niveau enregistré (🗺) : decors/niveau-N.png, N choisi par le service ;
       les parties suivantes d'un très long niveau : niveau-N-2.png, -3… */
    case 'captures-decor': {
        $dossier = dossierDesCaptures($nom);
        if (!preg_match('#^data:image/png;base64,([A-Za-z0-9+/=]+)$#', (string) ($donnees['png'] ?? ''), $png)) {
            refuser('l’image doit être un PNG');
        }
        $octets = base64_decode($png[1], true);
        if ($octets === false || strlen($octets) > TAILLE_MAX || substr($octets, 0, 8) !== "\x89PNG\r\n\x1a\n") {
            refuser('ce n’est pas un PNG (ou il fait plus de 2 Mo)');
        }
        $ou = "$dossier/decors";
        if (!is_dir($ou)) {
            @mkdir($ou, 0777, true);
        }
        $partie = is_int($donnees['partie'] ?? null) && $donnees['partie'] >= 1 && $donnees['partie'] < 100 ? $donnees['partie'] : 0;
        $numero = is_int($donnees['numero'] ?? null) && $donnees['numero'] >= 1 && $donnees['numero'] < 1000 ? $donnees['numero'] : 0;
        if (!$numero) {
            $numero = 1;
            while (is_file("$ou/niveau-$numero.png")) {
                $numero++;
            }
        }
        $image = $partie ? "niveau-$numero-" . ($partie + 1) . '.png' : "niveau-$numero.png";
        file_put_contents("$ou/$image", $octets);
        repondre(['nom' => $nom, 'numero' => $numero, 'image' => "decors/$image"]);
    }

    /* Les rôles ramassés par 🧲 (personnage ou décor), ajoutés à ceux du dossier.
       « lutin » l'emporte sur « decor ». */
    case 'captures-roles': {
        $dossier = dossierDesCaptures($nom);
        $nouveaux = $donnees['roles'] ?? null;
        if (!is_array($nouveaux)) {
            refuser('pas de rôles');
        }
        $roles = [];
        if (is_file("$dossier/roles.json")) {
            $lu = json_decode((string) file_get_contents("$dossier/roles.json"), true);
            $roles = is_array($lu) ? $lu : [];
        }
        $ajoutes = 0;
        foreach ($nouveaux as $cle => $role) {
            if (!preg_match('/^[0-9a-f]{32}$/', (string) $cle) || !in_array($role, ['lutin', 'decor'], true)) {
                continue;
            }
            if (($roles[$cle] ?? null) === $role || ($roles[$cle] ?? null) === 'lutin') {
                continue;
            }
            $roles[$cle] = $role;
            $ajoutes++;
        }
        $texte = json_encode($roles === [] ? new stdClass() : $roles);
        if (strlen($texte) > TAILLE_MAX * 4) {
            refuser('trop de rôles (8 Mo au plus)');
        }
        file_put_contents("$dossier/roles.json", $texte);
        repondre(['nom' => $nom, 'ajoutes' => $ajoutes, 'roles' => count($roles)]);
    }

    /* Le rangement : rangement.json, et les images dans quatre sous-dossiers
       fixes, REFAITS à chaque rangement (« debut » les vide de leurs PNG).
       On n'efface rien d'autre. */
    case 'captures-organiser': {
        $dossier = dossierDesCaptures($nom);
        $sousDossiers = ['banques', 'personnages', 'decor', 'pas-encore-vu'];
        if (!empty($donnees['debut'])) {
            foreach ($sousDossiers as $sous) {
                if (!is_dir("$dossier/$sous")) {
                    continue;
                }
                foreach (scandir("$dossier/$sous") ?: [] as $f) {
                    if (preg_match('/^[a-z0-9_-]{1,60}\.png$/', $f)) {
                        @unlink("$dossier/$sous/$f");
                    }
                }
            }
        }
        if (array_key_exists('rangement', $donnees)) {
            if (!is_array($donnees['rangement'])) {
                refuser('rangement illisible');
            }
            $texte = json_encode($donnees['rangement'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if (strlen($texte) > TAILLE_MAX * 4) {
                refuser('rangement trop gros');
            }
            file_put_contents("$dossier/rangement.json", $texte);
        }
        $ecrites = 0;
        foreach (is_array($donnees['images'] ?? null) ? $donnees['images'] : [] as $image) {
            $chemin = (string) ($image['chemin'] ?? '');
            if (!preg_match('#^(banques|personnages|decor|pas-encore-vu)/([a-z0-9_-]{1,60}\.png)$#', $chemin, $bouts)) {
                refuser("« $chemin » n’est pas un chemin d’image du rangement");
            }
            if (!preg_match('#^data:image/png;base64,([A-Za-z0-9+/=]+)$#', (string) ($image['png'] ?? ''), $png)) {
                refuser('l’image doit être un PNG');
            }
            $octets = base64_decode($png[1], true);
            if ($octets === false || strlen($octets) > TAILLE_MAX || substr($octets, 0, 8) !== "\x89PNG\r\n\x1a\n") {
                refuser('ce n’est pas un PNG (ou il fait plus de 2 Mo)');
            }
            if (!is_dir("$dossier/{$bouts[1]}")) {
                @mkdir("$dossier/{$bouts[1]}", 0777, true);
            }
            file_put_contents("$dossier/{$bouts[1]}/{$bouts[2]}", $octets);
            $ecrites++;
        }
        repondre(['nom' => $nom, 'ecrites' => $ecrites]);
    }

    /* Jamais d'écrasement : un nom pris reçoit un numéro, comme les projets. */
    case 'captures-creer': {
        $propre = nomPropre($nom);
        if ($propre === '') {
            refuser('il faut un nom : des lettres, des chiffres, « _ » ou « - »');
        }
        dossierDesCaptures($propre, false);
        $libre = $propre;
        for ($n = 2; is_dir(CAPTURES . '/' . $libre) && $n < 1000; $n++) {
            $libre = substr($propre, 0, 40 - strlen((string) $n)) . $n;
        }
        $dossier = dossierDesCaptures($libre, false);
        if (!@mkdir($dossier, 0777, true) && !is_dir($dossier)) {
            refuser("le dossier « $libre » n’a pas pu être créé", 500);
        }
        ecrireCapture($dossier, [
            'titre' => substr((string) ($donnees['titre'] ?? ''), 0, 40),
            'empreinte' => substr(preg_replace('/[^0-9a-f]/', '', (string) ($donnees['empreinte'] ?? '')), 0, 16),
            'octets' => is_int($donnees['octets'] ?? null) ? $donnees['octets'] : 0,
            'dessins' => [],
        ]);
        repondre(['nom' => $libre, 'dossier' => str_replace('\\', '/', realpath($dossier) ?: $dossier)]);
    }

    /* Les pareils ne comptent qu'une fois ; un nom pris reçoit un numéro. */
    case 'captures-ajouter': {
        $dossier = dossierDesCaptures($nom);
        if (!is_array($donnees['dessins'] ?? null)) {
            refuser('rien à ajouter');
        }
        $capture = lireCapture($dossier);
        $dessins = is_array($capture['dessins'] ?? null) ? $capture['dessins'] : [];
        $pixels = [];
        $noms = [];
        foreach ($dessins as $d) {
            $pixels[implode('|', $d['rangees'])] = true;
            $noms[$d['nom']] = true;
        }
        $ajoutes = 0;
        foreach ($donnees['dessins'] as $brut) {
            $d = dessinPropre($brut);
            $cle = implode('|', $d['rangees']);
            if (isset($pixels[$cle])) {
                continue;
            }
            $libre = $d['nom'];
            for ($n = 2; isset($noms[$libre]); $n++) {
                $libre = substr($d['nom'], 0, 40 - strlen((string) $n) - 1) . '_' . $n;
            }
            $d['nom'] = $libre;
            $pixels[$cle] = true;
            $noms[$libre] = true;
            $dessins[] = $d;
            $ajoutes++;
        }
        $capture['dessins'] = $dessins;
        ecrireCapture($dossier, $capture);
        repondre(['nom' => $nom, 'ajoutes' => $ajoutes, 'dessins' => count($dessins)]);
    }

    /* Les dessins modifiés dans la page (renommés, ôtés) : la liste entière remplace l'ancienne. */
    case 'captures-modifier': {
        $dossier = dossierDesCaptures($nom);
        if (!is_array($donnees['dessins'] ?? null)) {
            refuser('rien à enregistrer');
        }
        $dessins = array_map('dessinPropre', $donnees['dessins']);
        if (count(array_unique(array_column($dessins, 'nom'))) !== count($dessins)) {
            refuser('deux dessins portent le même nom');
        }
        $capture = lireCapture($dossier);
        $capture['dessins'] = $dessins;
        ecrireCapture($dossier, $capture);
        repondre(['nom' => $nom, 'dessins' => count($dessins)]);
    }

    /* Une image de plus : « tuiles-3.png » si 1 et 2 existent. Le service choisit le nom. */
    case 'captures-image': {
        $dossier = dossierDesCaptures($nom);
        $sorte = (string) ($donnees['sorte'] ?? '');
        if (!in_array($sorte, ['tuiles', 'ramasse'], true)) {
            refuser('sorte d’image inconnue : tuiles ou ramasse');
        }
        if (!preg_match('#^data:image/png;base64,([A-Za-z0-9+/=]+)$#', (string) ($donnees['png'] ?? ''), $bouts)) {
            refuser('l’image doit être un PNG');
        }
        $octets = base64_decode($bouts[1], true);
        if ($octets === false || strlen($octets) > TAILLE_MAX || substr($octets, 0, 8) !== "\x89PNG\r\n\x1a\n") {
            refuser('ce n’est pas un PNG (ou il fait plus de 2 Mo)');
        }
        /* La même image déjà là (on a rangé deux fois sans rien changer) : on ne la double pas. */
        foreach (imagesDe($dossier) as $im) {
            if (str_starts_with($im, $sorte . '-') && file_get_contents("$dossier/$im") === $octets) {
                repondre(['nom' => $nom, 'image' => $im, 'deja' => true]);
            }
        }
        $n = 1;
        while (is_file("$dossier/$sorte-$n.png")) {
            $n++;
        }
        file_put_contents("$dossier/$sorte-$n.png", $octets);
        repondre(['nom' => $nom, 'image' => "$sorte-$n.png"]);
    }

    case 'captures-renommer': {
        $dossier = dossierDesCaptures($nom);
        $vers = nomPropre((string) ($donnees['vers'] ?? ''));
        if ($vers === '') {
            refuser('il faut un nouveau nom');
        }
        if ($vers === $nom) {
            repondre(['nom' => $nom]);
        }
        $ailleurs = dossierDesCaptures($vers, false);
        if (is_dir($ailleurs)) {
            refuser("« $vers » existe déjà");
        }
        if (!@rename($dossier, $ailleurs)) {
            refuser('le dossier n’a pas pu être renommé', 500);
        }
        repondre(['nom' => $vers]);
    }
}

refuser("« $quoi » n’est pas une demande connue : liste, ouvrir, creer, enregistrer, capture, cartouche, renommer, supprimer, captures-liste, captures-ouvrir, captures-creer, captures-ajouter, captures-modifier, captures-image, captures-renommer, captures-roles, captures-organiser, captures-decor", 404);
