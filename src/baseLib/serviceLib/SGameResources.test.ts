import { describe, expect, it } from 'vitest';
import { SCreateEpisodeResources, SResetEpisodeResources, SSpendEpisodeResources } from './SGameResources';

describe('SGameResources', () => {
  it('does not allow a production action to overspend episode resources', () => {
    const resources = SCreateEpisodeResources();

    expect(SSpendEpisodeResources(resources, { camera: 2, edit: 1 })).toBe(true);
    expect(SSpendEpisodeResources(resources, { camera: 2 })).toBe(false);
    expect(resources).toEqual({ camera: 1, edit: 1, buzz: 2 });
  });

  it('resets the full episode production allowance', () => {
    const resources = { camera: 0, edit: 0, buzz: 0 };

    SResetEpisodeResources(resources);

    expect(resources).toEqual(SCreateEpisodeResources());
  });

});
