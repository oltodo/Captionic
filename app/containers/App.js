// @flow
import * as React from 'react';
import GlobalStyles from 'components/GlobalStyles';

type Props = {
  children: React.Node
};

export default class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children } = this.props;

    return (
      <React.Fragment>
        <GlobalStyles />
        {children}
      </React.Fragment>
    );
  }
}
