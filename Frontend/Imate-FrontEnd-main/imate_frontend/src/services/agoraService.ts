import AgoraRTC from "agora-rtc-sdk-ng";
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";

export interface AgoraConfig {
  appId: string;
  channel: string;
  token: string | null;
  uid: string | number;
}

class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private localScreenTrack: any = null;
  private localScreenAudioTrack: any = null;
  private isJoined = false;
  private isScreenSharing = false;

  initializeClient(): void {
    if (!this.client) {
      this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    }
  }

  setupEventListeners(
    onUserPublished: (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => void,
    onUserUnpublished: (user: IAgoraRTCRemoteUser, mediaType?: "audio" | "video" | "datachannel") => void
  ): void {
    if (!this.client) throw new Error("Client not initialized");

    this.client.on("user-published", async (user, mediaType) => {
      console.log(`ðŸ”µ Agora: user-published: uid=${user.uid}, mediaType=${mediaType}`);
      if (mediaType === "audio" || mediaType === "video") {
        try {
          await this.client!.subscribe(user, mediaType);
          console.log(`ðŸ”µ Agora: subscribed to ${mediaType} from user ${user.uid}`);
          onUserPublished(user, mediaType);
        } catch (err) {
          console.error(`âŒ Agora: Failed to subscribe to ${user.uid}:`, err);
        }
      }
    });

    this.client.on("user-unpublished", (user, mediaType) => {
      onUserUnpublished(user, mediaType);
    });

    this.client.on("user-left", (user) => {
      onUserUnpublished(user);
    });
  }

  removeAllListeners(): void {
    if (this.client) {
      this.client.removeAllListeners();
      console.log("ðŸ”µ All Agora listeners removed");
    }
  }

  getRemoteUsers(): IAgoraRTCRemoteUser[] {
    return this.client ? this.client.remoteUsers : [];
  }

  async joinChannel(config: AgoraConfig): Promise<void> {
    if (!this.client) throw new Error("Client not initialized");
    if (this.isJoined) return;

    await this.client.join(config.appId, config.channel, config.token, config.uid);
    this.isJoined = true;
  }

  async createLocalTracks(): Promise<void> {
    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
  }

  async publishLocalTracks(): Promise<void> {
    if (!this.client || !this.localAudioTrack || !this.localVideoTrack) {
      throw new Error("Client or tracks not ready");
    }
    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
  }

  playLocalVideo(container: HTMLElement): void {
    if (!this.localVideoTrack) throw new Error("Local video track not created");
    this.localVideoTrack.stop();
    this.localVideoTrack.play(container);
  }

  playRemoteVideo(user: IAgoraRTCRemoteUser, container: HTMLElement): void {
    if (user.videoTrack) user.videoTrack.play(container);
  }

  playRemoteAudio(user: IAgoraRTCRemoteUser): void {
    if (user.audioTrack) user.audioTrack.play();
  }

  async toggleAudio(mute: boolean): Promise<void> {
    if (!this.localAudioTrack) return;
    await this.localAudioTrack.setEnabled(!mute);
  }

  async toggleVideo(mute: boolean): Promise<void> {
    if (!this.localVideoTrack) return;
    await this.localVideoTrack.setEnabled(!mute);
  }

  async startScreenShare(enableSystemAudio = false, onTrackEnded?: () => void): Promise<void> {
    if (!this.client) throw new Error("Client not initialized");
    if (this.isScreenSharing) return;

    if (this.localVideoTrack) {
      await this.client.unpublish([this.localVideoTrack]);
    }

    this.localScreenTrack = await AgoraRTC.createScreenVideoTrack(
      { encoderConfig: "1080p_1", optimizationMode: "detail" },
      enableSystemAudio ? "auto" : "disable"
    );

    let videoTrack = this.localScreenTrack;
    let audioTrack: any = null;

    if (Array.isArray(this.localScreenTrack)) {
      videoTrack = this.localScreenTrack[0];
      audioTrack = this.localScreenTrack[1];
      this.localScreenAudioTrack = audioTrack;
    }

    this.localScreenTrack = videoTrack;
    const tracksToPublish = audioTrack ? [videoTrack, audioTrack] : [videoTrack];
    await this.client.publish(tracksToPublish);
    this.isScreenSharing = true;

    videoTrack.on("track-ended", async () => {
      await this.stopScreenShare();
      onTrackEnded?.();
    });
  }

  async stopScreenShare(): Promise<void> {
    if (!this.client || !this.isScreenSharing) return;

    const tracksToUnpublish = this.localScreenAudioTrack
      ? [this.localScreenTrack, this.localScreenAudioTrack]
      : [this.localScreenTrack];

    await this.client.unpublish(tracksToUnpublish);

    if (this.localScreenTrack) {
      this.localScreenTrack.close();
      this.localScreenTrack = null;
    }
    if (this.localScreenAudioTrack) {
      this.localScreenAudioTrack.close();
      this.localScreenAudioTrack = null;
    }

    this.isScreenSharing = false;

    if (this.localVideoTrack) {
      await this.client.publish([this.localVideoTrack]);
    }
  }

  playLocalScreenVideo(container: HTMLElement): void {
    if (!this.localScreenTrack) throw new Error("Local screen track not created");
    this.localScreenTrack.play(container);
  }

  async leaveChannel(): Promise<void> {
    if (!this.client) return;

    if (this.isScreenSharing) await this.stopScreenShare();

    if (this.localAudioTrack) { this.localAudioTrack.close(); this.localAudioTrack = null; }
    if (this.localVideoTrack) { this.localVideoTrack.close(); this.localVideoTrack = null; }

    if (this.isJoined) {
      await this.client.leave();
      this.isJoined = false;
    }
  }

  getIsJoined(): boolean { return this.isJoined; }
  getIsScreenSharing(): boolean { return this.isScreenSharing; }
}

export const agoraService = new AgoraService();
export default agoraService;
