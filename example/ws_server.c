#include <stdio.h>
#include <pthread.h>
#include <stdlib.h>
#include <unistd.h>
#include <ws.h>

static volatile pthread_t client_thread;
static pthread_cond_t ws_sync_var = PTHREAD_COND_INITIALIZER;
static volatile pthread_mutex_t server_lock;

static volatile int server_fd = 0;
static volatile int client_fd = 0;

void onopen_client(int fd)
{
printf("Connection opened Client\n");

    pthread_mutex_lock(&server_lock);

    client_fd = fd;

    pthread_cond_signal(&ws_sync_var);

    pthread_mutex_unlock(&server_lock);
}

/**
 * @brief This function is called whenever a connection is closed.
 * @param fd The client file descriptor.
 */
void onclose_client(int fd)
{
    char *cli;
    cli = ws_getaddress(fd);
    printf("Connection closed, client: %d | addr: %s\n", fd, cli);
    free(cli);
}

/**
 * @brief Message events goes here.
 * @param fd   Client file descriptor.
 * @param msg  Message content.
 * @param size Message size.
 * @param type Message type.
 */
void onmessage_client(int fd, const unsigned char *msg, size_t size, int type)
{
    char *cli;
    cli = ws_getaddress(fd);
    printf("I receive a message Client: %s (%zu), from: %s/%d\n", msg,
        size, cli, fd);

    ws_sendframe_txt(server_fd, msg, false);

    free(cli);
}

void *run_client(void *x_void_ptr)
{
    /* Register events. */
    struct ws_events evs;
    evs.onopen    = &onopen_client;
    evs.onclose   = &onclose_client;
    evs.onmessage = &onmessage_client;

    /* Main loop, this function never returns. */
    ws_socket(&evs, 10000);

    return (0);
}


/**
 * @brief This function is called whenever a new connection is opened.
 * @param fd The new client file descriptor.
 */
void onopen(int fd)
{
    printf("Connection opened Server\n");

    pthread_mutex_lock(&server_lock);

    server_fd = fd;

    pthread_create(&client_thread, NULL, run_client, NULL);

    pthread_cond_wait(&ws_sync_var, &server_lock);

    pthread_mutex_unlock(&server_lock);

    printf("Connection opened Unlock\n");

}

/**
 * @brief This function is called whenever a connection is closed.
 * @param fd The client file descriptor.
 */
void onclose(int fd)
{
    char *cli;
    cli = ws_getaddress(fd);
    printf("Connection closed, client: %d | addr: %s\n", fd, cli);
    free(cli);
}

/**
 * @brief Message events goes here.
 * @param fd   Client file descriptor.
 * @param msg  Message content.
 * @param size Message size.
 * @param type Message type.
 */
void onmessage(int fd, const unsigned char *msg, size_t size, int type)
{
    char *cli;
    cli = ws_getaddress(fd);
    printf("I receive a message: %s (%zu), from: %s/%d\n", msg,
        size, cli, fd);



    ws_sendframe_txt(client_fd, msg, false);


printf("I have send\n");
    free(cli);
}

int main()
{
    /* Register events. */
    struct ws_events evs;
    evs.onopen    = &onopen;
    evs.onclose   = &onclose;
    evs.onmessage = &onmessage;

    /* Main loop, this function never returns. */
    ws_socket(&evs, 8080);

    return (0);
}