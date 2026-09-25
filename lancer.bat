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
node demarrer.mjs
if errorlevel 1 (
  echo.
  echo Une erreur est survenue : le message est juste au-dessus.
  pause
)
exit /b 0

:refus
echo.
echo Sans Node.js, l'atelier ne peut pas demarrer.
echo Pour l'installer plus tard : https://nodejs.org  puis relancer ce fichier.
pause
exit /b 1
