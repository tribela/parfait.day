import React from 'react';

const FIX_SECONDS = -8 * 60;

const DIVISIONS = [
  '알반 에일레르',
  '벨테인',
  '알반 헤루인',
  '루나사',
  '알반 엘베드',
  '삼하인',
  '임볼릭',
];

const padLeft = (str, len, pad) => {
  str = String(str);
  pad = String(pad);
  while (str.length < len) {
    str = pad + str;
  }
  return str;
};

const getErinnTime = (ts) => {
  let koreanTimestamp = Math.floor(ts / 1000 + 32400);

  let erinnTimestamp = koreanTimestamp * 40 + FIX_SECONDS;
  erinnTimestamp %= 86400;  // 24 * 60 * 60

  let erinnHour = Math.floor(erinnTimestamp / 3600);
  let erinnMinute = Math.floor(erinnTimestamp / 60) % 60;

  erinnHour = padLeft(erinnHour, 2, '0');
  erinnMinute = padLeft(erinnMinute, 2, '0');

  return `${erinnHour}:${erinnMinute}`;
};

const getDivision = (ts) => {
  let koreanTimestamp = Math.floor(ts / 1000 + 32400);

  let weekday = (Math.floor(koreanTimestamp / 86400) - 4) % 7;

  return DIVISIONS[weekday];
};

export default class MabinogiClock extends React.PureComponent {

  state = {
    timestamp: Date.now(),
  };

  componentDidMount () {
    this.interval = setInterval(() => this.setState({ timestamp: Date.now() }), 1000);
  }

  componentWillUnmount () {
    clearInterval(this.interval);
  }

  render () {
    let { timestamp } = this.state;
    return (
      <div className='mabinogi-clock'>
        <div className='mabinogi-clock__time'>
          <span>{ getDivision(timestamp) }</span>
          <span>{ getErinnTime(timestamp) }</span>
        </div>
      </div>
    );
  }

}
