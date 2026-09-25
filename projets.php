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

refuser("« $quoi » n’est pas une demande connue : liste, ouvrir, creer, enregistrer, capture, cartouche, renommer, supprimer", 404);
