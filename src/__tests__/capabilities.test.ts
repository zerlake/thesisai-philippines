import { capabilitiesFor } from "../lib/capabilities";

describe('capabilitiesFor', () => {
  it('should deny everything for free plan', () => {
    const caps = capabilitiesFor('free');
    expect(caps.chapterAgents).toBe(false);
    expect(caps.advisorAlignedRevision).toBe(false);
    expect(caps.basicRevision).toBe(true);
  });

  it('should allow chapter agents for pro plan', () => {
    const caps = capabilitiesFor('pro');
    expect(caps.chapterAgents).toBe(true);
    expect(caps.advisorAlignedRevision).toBe(false);
  });

  it('should allow everything for pro_plus_advisor', () => {
    const caps = capabilitiesFor('pro_advisor');
    expect(caps.chapterAgents).toBe(true);
    expect(caps.advisorAlignedRevision).toBe(true);
    expect(caps.advisorCommentTracking).toBe(true);
  });

  it('should allow everything for pro_complete', () => {
    const caps = capabilitiesFor('pro_complete');
    expect(caps.advisorAlignedRevision).toBe(true);
    expect(caps.advancedConsistencyChecks).toBe(true);
  });

  it('should fallback to free for unknown plan', () => {
    const caps = capabilitiesFor('unknown_plan');
    expect(caps.chapterAgents).toBe(false);
  });
});
