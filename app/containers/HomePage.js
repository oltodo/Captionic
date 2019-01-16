// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import Player from 'components/Player';

// const {
//   remote: { dialog }
// } = require('electron');

type Props = {};

const Wrapper = styled.div`
  background: black;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default class HomePage extends Component<Props> {
  state = {
    src: '/Users/nbazille/Downloads/video/video.mkv'
  };

  // componentDidMount() {
  //   const [src] = dialog.showOpenDialog({ properties: ['openFile'] });
  //
  //   this.setState({ src });
  // }

  render() {
    const { src } = this.state;

    return <Wrapper>{src && <Player src={src} />}</Wrapper>;
  }
}
