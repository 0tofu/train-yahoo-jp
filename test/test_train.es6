import {expect} from 'chai';
import {Train} from '../src/';

describe('train', () => {
  const train = new Train();

  it ('getTrainInfo', () => {
    return train.getTrainInfo('京都').then((info) => {
      // console.log(info);
      // expect(info).to.have.length.of.at.least(1);
    });
  });
});
