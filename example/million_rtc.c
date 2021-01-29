#include<stdio.h>
#include<obliv.h>

#include"million_rtc.h"


int main(int argc,char *argv[])
{
  ProtocolDesc pd;
  protocolIO io;
  io.mywealth = 2147483646;

  protocolUseWebRtc(&pd, false, "ws://127.0.0.1:8080", "stun:stun.l.google.com:19302","test",1);
  setCurrentParty(&pd,1);
  printf("%s\n", "connection established");
  execYaoProtocol(&pd,millionaire,&io);
  cleanupProtocol(&pd);
  fprintf(stderr,"Result: %d\n",io.cmp);
  return 0;
}
