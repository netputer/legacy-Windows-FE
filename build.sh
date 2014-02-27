#!/usr/bin/env sh
cd `dirname $0`
work_path="`pwd`"
PROJECT=$1;
TARGET=$2;
NLS=$3;

build_i18n_resources() {
    git submodule init
    git submodule update
    cd ${work_path}/i18n/
    install_npm
    grunt build:$PROJECT:$NLS
    cd ${work_path}
}

build_app_code() {
    mkdir -p ${work_path}/dist
    cp -r ${work_path}/i18n/dist/i18n ${work_path}/dist
    first_language=`echo $NLS | cut -f 1 -d ','`
    echo ${first_language}
    grunt build:$PROJECT:$TARGET:${first_language}
}

install_npm() {
    npm i
}

install_npm
build_i18n_resources
build_app_code