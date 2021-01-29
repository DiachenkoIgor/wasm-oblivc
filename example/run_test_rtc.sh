#!/bin/bash

if [ -z "$1" ]
  then
  	printf "\nPath to EMSDK is required\n"
    exit -1
fi

if [ -z "$2" ]
  then
  	printf "\nBrowser for emrun is not selected\n"
    exit -1
fi

source $1/emsdk_env.sh

gcc ws_server.c -lws -lpthread -o server.out && printf "Finish WS server compile \n"


../oblivc_wasm/bin/oblivcc million_rtc.c million.oc -I . 1 && printf "Finish Rtc WASM Server compile \n"


../oblivc_wasm/bin/oblivcc million_rtc_client.c million.oc -I . 2 && printf "Finish Rtc WASM Client compile \n"

gnome-terminal -- ./server.out

sleep 2

gnome-terminal -- emrun --serve_after_close --browser $2 test1.html

sleep 2

emrun --serve_after_close --browser $2 --port 6831 test2.html