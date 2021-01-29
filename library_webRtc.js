mergeInto(LibraryManager.library, {

  $Channels: {
      dataChannels: [],
      onmessage_time :0,
      send_time:0,
      logging_time:0,
      peers: [],
      iceCandidates: [],
      dataEvent: null,
      signal: null,
      onopen_cb: null,
      onclose_cb: null,
      onerror_cb: null,
      onmessage_cb: null,
      dataChannelName: null,
      isLogged: null,
      dataChannelCallbacks: function(dc){
        dc.addEventListener('open', this.onopen_cb);
        dc.addEventListener('close', this.onclose_cb);
        dc.addEventListener('error', this.onerror_cb);
        dc.addEventListener('message', this.onmessage_cb);
      },
      addOnMessageListener: function(func){
        if(this.signal == null) {
          console.error("Not initialized signal mechanism");
          return;
        }

        this.signal.addEventListener('message', ev => {
          var event = {};
          event.data = JSON.parse(ev.data);
          func(event);
        });
      },

      sendData: function(data){
        if(this.signal == null) {
          console.error("Not initialized signal mechanism");
          return;
        }

        var message = null;

        if(typeof data === 'object' && data !== null) message = JSON.stringify(data);
        else message = data;

        this.signal.send(message);
      },

      log: function(message){
        //if(this.isLogged == 1) console.error(message);
      },

      addIceCandidate: function(iceCandidate){

        this.iceCandidates.push(iceCandidate);
      },
      sendIceCandidates: function(){

        for (let step = 0; step < this.iceCandidates.length; step++) {
            this.sendData(this.iceCandidates[step]);
        }
      },

    },

  emscripten_broadcast_signal_initialize__deps: ['$Channels'],
  emscripten_broadcast_signal_initialize__proxy: 'sync',
  emscripten_broadcast_signal_initialize__sig: 'vi',
  emscripten_broadcast_signal_initialize: function(name) {

    Channels.signal = new WebSocket(UTF8ToString(name));

  },

  emscripten_data_channel_new__deps: ['$Channels'],
  emscripten_data_channel_new__proxy: 'sync',
  emscripten_data_channel_new__sig: 'ii',
  emscripten_data_channel_new: function(createAttributes) {
    if (!window.RTCPeerConnection.prototype.createDataChannel) {
      console.error('emscripten_data_channel_new(): WebRTC DataChannel API is not supported by current browser)');
      return {{{ cDefine('EMSCRIPTEN_RESULT_NOT_SUPPORTED') }}};
    }

    if (!createAttributes) {
        console.error('emscripten_data_channel_new(): Missing required "createAttributes" function parameter!');
        return {{{ cDefine('EMSCRIPTEN_RESULT_INVALID_PARAM') }}};
    }

    var createAttrs = createAttributes>>2;
    var turn_urls = UTF8ToString(HEAP32[createAttrs]).split(',');

  const configuration = {'iceServers': [{'urls': turn_urls}]};
  const peerConnection = new RTCPeerConnection(configuration);

  Channels.dataChannelName = UTF8ToString(HEAP32[createAttrs + 1]);

  Channels.isLogged = HEAP32[createAttrs+2];
  var id = Channels.dataChannels.length;
  Channels.peers[id] = peerConnection;

  
  Channels.log('emscripten_data_channel_new(turn_urls='+turn_urls+', data_channel_name=' + Channels.dataChannelName + '): created Data Channel ID ' + id + ')');
  

  return id;
  },

  emscripten_data_channel_set_onopen__deps: ['$Channels'],
  emscripten_data_channel_set_onopen__proxy: 'sync',
  emscripten_data_channel_set_onopen__sig: 'iii',
  emscripten_data_channel_set_onopen: function(dataChannelId, callbackFunc) {

    if (!Channels.dataEvent) Channels.dataEvent = _malloc(1024);

    var dataChannel = Channels.peers[dataChannelId];
    if (!dataChannel) {
  
      Channels.log('emscripten_data_channel_set_onopen(): Invalid dataChannelId ' + dataChannelId + ' specified!');
  
      return {{{ cDefine('EMSCRIPTEN_RESULT_INVALID_TARGET') }}};
    }


    Channels.log('emscripten_data_channel_set_onopen(dataChannelId='+dataChannelId+',callbackFunc='+callbackFunc+')');

    Channels.onopen_cb = function(e) {

      Channels.log('dataChannel event "open": dataChannelId='+dataChannelId+',callbackFunc='+callbackFunc+')');

      HEAPU32[Channels.dataEvent>>2] = dataChannelId;
      {{{ makeDynCall('ii', 'callbackFunc') }}}(Channels.dataEvent);
    };
    return {{{ cDefine('EMSCRIPTEN_RESULT_SUCCESS') }}};
  },

  emscripten_data_channel_set_onerror__deps: ['$Channels'],
  emscripten_data_channel_set_onerror__proxy: 'sync',
  emscripten_data_channel_set_onerror__sig: 'iii',
  emscripten_data_channel_set_onerror: function(dataChannelId, callbackFunc) {
  if (!Channels.dataEvent) Channels.dataEvent = _malloc(1024);

    var dataChannel = Channels.peers[dataChannelId];
    if (!dataChannel) {
  
      Channels.log('emscripten_data_channel_set_onopen(): Invalid dataChannelId ' + dataChannelId + ' specified!');
  
      return {{{ cDefine('EMSCRIPTEN_RESULT_INVALID_TARGET') }}};
    }


    Channels.log('emscripten_data_channel_set_onerror(dataChannelId='+dataChannelId+',callbackFunc='+callbackFunc+')');

    Channels.onerror_cb  = function(e) {

      Channels.log('data_channel event "error": dataChannelId='+dataChannelId+',callbackFunc='+callbackFunc+', message='+ e.message +')');

      HEAPU32[Channels.dataEvent>>2] = dataChannelId;
      {{{ makeDynCall('ii', 'callbackFunc') }}}(Channels.dataEvent);
    }
    return {{{ cDefine('EMSCRIPTEN_RESULT_SUCCESS') }}};
  },

  emscripten_data_channel_set_onclose__deps: ['$Channels'],
  emscripten_data_channel_set_onclose__proxy: 'sync',
  emscripten_data_channel_set_onclose__sig: 'iii',
  emscripten_data_channel_set_onclose: function(dataChannelId, callbackFunc) {
  if (!Channels.dataEvent) Channels.dataEvent = _malloc(1024);

    var dataChannel = Channels.peers[dataChannelId];
    if (!dataChannel) {
  
      Channels.log('emscripten_data_channel_set_onclose(): Invalid dataChannelId ' + dataChannelId + ' specified!');
  
      return {{{ cDefine('EMSCRIPTEN_RESULT_INVALID_TARGET') }}};
    }


    Channels.log('emscripten_data_channel_set_onclose(dataChannelId='+dataChannelId+',callbackFunc='+callbackFunc+')');

    Channels.onclose_cb = function(e) {

      Channels.log('data_channel event "onclose": dataChannelId='+dataChannelId+',callbackFunc='+callbackFunc +')');

      HEAPU32[Channels.dataEvent>>2] = dataChannelId;
      {{{ makeDynCall('ii', 'callbackFunc') }}}(Channels.dataEvent);
    }
    return {{{ cDefine('EMSCRIPTEN_RESULT_SUCCESS') }}};
  },
  emscripten_data_channel_set_onmessage__deps: ['$Channels'],
  emscripten_data_channel_set_onmessage__proxy: 'sync',
  emscripten_data_channel_set_onmessage__sig: 'iiiii',
  emscripten_data_channel_set_onmessage: function(dataChannelId, callbackFunc) {

    if (!Channels.dataEvent) Channels.dataEvent = _malloc(1024);

    var dataChannel = Channels.peers[dataChannelId];

    if (!dataChannel) {
  
      Channels.log('emscripten_data_channel_set_onmessage(): Invalid dataChannelId ' + dataChannelId + ' specified!');
  
      return {{{ cDefine('EMSCRIPTEN_RESULT_INVALID_TARGET') }}};
    }

    Channels.log('emscripten_data_channel_set_onmessage(dataChannelId='+dataChannelId+',callbackFunc='+callbackFunc+')');


    Channels.onmessage_cb = function(e) {
        var t0 = performance.now();
        Channels.log('data_channel event "message": dataChannelId='+dataChannelId+',callbackFunc='+callbackFunc+')');

      HEAPU32[Channels.dataEvent>>2] = dataChannelId;
      if (typeof e.data === 'string') {
        var len = lengthBytesUTF8(e.data)+1;
        var buf = _malloc(len);
        stringToUTF8(e.data, buf, len);
    
        var s = (e.data.length < 256) ? e.data : (e.data.substr(0, 256) + ' (' + (e.data.length-256) + ' more characters)');
        Channels.log('data_channel onmessage, received data: "' + e.data + '", ' + e.data.length + ' chars, ' + len + ' bytes encoded as UTF-8: "' + s + '"');
    
        HEAPU32[(Channels.dataEvent+12)>>2] = 1; // text data
      } else {
        if( e.data instanceof Blob){ 
          var t2 = performance.now();
          e.data.arrayBuffer().then(buffer => {

            var len = buffer.byteLength;
            var buf = _malloc(len);
            HEAP8.set(new Uint8Array(buffer), buf);

             var s = 'data_channel onmessage, received data: ' + len + ' bytes of binary:';
              for(var i = 0; i < Math.min(len, 256); ++i) s += ' ' + HEAPU8[buf+i].toString(16);
              s += ', "';
              for(var i = 0; i < Math.min(len, 256); ++i) s += (HEAPU8[buf+i] >= 32 && HEAPU8[buf+i] <= 127) ? String.fromCharCode(HEAPU8[buf+i]) : '\uFFFD';
              s += '"';
              if (len > 256) s + ' ... (' + (len - 256) + ' more bytes)';

              Channels.log(s);

            HEAPU32[(Channels.dataEvent+12)>>2] = 0;

            HEAPU32[(Channels.dataEvent+4)>>2] = buf;
            HEAPU32[(Channels.dataEvent+8)>>2] = len;
            var t3 = performance.now();
            //console.error("onmessage_cb Blob to ArrayBuffer  " + (t3 - t2) + " milliseconds.");
            {{{ makeDynCall('ii', 'callbackFunc') }}}(Channels.dataEvent);
            _free(buf);
          });
          return {{{ cDefine('EMSCRIPTEN_RESULT_SUCCESS') }}};
        }
        var t4 = performance.now();
        var len = e.data.byteLength;
        var buf = _malloc(len);
        HEAP8.set(new Uint8Array(e.data), buf);
    
/*        var s = 'data_channel onmessage, received data: ' + len + ' bytes of binary:';
        for(var i = 0; i < Math.min(len, 256); ++i) s += ' ' + HEAPU8[buf+i].toString(16);
        s += ', "';
        for(var i = 0; i < Math.min(len, 256); ++i) s += (HEAPU8[buf+i] >= 32 && HEAPU8[buf+i] <= 127) ? String.fromCharCode(HEAPU8[buf+i]) : '\uFFFD';
        s += '"';
        if (len > 256) s + ' ... (' + (len - 256) + ' more bytes)';

        Channels.log(s);*/
                var t5 = performance.now();

                Channels.logging_time += (t5 - t4);
        //console.error("onmessage_cb logging  " + (t5 - t4) + " milliseconds.");
    
        HEAPU32[(Channels.dataEvent+12)>>2] = 0; // binary data
      }
      var t6 = performance.now();
      HEAPU32[(Channels.dataEvent+4)>>2] = buf;
      HEAPU32[(Channels.dataEvent+8)>>2] = len;
      {{{ makeDynCall('ii', 'callbackFunc') }}}(Channels.dataEvent);
      _free(buf);

                      var t7 = performance.now();
                      Channels.onmessage_time += (t7 - t6);
        //console.error("onmessage_cb dynamic function call  " + (t7 - t6) + " milliseconds.");

    }
    return {{{ cDefine('EMSCRIPTEN_RESULT_SUCCESS') }}};
  },

  emscripten_data_channel_connect__deps: ['$Channels'],
  emscripten_data_channel_connect__proxy: 'sync',
  emscripten_data_channel_connect__sig: 'vi',
  emscripten_data_channel_connect: function(dataChannelId) {


    var peerConnection = Channels.peers[dataChannelId];
    var dataChannel =  peerConnection.createDataChannel(Channels.dataChannelName);
    Channels.dataChannels[dataChannelId] = dataChannel;

    var iceCandidates = [];

    if (!dataChannel) {
  
      Channels.log('emscripten_data_channel_set_onmessage(): Invalid dataChannelId ' + dataChannelId + ' specified!');
  
      return {{{ cDefine('EMSCRIPTEN_RESULT_INVALID_TARGET') }}};
    }

    Channels.dataChannelCallbacks(dataChannel);

  const obj = {
        answer: false,
        ice: false,
        trigger: function (cb) {

          this.answer && this.ice && cb();
        }
    }

    Channels.addOnMessageListener(ev => {

      
          Channels.log('emscripten_data_channel_connect(): On message receive: ' + ev.data + '\n');
    

      if (ev.data.answer) {
        const remoteDesc = new RTCSessionDescription(ev.data.answer);
        peerConnection.setRemoteDescription(remoteDesc);
        obj.answer = true;
        obj.trigger( () => {Channels.sendIceCandidates()});
      }

      if (ev.data.iceCandidate) {
          try {
              peerConnection.addIceCandidate(ev.data.iceCandidate);
          } catch (e) {
              console.error('Error adding received ice candidate', e);
          }
      }
  });

  peerConnection.addEventListener('icecandidate', event => {
    
      if (event.candidate) {
         Channels.addIceCandidate({'iceCandidate': JSON.parse(JSON.stringify(event.candidate))});
      }else {
          obj.ice = true;
          obj.trigger(() => {Channels.sendIceCandidates()});
      }
  });

  peerConnection.addEventListener('connectionstatechange', event => {

          if (peerConnection.connectionState === 'connected') {
              Channels.log('emscripten_data_channel_connect(): On connectionstatechange successful!\n');
          }
          if (peerConnection.connectionState === 'failed') {
              Channels.log('PEER CONNECTION FAILED\n');
          }
    
  });

  peerConnection.createOffer().then(function (offer) {
             return peerConnection.setLocalDescription(offer);
         }).then(function () {
          Channels.sendData({'offer': JSON.parse(JSON.stringify(peerConnection.localDescription))});
         });

  },

  emscripten_data_channel_listen__deps: ['$Channels'],
  emscripten_data_channel_listen__proxy: 'sync',
  emscripten_data_channel_listen__sig: 'vi',
  emscripten_data_channel_listen: function(dataChannelId) {

    var peerConnection = Channels.peers[dataChannelId];
    if (!peerConnection) {
  
      Channels.log('emscripten_data_channel_listen(): Invalid dataChannelId ' + dataChannelId + ' specified!');
  
      return {{{ cDefine('EMSCRIPTEN_RESULT_INVALID_TARGET') }}};
    }

    const obj = {
        answer: false,
        ice: false,
        trigger: function (cb) {
          this.answer && this.ice && cb();
        }
    }

    Channels.addOnMessageListener(ev => {
    
    
      if (ev.data.offer) {
          peerConnection.setRemoteDescription(new RTCSessionDescription(ev.data.offer))
                .then(function () { return peerConnection.createAnswer(); })
                .then(function (answer) {
                  return peerConnection.setLocalDescription(answer);
              })
                .then(function () {
                    Channels.sendData({'answer': JSON.parse(JSON.stringify(peerConnection.localDescription))});
                });
      }

      if (ev.data.iceCandidate) {
          try {
              peerConnection.addIceCandidate(ev.data.iceCandidate);
              obj.answer = true;
              obj.trigger(() => {Channels.sendIceCandidates()});
          } catch (e) {
              console.error('Error adding received ice candidate', e);
          }
      }
  });

      peerConnection.addEventListener('icecandidate', event => {
      
          Channels.log('emscripten_data_channel_listen(): On icecandidate : ' + event.candidate + '\n');
    
      if (event.candidate) {
         Channels.addIceCandidate({'iceCandidate': JSON.parse(JSON.stringify(event.candidate))});
      }else {
         obj.ice = true;
         obj.trigger(() => {Channels.sendIceCandidates()});
      }
  });

  peerConnection.ondatachannel = function (event) {
        Channels.dataChannels[dataChannelId] = event.channel;
        Channels.dataChannelCallbacks(event.channel);
    };

  },

  emscripten_data_channel_send_binary__deps: ['$Channels'],
  emscripten_data_channel_send_binary__proxy: 'sync',
  emscripten_data_channel_send_binary__sig: 'iiii',
  emscripten_data_channel_send_binary: function(dataChannelId, binaryData, dataLength) {

    var t0 = performance.now();

    var dataChannel = Channels.dataChannels[dataChannelId];
    var peerConnection = Channels.peers[dataChannelId];
    if (!dataChannel) {
      
      Channels.log('emscripten_data_channel_send_binary(): Invalid dataChannelId ' + dataChannelId + ' specified!');
      
      return {{{ cDefine('EMSCRIPTEN_RESULT_INVALID_TARGET') }}};
    }

    
/*    var s = 'data: ' + dataLength + ' bytes of binary:';
    for(var i = 0; i < Math.min(dataLength, 256); ++i) s += ' '+ HEAPU8[binaryData+i].toString(16);
    s += ', "';
    for(var i = 0; i < Math.min(dataLength, 256); ++i) s += (HEAPU8[binaryData+i] >= 32 && HEAPU8[binaryData+i] <= 127) ? String.fromCharCode(HEAPU8[binaryData+i]) : '\uFFFD';
    s += '"';
    if (dataLength > 256) s + ' ... (' + (dataLength - 256) + ' more bytes)';

    Channels.log('emscripten_websocket_send_binary(dataChannelId='+dataChannelId+',binaryData='+binaryData+ ',dataLength='+dataLength+'), ' + s);
    */
    // TODO: This is temporary to cast a shared Uint8Array to a non-shared Uint8Array. This could be removed if WebSocket API is improved
    // to allow passing in views to SharedArrayBuffers
    var t2 = performance.now();
    dataChannel.send(new Uint8Array({{{ makeHEAPView('U8', 'binaryData', 'binaryData+dataLength') }}}));


    var t1 = performance.now();
    Channels.send_time += (t1 - t0);
        //console.error("send_binary send RTCDataChannel  " + (t1 - t2) + " milliseconds.");
    //console.error("send_binary overall  " + (t1 - t0) + " milliseconds.");
    return {{{ cDefine('EMSCRIPTEN_RESULT_SUCCESS') }}};
  },

  emscripten_data_channel_deinitialize__deps: ['$Channels'],
  emscripten_data_channel_deinitialize__proxy: 'sync',
  emscripten_data_channel_deinitialize__sig: 'vi',
  emscripten_data_channel_deinitialize: function(dataChannelId) {

    var dataChannel = Channels.dataChannels[dataChannelId];
    var peerConnection = Channels.peers[dataChannelId];
    if (!dataChannel) {
  
      Channels.log('emscripten_data_channel_deinitialize(): Invalid dataChannelId ' + dataChannelId + ' specified!');

      return {{{ cDefine('EMSCRIPTEN_RESULT_INVALID_TARGET') }}};
    }

    dataChannel.close();
    peerConnection.close();

    if (Channels.dataEvent) _free(Channels.dataEvent);

    delete Channels.dataChannels[dataChannelId];
    delete Channels.peers[dataChannelId];
    delete Channels.dataEvent;

    if(Channels.peers.length == 0) {
      signal.close();
      delete Channels.signal;
    }

  }

});