import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import yaml from 'js-yaml';

const root = process.cwd();
const dataJsPath = path.join(root, 'data.js');
const outputDir = path.join(root, 'src', 'data');

const expose = `
Object.assign(globalThis, {
  qeaAbstract, qeaThesis, qeaJournals, qeaConferences, qeaDomestic, qeaPatent,
  education, career, researchInterests, projects, awards, activities,
  phdThesis, intlJournals, intlConferences, domesticPapers, magazineArticles, books,
  patentNote, patentSearchUrls, honors, taActivities, clubs, scholarUrl
});
`;

const mapping = [
  { file: 'qea.yml', data: (ctx) => ({ qeaAbstract: ctx.qeaAbstract, qeaThesis: ctx.qeaThesis, qeaJournals: ctx.qeaJournals, qeaConferences: ctx.qeaConferences, qeaDomestic: ctx.qeaDomestic, qeaPatent: ctx.qeaPatent }) },
  { file: 'education.yml', data: (ctx) => ({ education: ctx.education }) },
  { file: 'career.yml', data: (ctx) => ({ career: ctx.career }) },
  { file: 'research.yml', data: (ctx) => ({ researchInterests: ctx.researchInterests, projects: ctx.projects }) },
  { file: 'awards.yml', data: (ctx) => ({ awards: ctx.awards }) },
  { file: 'activities.yml', data: (ctx) => ({ activities: ctx.activities }) },
  { file: 'publications.yml', data: (ctx) => ({ phdThesis: ctx.phdThesis, intlJournals: ctx.intlJournals, intlConferences: ctx.intlConferences, domesticPapers: ctx.domesticPapers, magazineArticles: ctx.magazineArticles, books: ctx.books }) },
  { file: 'patents.yml', data: (ctx) => ({ patentNote: ctx.patentNote, patentSearchUrls: ctx.patentSearchUrls }) },
  { file: 'honors.yml', data: (ctx) => ({ honors: ctx.honors }) },
  { file: 'ta.yml', data: (ctx) => ({ taActivities: ctx.taActivities }) },
  { file: 'clubs.yml', data: (ctx) => ({ clubs: ctx.clubs }) },
  { file: 'profile.yml', data: (ctx) => ({ scholarUrl: ctx.scholarUrl }) },
];

const expected = {
  qea: 18,
  education: 6,
  career: 8,
  research: 34,
  awards: 33,
  activities: 52,
  publications: 51,
  patents: 2,
  honors: 13,
  ta: 9,
  clubs: 1,
  total: 227,
  fileLinks: 177,
  uniqueUrls: 146,
};

function len(value) {
  if (Array.isArray(value)) return value.length;
  return value ? 1 : 0;
}

function collectFileUrls(value, output) {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectFileUrls(item, output));
    return;
  }
  if (typeof value === 'object') {
    if (Array.isArray(value.files)) {
      value.files.forEach((file) => {
        if (file && file.url) output.push(file.url);
      });
    }
    for (const key of Object.keys(value)) {
      if (key !== 'files') collectFileUrls(value[key], output);
    }
  }
}

async function main() {
  const source = await fs.readFile(dataJsPath, 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(source + expose, context, { filename: 'data.js' });

  await fs.mkdir(outputDir, { recursive: true });

  for (const item of mapping) {
    const content = item.data(context);
    const text = yaml.dump(content, {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      quotingType: '"',
      forceQuotes: false,
    });
    await fs.writeFile(path.join(outputDir, item.file), text, 'utf8');
  }

  // Parse check for generated YAML files.
  for (const item of mapping) {
    const text = await fs.readFile(path.join(outputDir, item.file), 'utf8');
    yaml.load(text);
  }

  const counts = {
    qea: 1 + len(context.qeaThesis) + len(context.qeaJournals) + len(context.qeaConferences) + len(context.qeaDomestic) + len(context.qeaPatent),
    education: len(context.education),
    career: len(context.career),
    research: len(context.researchInterests) + len(context.projects),
    awards: len(context.awards),
    activities: len(context.activities.board) + len(context.activities.committee) + len(context.activities.standardization) + len(context.activities.invitedTalks) + len(context.activities.teaching) + len(context.activities.judges) + len(context.activities.reviewers),
    publications: len(context.phdThesis) + len(context.intlJournals) + len(context.intlConferences) + len(context.domesticPapers) + len(context.magazineArticles) + len(context.books),
    patents: len(context.patentNote) + len(context.patentSearchUrls),
    honors: len(context.honors),
    ta: len(context.taActivities),
    clubs: len(context.clubs),
  };
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  const urls = [];
  collectFileUrls({
    qeaThesis: context.qeaThesis,
    qeaJournals: context.qeaJournals,
    qeaConferences: context.qeaConferences,
    qeaDomestic: context.qeaDomestic,
    qeaPatent: context.qeaPatent,
    education: context.education,
    career: context.career,
    researchInterests: context.researchInterests,
    projects: context.projects,
    awards: context.awards,
    activities: context.activities,
    phdThesis: context.phdThesis,
    intlJournals: context.intlJournals,
    intlConferences: context.intlConferences,
    domesticPapers: context.domesticPapers,
    magazineArticles: context.magazineArticles,
    books: context.books,
    patentSearchUrls: context.patentSearchUrls,
    honors: context.honors,
    taActivities: context.taActivities,
    clubs: context.clubs,
  }, urls);
  const uniqueUrlCount = new Set(urls).size;

  const result = {
    counts,
    expected,
    comparisons: {
      qea: counts.qea === expected.qea,
      education: counts.education === expected.education,
      career: counts.career === expected.career,
      research: counts.research === expected.research,
      awards: counts.awards === expected.awards,
      activities: counts.activities === expected.activities,
      publications: counts.publications === expected.publications,
      patents: counts.patents === expected.patents,
      honors: counts.honors === expected.honors,
      ta: counts.ta === expected.ta,
      clubs: counts.clubs === expected.clubs,
      total: counts.total === expected.total,
      fileLinks: urls.length === expected.fileLinks,
      uniqueUrls: uniqueUrlCount === expected.uniqueUrls,
    },
    fileLinks: urls.length,
    uniqueUrls: uniqueUrlCount,
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
