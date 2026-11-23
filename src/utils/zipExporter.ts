/**
 * ZIP / workflow export helpers used by Dashboard and ZipDownloadCenter.
 *
 * Source files are bundled lazily at build time with Vite's import.meta.glob.
 * - Admin files always exist (they live inside this project root).
 * - Android files live outside the admin root (../android). If the Android
 *   project is not present at build time (e.g. Vercel with Root Directory =
 *   admin), the glob simply matches nothing and the Android exports report a
 *   clear error instead of breaking the build.
 */

type Loader = () => Promise<string>;
type LoaderMap = Record<string, Loader>;

// --- Admin project (relative to src/utils -> admin root is ../../) ----------
const adminSrc = import.meta.glob(
  ['../../src/**/*.{ts,tsx,css}', '../../supabase/*.{sql,md}', '../../docs/*.md'],
  { query: '?raw', import: 'default' }
) as LoaderMap;

const adminRoot = import.meta.glob(
  [
    '../../package.json',
    '../../package-lock.json',
    '../../index.html',
    '../../vite.config.ts',
    '../../vercel.json',
    '../../tsconfig.json',
    '../../metadata.json',
    '../../README.md',
    '../../VERSIONS.md',
    '../../UPDATE_AUDIT.md',
    '../../PROJECT_VERSION.txt',
    '../../.env.example',
    '../../.gitignore'
  ],
  { query: '?raw', import: 'default' }
) as LoaderMap;

const adminWorkflows = import.meta.glob('../../.github/workflows/*.yml', {
  query: '?raw',
  import: 'default'
}) as LoaderMap;

// --- Android project (relative to src/utils -> android root is ../../../android)
const androidFiles = import.meta.glob(
  [
    '../../../android/**/*.{kt,kts,xml,aidl,properties,example,md,txt,gradle}',
    '../../../android/.gitignore',
    '!../../../android/**/build/**',
    '!../../../android/.github/**'
  ],
  { query: '?raw', import: 'default' }
) as LoaderMap;

const androidWorkflows = import.meta.glob('../../../android/.github/workflows/*.yml', {
  query: '?raw',
  import: 'default'
}) as LoaderMap;

/** Strip the leading "../" segments and an optional "android/" prefix to get an archive path. */
function toArchivePath(globKey: string, stripAndroid = false): string {
  let p = globKey.replace(/^(\.\.\/)+/, '');
  if (stripAndroid) p = p.replace(/^android\//, '');
  return p;
}

function collect(maps: LoaderMap[], stripAndroid = false): Array<[string, Loader]> {
  const out: Array<[string, Loader]> = [];
  for (const map of maps) {
    for (const [key, loader] of Object.entries(map)) {
      out.push([toArchivePath(key, stripAndroid), loader]);
    }
  }
  return out;
}

const adminEntries = (): Array<[string, Loader]> => collect([adminSrc, adminRoot, adminWorkflows]);
const androidEntries = (): Array<[string, Loader]> =>
  collect([androidFiles, androidWorkflows], true);

export function getArchiveCounts(): {
  androidFileCount: number;
  adminFileCount: number;
  totalCompleteCount: number;
} {
  const androidFileCount = androidEntries().length;
  const adminFileCount = adminEntries().length;
  return {
    androidFileCount,
    adminFileCount,
    totalCompleteCount: androidFileCount + adminFileCount
  };
}

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function buildZip(
  entries: Array<{ path: string; loader: Loader }>,
  fileName: string,
  emptyMessage: string
): Promise<number> {
  if (entries.length === 0) {
    throw new Error(emptyMessage);
  }
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const contents = await Promise.all(entries.map((e) => e.loader()));
  entries.forEach((e, i) => zip.file(e.path, contents[i]));
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  triggerDownload(blob, fileName);
  return entries.length;
}

const toEntries = (list: Array<[string, Loader]>, prefix = '') =>
  list.map(([path, loader]) => ({ path: prefix + path, loader }));

const ANDROID_MISSING =
  'Android project files were not included in this build. Build the admin panel from the full repository (with the android/ folder) to export them.';

export async function downloadAndroidRepoZip(): Promise<number> {
  return buildZip(toEntries(androidEntries()), 'DaveBoostz-Android.zip', ANDROID_MISSING);
}

export async function downloadAdminRepoZip(): Promise<number> {
  return buildZip(
    toEntries(adminEntries()),
    'DaveBoostz-Admin.zip',
    'No admin project files were bundled into this build.'
  );
}

export async function downloadCompleteZip(): Promise<number> {
  return buildZip(
    [...toEntries(androidEntries(), 'android/'), ...toEntries(adminEntries(), 'admin/')],
    'DaveBoostz-Complete-v2.0.zip',
    'No project files were bundled into this build.'
  );
}

async function loadWorkflow(map: LoaderMap, name: string): Promise<string> {
  const key = Object.keys(map).find((k) => k.endsWith(`/${name}`));
  if (!key) throw new Error(`${name} was not found in this build.`);
  return map[key]();
}

function downloadText(text: string, fileName: string): void {
  triggerDownload(new Blob([text], { type: 'text/yaml;charset=utf-8' }), fileName);
}

export function downloadAndroidWorkflowYml(): void {
  void loadWorkflow(androidWorkflows, 'android-ci.yml').then(
    (text) => downloadText(text, 'android-ci.yml'),
    (err: unknown) => console.error(err)
  );
}

export function downloadAdminWorkflowYml(): void {
  void loadWorkflow(adminWorkflows, 'ci.yml').then(
    (text) => downloadText(text, 'ci.yml'),
    (err: unknown) => console.error(err)
  );
}

export async function downloadAndroidWorkflowZip(): Promise<void> {
  const text = await loadWorkflow(androidWorkflows, 'android-ci.yml');
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  zip.file('.github/workflows/android-ci.yml', text);
  triggerDownload(await zip.generateAsync({ type: 'blob' }), 'DaveBoostz-Android-Workflow.zip');
}
