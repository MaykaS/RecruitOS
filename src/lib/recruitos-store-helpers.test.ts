import { describe, expect, it } from "vitest";
import {
  convertBrainDumpToActionItemInData,
  createActionItemFromSourceInData,
  createChecklistActionItems,
  deleteRecordFromData,
  syncDerivedState,
  toggleActionItemInData,
} from "@/lib/recruitos-store-helpers";
import { getLinkedActionItems, seedData } from "@/lib/recruitos";

describe("recruitos store helpers", () => {
  it("syncs derived company, contact, application, and prep relationships", () => {
    const data = syncDerivedState(seedData());
    const application = data.applications[0];
    const company = data.companies.find((item) => item.id === application.company_id);
    const prep = data.interviewPrep[0];

    expect(company?.linked_application_ids).toContain(application.id);
    expect(company?.linked_contact_ids.length).toBeGreaterThan(0);
    expect(application.linked_action_item_ids.length).toBeGreaterThan(0);
    expect(data.contacts.some((contact) => contact.linked_application_ids.includes(application.id))).toBe(
      true,
    );
    expect(prep.readiness_score).toBeGreaterThanOrEqual(0);
  });

  it("creates interview prep checklist action items with linked context", () => {
    const checklist = createChecklistActionItems(
      "prep-1",
      "2026-07-10T13:00:00.000Z",
      "company-1",
      "application-1",
    );

    expect(checklist.length).toBeGreaterThan(5);
    expect(checklist.every((item) => item.linked_interview_prep_id === "prep-1")).toBe(true);
    expect(checklist.every((item) => item.linked_company_id === "company-1")).toBe(true);
    expect(checklist.every((item) => item.linked_application_id === "application-1")).toBe(true);
  });

  it("treats action items as shared source-of-truth when toggled", () => {
    const data = syncDerivedState(seedData());
    const application = data.applications[0];
    const linkedAction = getLinkedActionItems(data, "applications", application.id)[0];

    expect(linkedAction).toBeDefined();

    const updated = syncDerivedState(toggleActionItemInData(data, linkedAction.id));
    const updatedAction = updated.actionItems.find((item) => item.id === linkedAction.id);
    const updatedApplication = updated.applications.find((item) => item.id === application.id);

    expect(updatedAction?.status).toBe("Done");
    expect(updatedAction?.completed_at).not.toBe("");
    expect(updatedApplication?.linked_action_item_ids).toContain(linkedAction.id);
  });

  it("updates interview prep readiness from linked action-item completion", () => {
    const data = syncDerivedState(seedData());
    const prep = data.interviewPrep[0];
    const linkedAction = getLinkedActionItems(data, "interview-prep", prep.id)[0];

    expect(linkedAction).toBeDefined();

    const updated = syncDerivedState(toggleActionItemInData(data, linkedAction.id));
    const refreshedPrep = updated.interviewPrep.find((item) => item.id === prep.id);

    expect(refreshedPrep?.readiness_score).toBeGreaterThan(prep.readiness_score);
  });

  it("creates action items from source records with the expected linkage", () => {
    const data = seedData();
    const updated = createActionItemFromSourceInData(data, {
      title: "Follow up with target company",
      source_type: "Application",
      source_id: data.applications[0].id,
      linked_application_id: data.applications[0].id,
      linked_company_id: data.applications[0].company_id,
    });

    const action = updated.actionItems.at(-1);
    expect(action?.title).toBe("Follow up with target company");
    expect(action?.linked_application_id).toBe(data.applications[0].id);
    expect(action?.linked_company_id).toBe(data.applications[0].company_id);
  });

  it("converts a brain dump into a linked action item once", () => {
    const data = seedData();
    const brainDump = data.brainDumps[0];
    const converted = convertBrainDumpToActionItemInData(data, brainDump.id);
    const action = converted.actionItems.at(-1);

    expect(action?.source_type).toBe("Brain Dump");
    expect(action?.source_id).toBe(brainDump.id);
    expect(converted.brainDumps.find((item) => item.id === brainDump.id)?.converted_action_item_id).toBe(
      action?.id,
    );

    const convertedAgain = convertBrainDumpToActionItemInData(converted, brainDump.id);
    expect(convertedAgain.actionItems).toHaveLength(converted.actionItems.length);
  });

  it("keeps PAR and interview question links bidirectional after derivation", () => {
    const data = syncDerivedState(seedData());
    const story = data.parStories.find((item) => item.linked_question_ids.length > 0);

    expect(story).toBeDefined();
    for (const questionId of story?.linked_question_ids ?? []) {
      const question = data.interviewQuestions.find((item) => item.id === questionId);
      expect(question?.linked_par_story_ids).toContain(story?.id);
    }
  });

  it("cleans linked references when deleting an application", () => {
    const data = syncDerivedState(seedData());
    const application = data.applications[0];
    const updated = syncDerivedState(deleteRecordFromData(data, "applications", application.id));

    expect(updated.applications.some((item) => item.id === application.id)).toBe(false);
    expect(updated.companies.every((company) => !company.linked_application_ids.includes(application.id))).toBe(
      true,
    );
    expect(updated.contacts.every((contact) => !contact.linked_application_ids.includes(application.id))).toBe(
      true,
    );
    expect(updated.resumes.every((resume) => !resume.linked_application_ids.includes(application.id))).toBe(
      true,
    );
    expect(updated.interviewPrep.every((prep) => prep.application_id !== application.id)).toBe(true);
    expect(updated.actionItems.every((item) => item.linked_application_id !== application.id)).toBe(true);
  });

  it("cleans linked references when deleting a contact", () => {
    const data = syncDerivedState(seedData());
    const contact = data.contacts[0];
    const updated = syncDerivedState(deleteRecordFromData(data, "networking", contact.id));

    expect(updated.contacts.some((item) => item.id === contact.id)).toBe(false);
    expect(updated.companies.every((company) => !company.linked_contact_ids.includes(contact.id))).toBe(true);
    expect(updated.applications.every((application) => !application.linked_contact_ids.includes(contact.id))).toBe(
      true,
    );
    expect(updated.interviewPrep.every((prep) => !prep.linked_contact_ids.includes(contact.id))).toBe(true);
    expect(updated.actionItems.every((item) => item.linked_contact_id !== contact.id)).toBe(true);
  });
});
