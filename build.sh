#!/usr/bin/env sh

PROJECT=$1;
TARGET=$2;
NLS=$3;

git submodule init
git submodule update
grunt clean:dist
cd i18n/
npm i
grunt build:$PROJECT:$NLS
cd ../
mkdir dist
cp -r i18n/dist/i18n dist/
grunt build:$PROJECT:$TARGET:$NLS
