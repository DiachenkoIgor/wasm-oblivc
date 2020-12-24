#include<stdio.h>
#include<obliv.h>
#include"million.h"


int main(int argc,char *argv[])
{
  ProtocolDesc pd;
  protocolIO io;
  io.mywealth = 2147483646;

  const char *url = "ws://127.0.0.1:9000";
  protocolUseWebSocket(&pd, 9000, url, true);
  printf("%s\n", "connection established");
  setCurrentParty(&pd,2);
  execYaoProtocol(&pd,millionaire,&io);
  cleanupProtocol(&pd);
  printf("Result: %d\n",io.cmp);
  return 0;
}
