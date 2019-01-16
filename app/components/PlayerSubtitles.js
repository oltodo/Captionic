// @flow
import React, { Component } from 'react';
import styled from 'styled-components';

type CueType = {
  id: number,
  startTime: number,
  endTime: number,
  text: string
};

type Props = {
  subtitles: Array<CueType>,
  currentTime: number
};

const Subtitle = styled.div`
  user-select: text;
  display: flex;
  justify-content: center;
`;

const Cue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 2.2vh;
  line-height: 1.3;
`;

const CueLine = styled.div`
  background: rgba(0, 0, 0, 0.5);
  padding: 2px;
  margin-bottom: 2px;
`;

export default class Subtitles extends Component<Props> {
  shouldComponentUpdate(nextProps) {
    const { currentTime } = this.props;

    if (nextProps.currentTime === currentTime) {
      return false;
    }

    return true;
  }

  getActiveCue() {
    const { subtitles, currentTime } = this.props;

    return subtitles.find(
      cue =>
        cue.startTime <= currentTime + 0.01 && currentTime + 0.01 <= cue.endTime
    );
  }

  renderActiveCue() {
    const activeCue = this.getActiveCue();

    if (!activeCue) {
      return null;
    }

    const { id, text } = activeCue;
    const lines = text.split('\n').map((str, number) => ({
      number,
      str
    }));

    return (
      <Cue>
        {lines.map(({ str, number }) => (
          <CueLine key={`${id}-${number}`}>{str}</CueLine>
        ))}
      </Cue>
    );
  }

  render() {
    return (
      <Subtitle
        ref={ref => {
          this.ref = ref;
        }}
      >
        {this.renderActiveCue()}
      </Subtitle>
    );
  }
}
