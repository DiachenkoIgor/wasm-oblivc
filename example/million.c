#include<stdio.h>
#include<obliv.h>

#include"million.h"


int main(int argc,char *argv[])
{
  ProtocolDesc pd;
  protocolIO io;
  io.mywealth = 2147483646;

  protocolUseWebSocket(&pd, 9000, NULL, false);
  setCurrentParty(&pd,1);
  printf("%s\n", "connection established");
  execYaoProtocol(&pd,millionaire,&io);
  cleanupProtocol(&pd);
  fprintf(stderr,"Result: %d\n",io.cmp);
  return 0;
}
