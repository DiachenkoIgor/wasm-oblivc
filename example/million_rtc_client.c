#include<stdio.h>
#include<obliv.h>
#include <time.h>
#include"million_rtc_client.h"


int main(int argc,char *argv[])
{
  ProtocolDesc pd;
  protocolIO io;
  io.mywealth = 2147483649;

  protocolUseWebRtc(&pd, true, "ws://127.0.0.1:10000", "stun:stun.l.google.com:19302","test",1);
      clock_t begin = clock();
  setCurrentParty(&pd,2);
  printf("%s\n", "connection established");
  execYaoProtocol(&pd,millionaire,&io);
  cleanupProtocol(&pd);
  fprintf(stderr,"Result: %d\n",io.cmp);
    clock_t end = clock();
    double time_spent = (double)(end - begin)* 1000.0 / CLOCKS_PER_SEC;
    printf("Overall Time - %f\n", time_spent);
  return 0;
}
