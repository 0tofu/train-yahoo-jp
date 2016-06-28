import {expect} from 'chai';
import {Train} from '../src/';

describe('train', () => {
  const train = new Train();

  it ('getTrouble', () => {
    return train.getTrouble().then((info) => {
      expect(info).to.have.length.of.at.least(1);
    });
  });
});
