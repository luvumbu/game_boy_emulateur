@echo off
rem Double-cliquer ce fichier suffit : il demarre l'atelier et ouvre le
rem navigateur tout seul. Node.js doit etre installe ; s'il ne l'est pas,
rem ce fichier propose de l'installer.
cd /d "%~dp0"

rem --- Node.js est-il la ? ---
where node >nul 2>nul
if not errorlevel 1 goto lancer

rem Installe, mais absent du PATH de cette fenetre (juste apres une installation) ?
if exist "%ProgramFiles%\nodejs\node.exe" goto chemin

echo.
echo Node.js n'est pas installe sur ce PC. L'atelier en a besoin pour fonctionner.

:proposer
echo.
choice /c ON /m "Voulez-vous l'installer automatiquement maintenant"
if errorlevel 2 goto refus

rem --- l'installation : winget s'il existe, sinon l'installateur officiel ---
where winget >nul 2>nul
if errorlevel 1 goto telecharger

echo.
echo Installation de Node.js LTS avec winget...
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
goto verifier

:telecharger
echo.
echo Telechargement de Node.js LTS depuis nodejs.org...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $v=(Invoke-RestMethod https://nodejs.org/dist/index.json | Where-Object { $_.lts } | Select-Object -First 1).version; $f=Join-Path $env:TEMP ('node-'+$v+'-x64.msi'); Invoke-WebRequest ('https://nodejs.org/dist/'+$v+'/node-'+$v+'-x64.msi') -OutFile $f; Start-Process msiexec -ArgumentList '/i',$f,'/passive' -Wait"

:verifier
if exist "%ProgramFiles%\nodejs\node.exe" goto chemin
echo.
echo L'installation n'a pas abouti. Installez Node.js a la main : https://nodejs.org
pause
exit /b 1

:chemin
rem La fenetre ne voit pas encore le nouveau PATH : on le lui donne.
set "PATH=%ProgramFiles%\nodejs;%PATH%"
echo Node.js est pret.

:lancer
rem --- Node.js est-il assez recent ? Il faut la version 18 ou plus ---
rem (fetch, AbortSignal.timeout... : une version 16 plantait au demarrage
rem avec un message incomprehensible). node rend 1 si la version est trop vieille.
node -e "process.exit(Number(process.versions.node.split('.')[0]) < 18 ? 1 : 0)"
if errorlevel 1 goto tropVieux

rem --- le fichier qui demarre l'atelier est-il la ? ---
if not exist "demarrer.mjs" goto incomplet

node demarrer.mjs
if errorlevel 1 (
  echo.
  echo Une erreur est survenue : le message est juste au-dessus.
  pause
)
exit /b 0

:tropVieux
echo.
for /f %%v in ('node -p "process.versions.node"') do echo Node.js %%v est installe, mais il est trop ancien : l'atelier demande la version 18 ou plus.
goto proposer

:incomplet
echo.
echo Le fichier demarrer.mjs manque dans ce dossier : le projet est incomplet.
echo Recopiez le dossier en entier (ou retelechargez-le), en gardant de cote le dossier projets.
pause
exit /b 1

:refus
echo.
echo Sans Node.js (version 18 ou plus), l'atelier ne peut pas demarrer.
echo Pour l'installer plus tard : https://nodejs.org  puis relancer ce fichier.
pause
exit /b 1
