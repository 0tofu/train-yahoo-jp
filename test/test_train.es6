import {assert} from 'chai';
import {Train} from '../src/';

describe('train', () => {
  const train = new Train();

  it ('getTrouble', () => {
    let info = train.getTrouble();
    assert(info !== '', 'Trouble is not ""');
  });
});
