import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');

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

const baselineInfo = {
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

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value) {
  return Array.isArray(value);
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

function ensureKey(obj, key, label, errors) {
  if (!(key in obj)) errors.push(`[schema] ${label}: missing key "${key}"`);
}

function ensureArray(obj, key, label, errors) {
  ensureKey(obj, key, label, errors);
  if (key in obj && !isArray(obj[key])) {
    errors.push(`[schema] ${label}.${key} must be an array`);
  }
}

function validateExpectedStructure(data, errors) {
  ensureKey(data.qea, 'qeaAbstract', 'qea.yml', errors);
  ensureKey(data.qea, 'qeaThesis', 'qea.yml', errors);
  ensureArray(data.qea, 'qeaJournals', 'qea.yml', errors);
  ensureArray(data.qea, 'qeaConferences', 'qea.yml', errors);
  ensureArray(data.qea, 'qeaDomestic', 'qea.yml', errors);
  ensureKey(data.qea, 'qeaPatent', 'qea.yml', errors);

  ensureArray(data.education, 'education', 'education.yml', errors);
  ensureArray(data.career, 'career', 'career.yml', errors);

  ensureArray(data.research, 'researchInterests', 'research.yml', errors);
  ensureArray(data.research, 'projects', 'research.yml', errors);

  ensureArray(data.awards, 'awards', 'awards.yml', errors);

  ensureKey(data.activities, 'activities', 'activities.yml', errors);
  if ('activities' in data.activities) {
    const a = data.activities.activities;
    if (!isObject(a)) {
      errors.push('[schema] activities.yml.activities must be an object');
    } else {
      ['board', 'committee', 'standardization', 'invitedTalks', 'teaching', 'judges', 'reviewers'].forEach((key) => {
        if (!(key in a)) {
          errors.push(`[schema] activities.yml.activities: missing key "${key}"`);
        } else if (!isArray(a[key])) {
          errors.push(`[schema] activities.yml.activities.${key} must be an array`);
        }
      });
    }
  }

  ['phdThesis', 'intlJournals', 'intlConferences', 'domesticPapers', 'magazineArticles', 'books'].forEach((key) => {
    if (key === 'phdThesis') ensureKey(data.publications, key, 'publications.yml', errors);
    else ensureArray(data.publications, key, 'publications.yml', errors);
  });

  ensureKey(data.patents, 'patentNote', 'patents.yml', errors);
  ensureArray(data.patents, 'patentSearchUrls', 'patents.yml', errors);
  ensureArray(data.honors, 'honors', 'honors.yml', errors);
  ensureArray(data.ta, 'taActivities', 'ta.yml', errors);
  ensureArray(data.clubs, 'clubs', 'clubs.yml', errors);
  ensureKey(data.profile, 'scholarUrl', 'profile.yml', errors);
}

function collectFileNodes(value, pathLabel, output, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectFileNodes(item, `${pathLabel}[${index}]`, output, errors));
    return;
  }
  if (!isObject(value)) return;

  if ('files' in value) {
    if (!Array.isArray(value.files)) {
      errors.push(`[files] ${pathLabel}.files must be an array`);
    } else {
      output.push({ path: `${pathLabel}.files`, files: value.files });
    }
  }

  Object.entries(value).forEach(([key, child]) => {
    if (key !== 'files') collectFileNodes(child, `${pathLabel}.${key}`, output, errors);
  });
}

function isLocalAsset(url) {
  return typeof url === 'string' && (url.startsWith('assets/') || url.startsWith('/assets/'));
}

function normalizeLocalAsset(url) {
  return url.startsWith('/assets/') ? url.slice(1) : url;
}

function validateFileLinks(rootData, errors) {
  const nodes = [];
  collectFileNodes(rootData, 'data', nodes, errors);
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
      if (isLocalAsset(file.url)) localAssetUrls.add(normalizeLocalAsset(file.url));
    });
  });

  return {
    fileLinks,
    uniqueUrls: new Set(urls).size,
    localAssetUrls: localAssetUrls.size,
  };
}

function len(value) {
  if (Array.isArray(value)) return value.length;
  return value ? 1 : 0;
}

function calculateSectionCounts(data) {
  const counts = {
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
  counts.total = Object.values(counts).reduce((sum, v) => sum + v, 0);
  return counts;
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

  validateExpectedStructure(data, errors);
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

  const result = {
    sectionCounts,
    fileLinks: linkStats.fileLinks,
    uniqueUrls: linkStats.uniqueUrls,
    localAssetUrls: linkStats.localAssetUrls,
    baselineInfo,
    baselineDelta: {
      total: sectionCounts.total - baselineInfo.total,
      awards: sectionCounts.awards - baselineInfo.awards,
      fileLinks: linkStats.fileLinks - baselineInfo.fileLinks,
      uniqueUrls: linkStats.uniqueUrls - baselineInfo.uniqueUrls,
    },
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
