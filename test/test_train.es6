import {expect} from 'chai';
import {Train} from '../src/';

describe('train', () => {
  const train = new Train();

  it ('getTrainInfo', function() {
    this.timeout(15000);
    return train.getTrainInfoAtLine('京都').then((info) => {
      expect(info).to.have.lengthOf(7);
    });
  });
});
