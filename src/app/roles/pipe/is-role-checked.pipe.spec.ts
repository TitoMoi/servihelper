import { IsRoleCheckedPipe } from './is-role-checked.pipe';

describe('IsRoleCheckedPipe', () => {
  it('create an instance', () => {
    const pipe = new IsRoleCheckedPipe();
    expect(pipe).toBeTruthy();
  });
});
