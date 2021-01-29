#!/bin/bash

if [ -z "$1" ]
  then
  	printf "\nPath to EMSDK is required\n"
    exit -1
fi

source $1/emsdk_env.sh

../oblivc_gcc/bin/oblivcc million.c million.oc -I .

chmod +x ./a.out

../oblivc_wasm/bin/oblivcc million_wasm.c million.oc -I .

gnome-terminal -- ./a.out

emrun --serve_after_close  test.html
