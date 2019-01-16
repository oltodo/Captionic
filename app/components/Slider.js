// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import keycode from 'keycode';
import { clamp } from 'lodash';
import ButtonBase from '@material-ui/core/ButtonBase';
import { condition } from 'utils/sc';
import transitions, { duration, easing } from 'utils/transitions';

const COLOR_PRIMARY = '#259e62';
const COLOR_DISABLED = 'rgba(255,255,255,0.5)';
const THICKNESS = 4;
const THUMB_SIZE = THICKNESS;
const THUMB_SIZE_HOVER = THUMB_SIZE * 2;
const THUMB_SIZE_FOCUS = THUMB_SIZE * 4;
const THUMB_SIZE_ACTIVATED = THUMB_SIZE * 4;

const commonTransitionsOptions = {
  duration: duration.short,
  easing: easing.easeOut
};

const commonTransitionsProperty = [
  'width',
  'height',
  'box-shadow',
  'left',
  'top'
];

const commonTransitions = transitions.create(
  commonTransitionsProperty,
  commonTransitionsOptions
);

const Inner = styled.div`
  position: relative;

  ${condition('vertical').css`
    height: 100%;
  `};
`;

const Track = styled.div`
  position: absolute;
  transform: translate(0, -50%);
  top: 50%;
  height: ${THICKNESS}px;
  background-color: ${COLOR_PRIMARY};
  transition: ${commonTransitions};

  ${condition('focused').css`
    transition: none;
  `};

  ${condition('activated').css`
    transition: none;
  `};

  ${condition('disabled').css`
    background-color: ${COLOR_DISABLED}
  `};

  ${condition('vertical').css`
    transform: translate(-50%, 0);
    left: 50%;
    top: initial;
    width: ${THICKNESS}px;
  `};
`;

const TrackBefore = styled(Track)`
  z-index: 1;
  left: 0;
`;

const TrackAfter = styled(Track)`
  right: 0;
  opacity: 0.24;

  ${condition('vertical').css`
    bottom: 0;
  `};
`;

const Thumb = styled(
  ({ vertical, focused, activated, disabled, jumped, ...rest }) => (
    <ButtonBase {...rest} />
  )
)`
  && {
    position: absolute;
    z-index: 2;
    transform: translate(-50%, -50%);
    width: ${THUMB_SIZE}px;
    height: ${THUMB_SIZE}px;
    border-radius: 50%;
    transition: ${commonTransitions};
    background: ${COLOR_PRIMARY};

    ${condition('focused').css`
      background-color: ${COLOR_PRIMARY};
      width: ${THUMB_SIZE_FOCUS}px;
      height: ${THUMB_SIZE_FOCUS}px;
    `};

    ${condition('activated').css`
      width: ${THUMB_SIZE_ACTIVATED}px !important;
      height: ${THUMB_SIZE_ACTIVATED}px !important;
      transition: none;
    `};

    ${condition('disabled').css`
      cursor: 'no-drop';
      width: ${THUMB_SIZE}px;
      height: ${THUMB_SIZE}px;
      background-color: ${COLOR_DISABLED};
    `};

    ${condition('jumped').css`
      width: ${THUMB_SIZE_ACTIVATED}px;
      height: ${THUMB_SIZE_ACTIVATED}px;
    `};
  }
`;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: ${THICKNESS}
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  ${condition('disabled').css`
    cursor: no-drop;
  `};

  ${condition('vertical').css`
    height: 100%;
  `};

  ${condition('reverse').css`
    transform: scaleX(-1);

    ${condition('vertical').css`
      transform: scaleY(-1);
    `};
  `};

  :hover {
    ${Thumb} {
      width: ${THUMB_SIZE_HOVER}px;
      height: ${THUMB_SIZE_HOVER}px;
    }
  }
`;

function percentToValue(percent, min, max) {
  return ((max - min) * percent) / 100 + min;
}

function roundToStep(number, step) {
  return Math.round(number / step) * step;
}

function getOffset(node) {
  const { pageYOffset, pageXOffset } = global;

  const { left, top } = node.getBoundingClientRect();

  return {
    top: top + pageYOffset,
    left: left + pageXOffset
  };
}

function getMousePosition(event) {
  if (event.changedTouches && event.changedTouches[0]) {
    return {
      x: event.changedTouches[0].pageX,
      y: event.changedTouches[0].pageY
    };
  }

  return {
    x: event.pageX,
    y: event.pageY
  };
}

function calculatePercent(node, event, isVertical, isReverted) {
  const { width, height } = node.getBoundingClientRect();
  const { top, left } = getOffset(node);
  const { x, y } = getMousePosition(event);

  const value = isVertical ? y - top : x - left;
  const onePercent = (isVertical ? height : width) / 100;

  return isReverted
    ? 100 - clamp(value / onePercent, 0, 100)
    : clamp(value / onePercent, 0, 100);
}

function preventPageScrolling(event) {
  event.preventDefault();
}

type Props = {
  className?: string,
  max?: number,
  min?: number,
  value?: number,
  step?: number,
  disabled?: boolean,
  reverse?: boolean,
  vertical?: boolean,
  onChange: () => void,
  onDragEnd: () => void,
  onDragStart: () => void
};

export default class Slider extends Component<Props> {
  static defaultProps = {
    className: null,
    min: 0,
    max: 100,
    value: 0,
    step: 1,
    disabled: false,
    reverse: false,
    vertical: false
  };

  state = { currentState: 'initial' };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.disabled) {
      return { currentState: 'disabled' };
    }

    if (!nextProps.disabled && prevState.currentState === 'disabled') {
      return { currentState: 'normal' };
    }

    return null;
  }

  componentDidMount() {
    if (this.containerRef) {
      this.containerRef.addEventListener('touchstart', preventPageScrolling, {
        passive: false
      });
    }
  }

  componentWillUnmount() {
    this.containerRef.removeEventListener('touchstart', preventPageScrolling, {
      passive: false
    });
    document.body.removeEventListener('mousemove', this.handleMouseMove);
    document.body.removeEventListener('mouseup', this.handleMouseUp);
    clearTimeout(this.jumpAnimationTimeoutId);
  }

  jumpAnimationTimeoutId = -1;

  handleKeyDown = event => {
    const { min, max, step, value: currentValue } = this.props;

    const onePercent = Math.abs((max - min) / 100);
    const newStep = step || onePercent;
    let value;

    switch (keycode(event)) {
      case 'home':
        value = min;
        break;
      case 'end':
        value = max;
        break;
      case 'page up':
        value = currentValue + onePercent * 10;
        break;
      case 'page down':
        value = currentValue - onePercent * 10;
        break;
      case 'right':
      case 'up':
        value = currentValue + newStep;
        break;
      case 'left':
      case 'down':
        value = currentValue - newStep;
        break;
      default:
        return;
    }

    event.preventDefault();

    value = clamp(value, min, max);

    this.emitChange(event, value);
  };

  handleFocus = () => {
    this.setState({ currentState: 'focused' });
  };

  handleBlur = () => {
    this.setState({ currentState: 'normal' });
  };

  handleClick = event => {
    const { min, max, vertical, reverse } = this.props;
    const percent = calculatePercent(
      this.containerRef,
      event,
      vertical,
      reverse
    );
    const value = percentToValue(percent, min, max);

    this.emitChange(event, value, () => {
      this.playJumpAnimation();
    });
  };

  handleTouchStart = event => {
    const { onDragStart } = this.props;

    event.preventDefault();
    this.setState({ currentState: 'activated' });

    document.body.addEventListener('touchend', this.handleMouseUp);

    if (typeof onDragStart === 'function') {
      onDragStart(event);
    }
  };

  handleMouseDown = event => {
    const { onDragStart } = this.props;

    event.preventDefault();
    this.setState({ currentState: 'activated' });

    document.body.addEventListener('mousemove', this.handleMouseMove);
    document.body.addEventListener('mouseup', this.handleMouseUp);

    if (typeof onDragStart === 'function') {
      onDragStart(event);
    }
  };

  handleMouseUp = event => {
    const { onDragEnd } = this.props;

    this.setState({ currentState: 'normal' });

    document.body.removeEventListener('mousemove', this.handleMouseMove);
    document.body.removeEventListener('mouseup', this.handleMouseUp);

    if (typeof onDragEnd === 'function') {
      onDragEnd(event);
    }
  };

  handleMouseMove = event => {
    const { min, max, vertical, reverse } = this.props;
    const percent = calculatePercent(
      this.containerRef,
      event,
      vertical,
      reverse
    );
    const value = percentToValue(percent, min, max);

    this.emitChange(event, value);
  };

  emitChange(event, rawValue, callback) {
    const { step, value: previousValue, onChange, disabled } = this.props;
    let value = rawValue;

    if (disabled) {
      return;
    }

    if (step) {
      value = roundToStep(rawValue, step);
    } else {
      value = Number(rawValue.toFixed(3));
    }

    if (typeof onChange === 'function' && value !== previousValue) {
      onChange(event, value);

      if (typeof callback === 'function') {
        callback();
      }
    }
  }

  calculateTrackAfterStyles(percent) {
    const { currentState } = this.state;

    switch (currentState) {
      case 'activated':
        return `calc(100% - ${percent === 0 ? 7 : 5}px)`;
      case 'disabled':
        return `calc(${100 - percent}% - 6px)`;
      default:
        return `calc(100% - ${Math.max(0, THICKNESS - THUMB_SIZE) / 2}px)`;
    }
  }

  calculateTrackBeforeStyles(percent) {
    const { currentState } = this.state;

    switch (currentState) {
      case 'disabled':
        return `calc(${percent}% - 6px)`;
      default:
        return `${percent}%`;
    }
  }

  playJumpAnimation() {
    this.setState({ currentState: 'jumped' }, () => {
      clearTimeout(this.jumpAnimationTimeoutId);
      this.jumpAnimationTimeoutId = setTimeout(() => {
        this.setState({ currentState: 'normal' });
      }, 1000);
    });
  }

  render() {
    const { currentState } = this.state;
    const {
      classes,
      className,
      disabled,
      max,
      min,
      reverse,
      theme,
      value,
      vertical,
      ...other
    } = this.props;

    const percent = clamp(((value - min) * 100) / (max - min), 0, 100);

    const trackProperty = vertical ? 'height' : 'width';
    const thumbProperty = vertical ? 'top' : 'left';
    const inlineTrackBeforeStyles = {
      [trackProperty]: this.calculateTrackBeforeStyles(percent)
    };
    const inlineTrackAfterStyles = {
      [trackProperty]: this.calculateTrackAfterStyles(percent)
    };
    const inlineThumbStyles = { [thumbProperty]: `${percent}%` };

    const commonProps = {
      disabled,
      vertical,
      jumped: !disabled && currentState === 'jumped',
      focused: !disabled && currentState === 'focused',
      activated: !disabled && currentState === 'activated'
    };

    return (
      <Wrapper
        role="slider"
        vertical={vertical}
        reverse={reverse}
        disabled={disabled}
        className={className}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        onClick={this.handleClick}
        onMouseDown={this.handleMouseDown}
        onTouchStartCapture={this.handleTouchStart}
        onTouchMove={this.handleMouseMove}
        ref={ref => {
          this.containerRef = ref;
        }}
        {...other}
      >
        <Inner vertical={vertical}>
          <TrackBefore style={inlineTrackBeforeStyles} {...commonProps} />
          <Thumb
            style={inlineThumbStyles}
            onBlur={this.handleBlur}
            onKeyDown={this.handleKeyDown}
            onTouchStartCapture={this.handleTouchStart}
            onTouchMove={this.handleMouseMove}
            onFocusVisible={this.handleFocus}
            disableRipple
            {...commonProps}
          />
          <TrackAfter style={inlineTrackAfterStyles} {...commonProps} />
        </Inner>
      </Wrapper>
    );
  }
}
