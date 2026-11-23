import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAndroidPublishedPayload,
  buildStorageObjectPath,
  isSafeAssetOrHttpsUrl,
  migrateMasterState,
  validateMasterState
} from './supabaseService';
import { initialMasterState } from '../initialData';
import { ALL_ANDROID_FEATURES } from '../featureRegistry';

test('validateMasterState accepts the default v2.0.0 baseline', () => {
  const result = validateMasterState(initialMasterState);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateMasterState rejects invalid hex colors, insecure URLs, and out-of-bounds HUD values', () => {
  const invalid = {
    ...initialMasterState,
    config: {
      ...initialMasterState.config,
      accentColor: 'not-a-hex',
      shizukuDownloadUrl: 'http://insecure.example.com/shizuku.apk'
    },
    overlay: {
      ...initialMasterState.overlay,
      panelOpacityPercent: 15,
      hudScale: 3.0
    },
    release: {
      ...initialMasterState.release,
      latestVersion: 'bad-semver',
      apkSha256: '1234'
    }
  };

  const result = validateMasterState(invalid);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 6);
});

test('isSafeAssetOrHttpsUrl rejects javascript: and http:// URLs while allowing Supabase Storage HTTPS URLs', () => {
  assert.equal(isSafeAssetOrHttpsUrl('javascript:alert(1)'), false);
  assert.equal(isSafeAssetOrHttpsUrl('http://example.com/file.apk'), false);
  assert.equal(
    isSafeAssetOrHttpsUrl('https://demo.supabase.co/storage/v1/object/public/daveboostz-assets/icon/badge.webp'),
    true
  );
  assert.equal(isSafeAssetOrHttpsUrl('/src/assets/images/daveboostz_emblem_1795339300790.jpg'), true);
});

test('buildStorageObjectPath normalizes category paths cleanly', () => {
  const objectPath = buildStorageObjectPath('icon', 'My Tactical Icon!.png');
  assert.match(objectPath, /^icon\/\d+-my-tactical-icon\.webp$/);
});

test('migrateMasterState backfills all 24 Android features when loading partial saved state', () => {
  const migrated = migrateMasterState({
    features: [
      {
        ...ALL_ANDROID_FEATURES[0],
        enabled: false
      }
    ]
  });

  assert.equal(migrated.features.length, ALL_ANDROID_FEATURES.length);
  assert.equal(migrated.features[0].enabled, false);
});

test('buildAndroidPublishedPayload clamps overlay bounds and maps every feature flag', () => {
  const payload = buildAndroidPublishedPayload({
    ...initialMasterState,
    overlay: {
      ...initialMasterState.overlay,
      panelOpacityPercent: 120,
      hudScale: 2.0
    }
  });

  assert.equal(payload.overlay.panelOpacityPercent, 100);
  assert.equal(payload.overlay.hudScale, 1.35);
  assert.equal(Object.keys(payload.featureFlags).length, ALL_ANDROID_FEATURES.length);
});
