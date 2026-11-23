import { BUILTIN_MODULES } from "../src/content/registry";
import { learningModuleSchema } from "../src/content/schemas";

let failed = false;

for (const mod of BUILTIN_MODULES) {
  const result = learningModuleSchema.safeParse(mod);
  if (!result.success) {
    console.error(`❌ Validation failed for module "${mod.id}":`);
    console.error(result.error.format());
    failed = true;
  } else {
    console.log(
      `✅ Module "${mod.id}" valid (${mod.vocab.length} vocab, ${mod.grammarRules.length} grammar rules, ${mod.audioQuiz.length} audio quiz, ${mod.dressUpTasks.length} dress-up, ${mod.sentenceTasks.length} sentences, ${mod.sortRounds.length} sort rounds, ${mod.spellingTasks.length} spelling, ${mod.examQuestions.length} exam questions)`
    );
  }
}

if (failed) {
  process.exit(1);
}
