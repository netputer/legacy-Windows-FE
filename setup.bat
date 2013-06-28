cd /d %~dp0
wget -O .\node-v0.10.12-x64.msi http://nodejs.org/dist/v0.10.12/x64/node-v0.10.12-x64.msi
.\node-v0.10.12-x64.msi
del .\node-v0.10.12-x64.msi
wget -O .\rubyinstaller-2.0.0-p195.exe http://rubyforge.org/frs/download.php/76955/rubyinstaller-2.0.0-p195.exe
.\rubyinstaller-2.0.0-p195.exe
del .\rubyinstaller-2.0.0-p195.exe
npm install -g yo grunt bower
cd web-new
npm install
gem install compass
