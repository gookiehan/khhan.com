import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { SCHEMA, MANAGED_FILES, getSectionScope, isListKind } from '../src/lib/content-schema.mjs';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');

// 파일 목록과 구조 지식은 모두 src/lib/content-schema.mjs 에서 온다.
// /admin 의 렌더링·검증도 같은 스키마를 쓰므로, admin 이 통과시킨 내용은 여기서도 통과한다.
const fileMap = Object.fromEntries(MANAGED_FILES.map((f) => [f.replace('.yml', ''), f]));

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

/**
 * 스키마에서 파생한 구조 검사.
 * 예전에는 12개 파일의 구조를 이 함수에 손으로 나열했는데, 같은 지식이
 * khhan-admin 에도 따로 있어 어긋날 여지가 있었다. 이제 한 곳만 고치면 된다.
 */
function validateExpectedStructure(data, errors) {
  for (const fileSchema of SCHEMA) {
    const key = fileSchema.file.replace('.yml', '');
    const parsed = data[key];
    const label = fileSchema.file;

    if (!isObject(parsed)) {
      errors.push(`[schema] ${label}: top-level must be an object`);
      continue;
    }

    // activities.yml 처럼 한 겹 더 감싼 파일 처리
    if (fileSchema.container && !isObject(parsed[fileSchema.container])) {
      errors.push(`[schema] ${label}.${fileSchema.container} must be an object`);
      continue;
    }
    const scope = getSectionScope(fileSchema.file, parsed);
    const scopeLabel = fileSchema.container ? `${label}.${fileSchema.container}` : label;

    for (const section of fileSchema.sections) {
      if (!(section.key in scope)) {
        errors.push(`[schema] ${scopeLabel}: missing key "${section.key}"`);
        continue;
      }
      const value = scope[section.key];
      if (isListKind(section.kind)) {
        if (!isArray(value)) errors.push(`[schema] ${scopeLabel}.${section.key} must be an array`);
      } else if (section.kind === 'dict') {
        if (!isObject(value)) errors.push(`[schema] ${scopeLabel}.${section.key} must be an object`);
      } else if (section.kind === 'scalar') {
        if (typeof value !== 'string') errors.push(`[schema] ${scopeLabel}.${section.key} must be a string`);
      }
    }
  }
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
