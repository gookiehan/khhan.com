import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');

const expectedCounts = {
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
};

const fileMap = {
  qea: 'qea.yml',
  education: 'education.yml',
  career: 'career.yml',
  research: 'research.yml',
  awards: 'awards.yml',
  activities: 'activities.yml',
  publications: 'publications.yml',
  patents: 'patents.yml',
  honors: 'honors.yml',
  ta: 'ta.yml',
  clubs: 'clubs.yml',
  profile: 'profile.yml',
};

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readYaml(fileName, errors) {
  const filePath = path.join(dataDir, fileName);
  try {
    const source = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(source);
    if (!isObject(data)) {
      errors.push(`[parse] ${fileName}: top-level must be an object`);
      return {};
    }
    return data;
  } catch (error) {
    errors.push(`[parse] ${fileName}: ${error.message}`);
    return {};
  }
}

function len(value) {
  if (Array.isArray(value)) return value.length;
  return value ? 1 : 0;
}

function validateNoNullArrayItems(value, pathLabel, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (item == null) {
        errors.push(`[null-item] ${pathLabel}[${index}] is null/undefined`);
      } else {
        validateNoNullArrayItems(item, `${pathLabel}[${index}]`, errors);
      }
    });
    return;
  }
  if (isObject(value)) {
    Object.entries(value).forEach(([key, child]) => {
      validateNoNullArrayItems(child, `${pathLabel}.${key}`, errors);
    });
  }
}

function collectFileNodes(value, pathLabel, output) {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectFileNodes(item, `${pathLabel}[${index}]`, output));
    return;
  }
  if (isObject(value)) {
    if (Array.isArray(value.files)) {
      output.push({ path: `${pathLabel}.files`, files: value.files });
    }
    Object.entries(value).forEach(([key, child]) => {
      if (key !== 'files') collectFileNodes(child, `${pathLabel}.${key}`, output);
    });
  }
}

function isLocalAsset(url) {
  return typeof url === 'string' && (url.startsWith('assets/') || url.startsWith('/assets/'));
}

function normalizeLocalAsset(url) {
  return url.startsWith('/assets/') ? url.slice(1) : url;
}

function validateFileLinks(rootData, errors) {
  const nodes = [];
  collectFileNodes(rootData, 'data', nodes);
  let fileLinks = 0;
  const urls = [];
  const localAssetUrls = new Set();

  nodes.forEach((node) => {
    node.files.forEach((file, index) => {
      const currentPath = `${node.path}[${index}]`;
      fileLinks += 1;
      if (!isObject(file)) {
        errors.push(`[files] ${currentPath} must be an object`);
        return;
      }
      if (!('url' in file) || typeof file.url !== 'string' || file.url.trim() === '') {
        errors.push(`[files] ${currentPath}.url is required`);
        return;
      }
      urls.push(file.url);
      if (isLocalAsset(file.url)) {
        localAssetUrls.add(normalizeLocalAsset(file.url));
      }
    });
  });

  return {
    fileLinks,
    uniqueUrls: new Set(urls).size,
    localAssetUrls: localAssetUrls.size,
  };
}

function calculateSectionCounts(data) {
  return {
    qea: 1 + len(data.qea.qeaThesis) + len(data.qea.qeaJournals) + len(data.qea.qeaConferences) + len(data.qea.qeaDomestic) + len(data.qea.qeaPatent),
    education: len(data.education.education),
    career: len(data.career.career),
    research: len(data.research.researchInterests) + len(data.research.projects),
    awards: len(data.awards.awards),
    activities:
      len(data.activities.activities?.board) +
      len(data.activities.activities?.committee) +
      len(data.activities.activities?.standardization) +
      len(data.activities.activities?.invitedTalks) +
      len(data.activities.activities?.teaching) +
      len(data.activities.activities?.judges) +
      len(data.activities.activities?.reviewers),
    publications:
      len(data.publications.phdThesis) +
      len(data.publications.intlJournals) +
      len(data.publications.intlConferences) +
      len(data.publications.domesticPapers) +
      len(data.publications.magazineArticles) +
      len(data.publications.books),
    patents: len(data.patents.patentNote) + len(data.patents.patentSearchUrls),
    honors: len(data.honors.honors),
    ta: len(data.ta.taActivities),
    clubs: len(data.clubs.clubs),
  };
}

function validateCounts(actualCounts, errors) {
  const total = Object.values(actualCounts).reduce((sum, value) => sum + value, 0);
  const withTotal = { ...actualCounts, total };
  Object.entries(expectedCounts).forEach(([key, expected]) => {
    const actual = withTotal[key];
    if (actual !== expected) {
      errors.push(`[count] ${key}: expected ${expected}, got ${actual}`);
    }
  });
  return withTotal;
}

function run() {
  const errors = [];
  const data = {
    qea: readYaml(fileMap.qea, errors),
    education: readYaml(fileMap.education, errors),
    career: readYaml(fileMap.career, errors),
    research: readYaml(fileMap.research, errors),
    awards: readYaml(fileMap.awards, errors),
    activities: readYaml(fileMap.activities, errors),
    publications: readYaml(fileMap.publications, errors),
    patents: readYaml(fileMap.patents, errors),
    honors: readYaml(fileMap.honors, errors),
    ta: readYaml(fileMap.ta, errors),
    clubs: readYaml(fileMap.clubs, errors),
    profile: readYaml(fileMap.profile, errors),
  };

  validateNoNullArrayItems(data, 'data', errors);

  const linkStats = validateFileLinks(
    {
      qea: data.qea,
      education: data.education,
      career: data.career,
      research: data.research,
      awards: data.awards,
      activities: data.activities,
      publications: data.publications,
      patents: data.patents,
      honors: data.honors,
      ta: data.ta,
      clubs: data.clubs,
    },
    errors
  );

  const sectionCounts = calculateSectionCounts(data);
  const finalCounts = validateCounts(sectionCounts, errors);

  const result = {
    sectionCounts: finalCounts,
    fileLinks: linkStats.fileLinks,
    uniqueUrls: linkStats.uniqueUrls,
    localAssetUrls: linkStats.localAssetUrls,
    success: errors.length === 0,
  };

  console.log(JSON.stringify(result, null, 2));

  if (errors.length > 0) {
    console.error('\nValidation errors:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
}

run();
