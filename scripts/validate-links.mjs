import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { MANAGED_FILES } from '../src/lib/content-schema.mjs';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');
const publicDir = path.join(root, 'public');

const baselineInfo = {
  fileLinks: 177,
  uniqueUrls: 146,
  localAssetUrls: 109,
  missingLocalAssets: 0,
};

// 대상 파일 목록은 스키마에서 파생한다. 파일이 추가/제거되어도 여기를 고칠 필요가 없다.
const yamlFiles = MANAGED_FILES;

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readYaml(fileName, errors) {
  const filePath = path.join(dataDir, fileName);
  try {
    const source = fs.readFileSync(filePath, 'utf8');
    const parsed = yaml.load(source);
    if (!isObject(parsed)) {
      errors.push(`[parse] ${fileName}: top-level must be an object`);
      return {};
    }
    return parsed;
  } catch (error) {
    errors.push(`[parse] ${fileName}: ${error.message}`);
    return {};
  }
}

function collectFilesNodes(value, currentPath, output) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectFilesNodes(item, `${currentPath}[${index}]`, output);
    });
    return;
  }
  if (!isObject(value)) return;

  if (Array.isArray(value.files)) {
    output.push({ path: `${currentPath}.files`, files: value.files });
  }

  Object.entries(value).forEach(([key, child]) => {
    if (key !== 'files') {
      collectFilesNodes(child, `${currentPath}.${key}`, output);
    }
  });
}

function isLocalUrl(url) {
  return url.startsWith('assets/') || url.startsWith('/assets/');
}

function isExternalUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

function isSpecialUrl(url) {
  return url.startsWith('mailto:') || url.startsWith('tel:');
}

function normalizeLocalPath(url) {
  return url.startsWith('/assets/') ? url.slice(1) : url;
}

function checkLocalAssetExists(localPath) {
  const rootPath = path.join(root, localPath);
  const publicPath = path.join(publicDir, localPath);
  return fs.existsSync(rootPath) || fs.existsSync(publicPath);
}

function run() {
  const errors = [];
  const parsedByFile = {};

  yamlFiles.forEach((fileName) => {
    parsedByFile[fileName] = readYaml(fileName, errors);
  });

  const nodes = [];
  Object.entries(parsedByFile).forEach(([fileName, data]) => {
    collectFilesNodes(data, fileName.replace('.yml', ''), nodes);
  });

  let fileLinks = 0;
  const allUrls = [];
  const uniqueLocal = new Set();
  const uniqueExternal = new Set();
  const uniqueSpecial = new Set();
  const uniqueOther = new Set();
  const missingLocalAssets = [];

  nodes.forEach((node) => {
    node.files.forEach((file, index) => {
      const filePathLabel = `${node.path}[${index}]`;
      fileLinks += 1;

      if (!isObject(file)) {
        errors.push(`[files] ${filePathLabel} must be an object`);
        return;
      }
      if (typeof file.url !== 'string' || file.url.trim() === '') {
        errors.push(`[files] ${filePathLabel}.url is required`);
        return;
      }

      const url = file.url.trim();
      allUrls.push(url);

      if (isLocalUrl(url)) {
        const localPath = normalizeLocalPath(url);
        uniqueLocal.add(localPath);
        if (!checkLocalAssetExists(localPath)) {
          missingLocalAssets.push({ url, path: filePathLabel });
        }
      } else if (isExternalUrl(url)) {
        uniqueExternal.add(url);
      } else if (isSpecialUrl(url)) {
        uniqueSpecial.add(url);
      } else {
        uniqueOther.add(url);
        errors.push(`[url-format] ${filePathLabel}.url has unsupported scheme/path: ${url}`);
      }
    });
  });

  const uniqueUrls = new Set(allUrls).size;
  if (missingLocalAssets.length > 0) {
    errors.push(`[local-assets] missing local assets: ${missingLocalAssets.length}`);
  }

  const result = {
    fileLinks,
    uniqueUrls,
    localAssetUrls: uniqueLocal.size,
    classifications: {
      local: uniqueLocal.size,
      external: uniqueExternal.size,
      special: uniqueSpecial.size,
      other: uniqueOther.size,
    },
    missingLocalAssets: missingLocalAssets.map((item) => item.url),
    baselineInfo,
    baselineDelta: {
      fileLinks: fileLinks - baselineInfo.fileLinks,
      uniqueUrls: uniqueUrls - baselineInfo.uniqueUrls,
      localAssetUrls: uniqueLocal.size - baselineInfo.localAssetUrls,
      missingLocalAssets: missingLocalAssets.length - baselineInfo.missingLocalAssets,
    },
    success: errors.length === 0,
  };

  console.log(JSON.stringify(result, null, 2));

  if (errors.length > 0) {
    console.error('\nValidation errors:');
    errors.forEach((error) => console.error(`- ${error}`));
    if (missingLocalAssets.length > 0) {
      console.error('\nMissing local assets detail:');
      missingLocalAssets.forEach((item) => {
        console.error(`- ${item.url} at ${item.path}`);
      });
    }
    process.exit(1);
  }
}

run();
