// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { noop } from 'lodash';
import { rem } from 'polished';

import PlayIcon from 'material-design-icons/av/svg/production/ic_play_arrow_48px.svg';
import PauseIcon from 'material-design-icons/av/svg/production/ic_pause_48px.svg';

import Replay5Icon from 'material-design-icons/av/svg/production/ic_replay_5_48px.svg';
import Replay10Icon from 'material-design-icons/av/svg/production/ic_replay_10_48px.svg';
import Replay30Icon from 'material-design-icons/av/svg/production/ic_replay_30_48px.svg';
import Forward5Icon from 'material-design-icons/av/svg/production/ic_forward_5_48px.svg';
import Forward10Icon from 'material-design-icons/av/svg/production/ic_forward_10_48px.svg';
import Forward30Icon from 'material-design-icons/av/svg/production/ic_forward_30_48px.svg';

import VolumeUp from 'material-design-icons/av/svg/production/ic_volume_up_48px.svg';
// import VolumeDown from 'material-design-icons/av/svg/production/ic_volume_down_48px.svg';
// import VolumeMute from 'material-design-icons/av/svg/production/ic_volume_mute_48px.svg';
// import VolumeOff from 'material-design-icons/av/svg/production/ic_volume_off_48px.svg';

import FullScreenIcon from 'material-design-icons/navigation/svg/production/ic_fullscreen_48px.svg';
import FullScreenExitIcon from 'material-design-icons/navigation/svg/production/ic_fullscreen_exit_48px.svg';

import Slider from 'components/Slider';
import { prettify } from 'utils/duration';

type Props = {
  currentTime: number,
  duration: number,
  playing: boolean,
  fullScreen: boolean,
  onTogglePlay: () => void,
  onJump: (step: number) => void,
  onSeek: (time: number) => void,
  onSeekStart: () => void,
  onSeekEnd: () => void,
  onToggleFullScreen: () => void
};

const BUTTON_SIZE = 32;
const BUTTON_PLAY_SIZE = 48;
const BUTTON_GUTTER = 16;

const Wrapper = styled.div``;

const ActionsBar = styled.div`
  display: flex;
  padding: 8px 0;
`;

const ActionsBarPart = styled.div`
  width: calc(100% / 3);
`;

const LeftActions = styled(ActionsBarPart)`
  display: flex;
  align-items: center;
  font-size: ${rem(14)};
`;

const MiddleActions = styled(ActionsBarPart)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RightActions = styled(ActionsBarPart)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const Button = styled.a`
  display: block;
  opacity: 0.7;
  transition: opacity 0.3s;
  line-height: 1;
  font-size: ${BUTTON_SIZE}px;
  margin: 0 ${BUTTON_GUTTER / 2}px;

  :hover {
    opacity: 1;
  }

  svg {
    display: block;
  }
`;

const PlayPauseButton = styled(Button)`
  font-size: ${BUTTON_PLAY_SIZE}px;
`;

const CurrentTime = styled.span`
  margin-right: 4px;
`;

const Duration = styled.span`
  margin-left: 4px;
  opacity: 0.8;
`;

const JumpButtonsInner = styled.div`
  display: flex;
  align-items: center;
  width: ${(BUTTON_SIZE + BUTTON_GUTTER) * 3}px;
`;

const JumpButtons = styled.div`
  width: ${BUTTON_SIZE + BUTTON_GUTTER}px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  transition: width 0.3s;

  :hover {
    width: ${(BUTTON_SIZE + BUTTON_GUTTER) * 3}px;
    transition-delay: 1s;
  }
`;

export default class Controls extends Component<Props> {
  render() {
    const {
      currentTime = 0,
      duration = 0,
      playing = false,
      fullScreen = false,
      onTogglePlay = noop,
      onJump = noop,
      onSeek = noop,
      onSeekStart = noop,
      onSeekEnd = noop,
      onToggleFullScreen = noop
    } = this.props;

    return (
      <Wrapper onMouseMove={this.handleMouseMove} onClick={this.handleClick}>
        <Slider
          max={duration}
          value={currentTime}
          onChange={(_, time) => onSeek(time)}
          onDragStart={onSeekStart}
          onDragEnd={onSeekEnd}
        />
        <ActionsBar>
          <LeftActions>
            <CurrentTime>{prettify(currentTime, duration)}</CurrentTime>
            <span>/</span>
            <Duration>{prettify(duration)}</Duration>
          </LeftActions>
          <MiddleActions>
            <JumpButtons>
              <JumpButtonsInner>
                <Button onClick={() => onJump(-5)}>
                  <Replay5Icon />
                </Button>
                <Button onClick={() => onJump(-10)}>
                  <Replay10Icon />
                </Button>
                <Button onClick={() => onJump(-30)}>
                  <Replay30Icon />
                </Button>
              </JumpButtonsInner>
            </JumpButtons>
            <PlayPauseButton onClick={onTogglePlay}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </PlayPauseButton>
            <JumpButtons>
              <JumpButtonsInner>
                <Button onClick={() => onJump(5)}>
                  <Forward5Icon />
                </Button>
                <Button onClick={() => onJump(10)}>
                  <Forward10Icon />
                </Button>
                <Button onClick={() => onJump(30)}>
                  <Forward30Icon />
                </Button>
              </JumpButtonsInner>
            </JumpButtons>
            <Button>
              <VolumeUp />
            </Button>
          </MiddleActions>
          <RightActions>
            <Button onClick={() => onToggleFullScreen()}>
              {fullScreen ? <FullScreenExitIcon /> : <FullScreenIcon />}
            </Button>
          </RightActions>
        </ActionsBar>
      </Wrapper>
    );
  }
}
