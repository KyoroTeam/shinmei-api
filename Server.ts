import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { expandGlobSync } from "https://deno.land/std@0.83.0/fs/mod.ts";

console.log("a", Deno.cwd());

interface YomichanDictEntry {
  expression: string;
  reading: string;
  definitionTags: string;
  rules: string;
  score: string;
  glossary: string[][];
  sequence: string;
  termTags: string;
}

const books = new Map<string, YomichanDictEntry>();

for (const file of expandGlobSync("新明解国語辞典第五版v3/term_bank_*.json")) {
  const content = Deno.readTextFileSync(file.path);
  const json = JSON.parse(content) as any[][];
  const dictEntries = json.map(
    (entry) =>
      ({
        expression: entry[0],
        reading: entry[1],
        definitionTags: entry[2],
        rules: entry[3],
        score: entry[4],
        glossary: (entry[5] as string[]).map((s) => s.split("\n")),
        sequence: entry[6],
        termTags: entry[7],
      } as YomichanDictEntry)
  );
  dictEntries.forEach((e) => books.set(e.expression, e));
}

console.log("Ready to Run");

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })
  .get("/book", (context) => {
    context.response.body = Array.from(books.values());
  })
  .get("/bookcount", (context) => {
    context.response.body = books.size;
  })
  .get("/book/:id", (context) => {
    const id = context.params?.id;
    console.log(id);
    if (id && books.has(id)) {
      console.log("OK");
      context.response.body = books.get(id);
    }
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
