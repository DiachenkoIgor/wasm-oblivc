#!/bin/bash

if [ -z "$1" ]
  then
  	printf "\nPath to EMSDK is required\n"
    exit -1
fi

source $1/emsdk_env.sh

wget https://www.gnupg.org/ftp/gcrypt/libgpg-error/libgpg-error-1.39.tar.bz2

tar -xf libgpg-error-1.39.tar.bz2

rm libgpg-error-1.39.tar.bz2

printf "\n--------------------------------------------- Download Finish\n\n"

cd libgpg-error-1.39/

git init

git add ./src/Makefile.in

git apply ../libgpg-error.patch

printf "\n--------------------------------------------- Patch for Makefile applied \n\n"

cd ..

path=$(pwd)

echo $path

cd libgpg-error-1.39/

emconfigure ./configure --prefix=$path/libs --sysconfdir=/etc  --host=x86_64-unknown-linux-gnu --enable-shared --enable-static --disable-dependency-tracking  --target=wasm64  --disable-threads --disable-doc --disable-tests

printf "\n--------------------------------------------- Configure Finished \n\n"

emmake make 

printf "\n--------------------------------------------- Make Finish\n\n"

emmake make install

printf "\n--------------------------------------------- Finish install\n\n"

cd ..

rm -R libgpg-error-1.39/

printf "\n--------------------------------------------- Libgcrypt\n\n"


wget https://gnupg.org/ftp/gcrypt/libgcrypt/libgcrypt-1.8.7.tar.bz2

tar -xf libgcrypt-1.8.7.tar.bz2

rm libgcrypt-1.8.7.tar.bz2

printf "\n--------------------------------------------- Download Finish Gcrypt\n\n"

cd libgcrypt-1.8.7

git init 

git apply ../libgcrypt.patch

emconfigure ./configure --prefix=$path/libs --sysconfdir=/etc --target=wasm64 --host=x86_64-unknown-linux-gnu --disable-asm --disable-doc --disable-jent-support --disable-neon-support --disable-arm-crypto-support  --disable-amd64-as-feature-detection --enable-static --enable-ciphers=" arcfour blowfish cast5 des aes twofish serpent rfc2268 seed camellia idea salsa20 chacha20" --with-gpg-error-prefix="$path/libs"

emmake make 

emmake make install

cd ..

rm -R libgcrypt-1.8.7/

printf "\n--------------------------------------------- Obliv C\n\n"

git clone https://github.com/Theldus/wsServer

cd wsServer/

git reset --hard 1fcd6605ababc821ebcc9dc60dd68b1c72233b5d

git apply ../ws-server.patch

make

make install

cd ..

rm -R wsServer/

printf "\n--------------------------------------------- Obliv C WASM Client\n\n"

git clone https://github.com/samee/obliv-c.git oblivc_wasm

cd oblivc_wasm/

git apply ../oblivc-wasm.patch

printf "\n--------------------------------------------- Git applied\n\n"

./configure

make install-local

printf "\n--------------------------------------------- Ocaml Installed\n\n"

emconfigure ./configure

emmake make oblivruntime

cd ..

printf "\n--------------------------------------------- Obliv C build\n\n"

printf "\n--------------------------------------------- Obliv C Server\n\n"

git clone https://github.com/samee/obliv-c.git oblivc_gcc

cd oblivc_gcc/

git apply ../oblivc-gcc.patch

./configure

make


