interface RTCIceServer {
  urls: string | string[];
}

interface RTCConfiguration {
  iceServers?: RTCIceServer[];
}

interface MediaConstraints {
  optional: { RtpDataChannels: boolean }[];
}

interface RTCPeerConnectionIceEvent {
  candidate: RTCIceCandidate | null;
}

export const getIP = (callback: (ip: string) => void): void => {
  const ip_dups: { [key: string]: boolean } = {};
  const RTCPeerConnection = window.RTCPeerConnection;

  const mediaConstraints: MediaConstraints = {
    optional: [{ RtpDataChannels: true }]
  };

  const servers: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.services.mozilla.com" },
      { urls: "stun:stun.l.google.com:19302" }
    ]
  };

  const pc = new RTCPeerConnection(servers);

  const handleCandidate = (candidate: string): void => {
    const ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
    const hasIp = ip_regex.exec(candidate);
    if (hasIp) {
      const ip_addr = hasIp[1];
      if (ip_dups[ip_addr] === undefined) {
        callback(ip_addr);
      }
      ip_dups[ip_addr] = true;
    }
  };

  pc.onicecandidate = (ice: RTCPeerConnectionIceEvent) => {
    if (ice.candidate) {
      handleCandidate(ice.candidate.candidate);
    }
  };

  pc.createDataChannel("");

  pc.createOffer()
    .then((result: RTCSessionDescriptionInit) => {
      pc.setLocalDescription(result);
    })
    .catch(() => { });

  setTimeout(() => {
    const sdp = pc.localDescription?.sdp;
    if (sdp) {
      const lines = sdp.split('\n');
      lines.forEach((line: string) => {
        if (line.indexOf('a=candidate:') === 0) {
          handleCandidate(line);
        }
      });
    }
  }, 1000);
};