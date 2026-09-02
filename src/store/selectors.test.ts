import { describe, expect, it } from "vitest";
import { selectSelectedSkillIds, selectSelectedSkills } from "./selectors";
import type { RootState } from "./index";

const createState = (): RootState =>
  ({
    candidate: {
      availableSkills: [
        { skillId: "skill-1", skillName: "React", selected: true },
        { skillId: "skill-2", skillName: "TypeScript", selected: false },
        { skillId: "skill-3", skillName: "Testing", selected: true },
      ],
    },
  } as RootState);

describe("candidate skill selectors", () => {
  it("derives selected skill IDs and skills from the authoritative skill collection", () => {
    const state = createState();

    expect(selectSelectedSkillIds(state)).toEqual(["skill-1", "skill-3"]);
    expect(selectSelectedSkills(state).map((skill) => skill.skillId)).toEqual([
      "skill-1",
      "skill-3",
    ]);
  });
});