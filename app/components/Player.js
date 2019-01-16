// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { clamp, transform, debounce } from 'lodash';
import keycode from 'keycode';

import Controls from 'components/PlayerControls';
import Subtitles from 'components/PlayerSubtitles';
import { resolveSubtitles, loadSubtitles } from 'utils/subtitles';

const { remote } = require('electron');

type Props = {
  src: string
};

const Wrapper = styled.div`
  position: relative;
  background: black;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Video = styled.video`
  display: block;
  width: 100vw;
  height: 100vh;
`;

const Inner = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const ControlsWrapper = styled.div`
  padding: 0 16px 2px;
  display: ${p => (p.show ? 'block' : 'none')};
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );

  :hover {
    display: block;
  }
`;

const SubtitlesWrapper = styled.div`
  padding: 24px;
  margin-bottom: 3vh;
`;

export default class Player extends Component<Props> {
  state = {
    currentTime: 0,
    duration: 0,
    playing: false,
    seeking: false,
    subtitles: null,
    showControls: true,
    fullScreen: false
  };

  componentDidMount() {
    const {
      video,
      wrapper,
      props: { src }
    } = this;

    window.addEventListener('keydown', this.handleKeydownEvent, false);

    video.addEventListener('loadeddata', this.handleLoadedData, false);
    video.addEventListener('timeupdate', this.handleTimeUpdateEvent, false);
    video.addEventListener(
      'durationchange',
      this.handleDurationChangeEvent,
      false
    );
    video.addEventListener('playing', this.handlePlayEvent, false);
    video.addEventListener('pause', this.handlePauseEvent, false);
    video.addEventListener('seeked', this.handleSeekEvent, false);
    video.addEventListener('seeking', this.handleSeekEvent, false);
    video.addEventListener('click', this.handeleClickEvent, false);
    video.addEventListener('dblclick', this.handeleDoubleClickEvent, false);

    wrapper.addEventListener('mousemove', this.handleMouseMoveEvent, false);

    this.win = remote.getCurrentWindow();
    this.win.on('enter-full-screen', this.handleEnterFullScreenEvent);
    this.win.on('leave-full-screen', this.handleLeaveFullScreenEvent);

    this.load(src);
  }

  componentDidUpdate(prevProps) {
    const { src } = this.props;

    if (prevProps.src !== src) {
      this.load(src);
    }
  }

  componentWillUnmount() {
    const { video, wrapper } = this;

    window.removeEventListener('keydown', this.handleKeydownEvent);

    video.removeEventListener('loadeddata', this.handleLoadedData);
    video.removeEventListener('timeupdate', this.handleTimeUpdateEvent);
    video.removeEventListener('durationchange', this.handleDurationChangeEvent);
    video.removeEventListener('play', this.handlePlayEvent);
    video.removeEventListener('pause', this.handlePauseEvent);
    video.removeEventListener('seeked', this.handleSeekEvent);
    video.removeEventListener('seeking', this.handleSeekEvent);
    video.removeEventListener('click', this.handeleClickEvent, false);
    video.removeEventListener('dblclick', this.handeleDoubleClickEvent, false);

    wrapper.removeEventListener('mousemove', this.handleMouseMoveEvent);

    this.audioContext.close();
  }

  audioContext = null;

  source = null;

  gain = null;

  handleLoadedData = () => {
    const { videoWidth, videoHeight } = this.video;
    const {
      window: { width, height }
    } = window;

    const videoRatio = videoWidth / videoHeight;
    const screenRatio = width / height;

    let resizeToWidth;
    let resizeToHeight;

    if (videoRatio >= screenRatio) {
      resizeToWidth = Math.min(videoWidth, width);
      resizeToHeight = resizeToWidth / videoRatio;
    } else {
      resizeToHeight = Math.min(videoHeight, height);
      resizeToWidth = resizeToHeight * videoRatio;
    }

    // window.resizeTo(resizeToWidth, resizeToHeight);

    this.video.play();
  };

  handleTimeUpdateEvent = () => {
    const { seeking } = this.state;

    if (!seeking) {
      this.setState(() => ({ currentTime: this.video.currentTime }));
    }
  };

  handleDurationChangeEvent = () => {
    this.setState(() => ({ duration: this.video.duration }));
  };

  handlePlayEvent = () => {
    this.setState(() => ({ playing: true }));
    this.hideControls();
  };

  handlePauseEvent = () => {
    this.setState(() => ({ playing: false, showControls: true }));
  };

  handleSeekEvent = () => {
    this.setState(() => ({ currentTime: this.video.currentTime }));
  };

  handleKeydownEvent = event => {
    const { playing } = this.state;
    const code = keycode(event);

    switch (code) {
      case 'esc':
        this.handleLeaveFullScreen();
        break;
      case 'space':
        this.handleTogglePlay();
        break;
      case 'left':
        if (playing) {
          this.video.pause();
          this.seekToPreviousActiveCue();
        } else {
          this.seekToPreviousCue();
        }
        break;
      case 'right':
        this.seekToNextCue();
        this.video.pause();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        this.gain.gain.value = parseInt(code, 10);
        break;
      default:
    }
  };

  handleMouseMoveEvent = () => {
    const { showControls } = this.state;

    if (showControls) {
      return;
    }

    this.setState(() => ({ showControls: true }), this.hideControls);
  };

  handeleClickEvent = () => {
    this.handleTogglePlay();
  };

  handeleDoubleClickEvent = () => {
    this.playPause.cancel();
    this.handleToggleFullScreen();
  };

  handleEnterFullScreenEvent = () => {
    this.setState(() => ({ fullScreen: true }));
  };

  handleLeaveFullScreenEvent = () => {
    this.setState(() => ({ fullScreen: false }));
  };

  handleTogglePlay = () => {
    this.playPause(this.video.paused);
  };

  handleJump = (step = 0) => {
    this.seekTo(this.video.currentTime + step);
  };

  handleSeek = time => {
    const { seeking } = this.state;

    if (seeking) {
      this.setState({ currentTime: time });
    } else {
      this.seekTo(time);
    }
  };

  handleSeekStart = () => {
    this.setState({ seeking: true });
  };

  handleSeekEnd = () => {
    const { currentTime } = this.state;

    this.setState({ seeking: false }, () => {
      this.seekTo(currentTime);
    });
  };

  handleToggleFullScreen = () => {
    const { fullScreen } = this.state;

    this.win.setFullScreen(!fullScreen);
  };

  handleEnterFullScreen = () => {
    const { fullScreen } = this.state;

    if (fullScreen) {
      this.win.setFullScreen(true);
    }
  };

  handleLeaveFullScreen = () => {
    const { fullScreen } = this.state;

    if (fullScreen) {
      this.win.setFullScreen(false);
    }
  };

  seekTo(time) {
    const currentTime = clamp(time, 0, this.video.duration);
    this.video.currentTime = currentTime;
  }

  getActiveCueIndex() {
    const { subtitles, currentTime } = this.state;

    return subtitles.findIndex(
      cue => cue.startTime <= currentTime && currentTime <= cue.endTime
    );
  }

  getPreviousActiveCueIndex() {
    const { subtitles, currentTime } = this.state;

    return transform(
      subtitles,
      (result, { startTime, endTime }, index) => {
        /* eslint-disable no-param-reassign */
        if (startTime <= currentTime + 0.1 && currentTime + 0.1 <= endTime) {
          result[0] = index;
          return false;
        }

        if (currentTime < startTime) {
          result[0] = Math.max(-1, index - 1);
          return false;
        }

        return true;
      },
      [-1]
    )[0];
  }

  seekToCue(until) {
    const { subtitles } = this.state;
    const index = this.getPreviousActiveCueIndex();

    const cue = subtitles[clamp(index + until, 0, subtitles.length - 1)];

    this.seekTo(cue.startTime);
  }

  seekToPreviousActiveCue() {
    this.seekToCue(0);
  }

  seekToPreviousCue() {
    if (this.getActiveCueIndex() > -1) {
      this.seekToCue(-1);
    } else {
      this.seekToCue(0);
    }
  }

  seekToNextCue() {
    this.seekToCue(1);
  }

  async load(src) {
    this.video.src = src;
    this.video.volume = 1;

    if (this.audioContext === null) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      this.source = this.audioContext.createMediaElementSource(this.video);

      this.gain = this.audioContext.createGain();
      this.gain.connect(this.audioContext.destination);

      this.source.connect(this.gain);
    }

    const subtitlesPath = resolveSubtitles(src);

    if (subtitlesPath) {
      this.loadSubtitles(subtitlesPath);
    }
  }

  loadSubtitles(path) {
    const subtitles = loadSubtitles(path);

    if (subtitles) {
      this.setState({ subtitles });
    }
  }

  hideControls = debounce(
    () => this.setState(() => ({ showControls: false })),
    3000,
    { leading: false }
  );

  playPause = debounce(play => {
    if (play) this.video.play();
    else this.video.pause();
  }, 250);

  render() {
    const {
      currentTime,
      duration,
      playing,
      subtitles,
      showControls,
      fullScreen
    } = this.state;

    return (
      <Wrapper
        ref={ref => {
          this.wrapper = ref;
        }}
      >
        <Video
          ref={elt => {
            this.video = elt;
          }}
          muted="muted"
        />

        <Inner>
          {subtitles && (
            <SubtitlesWrapper>
              <Subtitles subtitles={subtitles} currentTime={currentTime} />
            </SubtitlesWrapper>
          )}

          <ControlsWrapper show={showControls || !playing}>
            <Controls
              currentTime={currentTime}
              duration={duration}
              playing={playing}
              fullScreen={fullScreen}
              onTogglePlay={this.handleTogglePlay}
              onJump={this.handleJump}
              onSeek={this.handleSeek}
              onSeekStart={this.handleSeekStart}
              onSeekEnd={this.handleSeekEnd}
              onToggleFullScreen={this.handleToggleFullScreen}
            />
          </ControlsWrapper>
        </Inner>
      </Wrapper>
    );
  }
}
