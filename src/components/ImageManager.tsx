import React, { useState } from 'react';
import { AppConfig, GameItem, ImageAsset } from '../types';
import { isSupabaseConfigured } from '../supabase';
import { deleteImageAssetFromStorage, uploadImageAssetToStorage } from '../services/supabaseService';
import { Image as ImageIcon, Upload, Trash2, CheckCircle2, Link2, AlertCircle } from 'lucide-react';

interface ImageManagerProps {
  assets: ImageAsset[];
  config: AppConfig;
  games: GameItem[];
  actorUid?: string;
  onAssetsChange: (updated: ImageAsset[]) => void;
  onAssignToLogo: (url: string) => void;
  onAssignToGameIcon: (gameId: string, url: string) => void;
  onAssignToGameBackground: (gameId: string, url: string) => void;
}

const SafeAssetImage: React.FC<{ src: string; alt: string; className: string }> = ({
  src,
  alt,
  className
}) => {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className={`${className} bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 p-4`}>
        <ImageIcon className="w-6 h-6 text-zinc-600 mb-1" />
        <span className="text-[11px] text-center truncate max-w-full">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={className}
    />
  );
};

async function compressImageToWebP(
  file: File,
  maxDimension: number,
  maxBytes = 500 * 1024
): Promise<{ blob: Blob; dataUrl: string; sizeKb: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.max(1, Math.round(bitmap.width * scale));
  const targetH = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  let quality = 0.85;
  let dataUrl = canvas.toDataURL('image/webp', quality);
  while (dataUrl.length * 0.75 > maxBytes && quality > 0.35) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/webp', quality);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('WebP encoding failed'))),
      'image/webp',
      quality
    );
  });

  const sizeKb = Math.max(1, Math.round(blob.size / 1024));
  return { blob, dataUrl, sizeKb };
}

export const ImageManager: React.FC<ImageManagerProps> = ({
  assets,
  config,
  games,
  actorUid,
  onAssetsChange,
  onAssignToLogo,
  onAssignToGameIcon,
  onAssignToGameBackground
}) => {
  const [category, setCategory] = useState<ImageAsset['category']>('icon');
  const [assetName, setAssetName] = useState('');
  const [altText, setAltText] = useState('');
  const [httpsUrl, setHttpsUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Invalid file type. Please upload PNG, JPG, or WebP.');
      return;
    }

    setUploading(true);
    try {
      const maxDim = category === 'logo' || category === 'icon' ? 512 : 1280;
      const { blob, dataUrl, sizeKb } = await compressImageToWebP(file, maxDim);

      let url = dataUrl;
      let storagePath: string | undefined;

      if (isSupabaseConfigured) {
        const uploaded = await uploadImageAssetToStorage(
          blob,
          assetName.trim() || file.name,
          category,
          actorUid
        );
        url = uploaded.publicUrl;
        storagePath = uploaded.storagePath;
      }

      const newAsset: ImageAsset = {
        id: `img-${Date.now()}`,
        name: assetName.trim() || file.name,
        category,
        url,
        storagePath,
        altText: altText.trim() || file.name,
        sizeKb
      };
      onAssetsChange([newAsset, ...assets]);
      setAssetName('');
      setAltText('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddHttpsUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!httpsUrl.startsWith('https://')) {
      setErrorMsg('External image URLs must start with https://');
      return;
    }
    const newAsset: ImageAsset = {
      id: `img-${Date.now()}`,
      name: assetName.trim() || 'Remote HTTPS Asset',
      category,
      url: httpsUrl.trim(),
      altText: altText.trim() || 'DaveBoostz image asset',
      sizeKb: 0
    };
    onAssetsChange([newAsset, ...assets]);
    setHttpsUrl('');
    setAssetName('');
    setAltText('');
  };

  const handleDelete = async (asset: ImageAsset) => {
    try {
      if (asset.storagePath) {
        await deleteImageAssetFromStorage(asset.storagePath);
      }
      onAssetsChange(assets.filter((img) => img.id !== asset.id));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete asset from Supabase Storage.');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
          <ImageIcon className="w-5 h-5 text-red-500" />
          <span>Icons & Image Assets</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Optimize assets to WebP (&le;512px icons, &le;1280px backdrops) and upload directly to the Supabase Storage <code className="font-mono text-zinc-300">daveboostz-assets</code> bucket.
        </p>
      </div>

      {/* Active Logo Preview */}
      <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-5 flex items-center gap-4">
        <SafeAssetImage
          src={config.logoUrl}
          alt="Current app logo"
          className="w-14 h-14 rounded-lg object-cover border border-zinc-800 shrink-0"
        />
        <div className="min-w-0">
          <div className="font-semibold text-white text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isSupabaseConfigured
                ? 'Supabase Storage Connected (daveboostz-assets)'
                : 'Local Preview WebP Storage (Connect Supabase for CDN bucket uploads)'}
            </span>
          </div>
          <p className="text-zinc-400 text-xs mt-0.5">
            Uploaded assets store public CDN URLs in <code className="font-mono text-zinc-300">daveboostz_media_assets</code> and sync cleanly via <code className="font-mono text-zinc-300">daveboostz_config</code>.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload & URL Controls */}
      <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Asset Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ImageAsset['category'])}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            >
              <option value="icon">Game / App Icon (&le;512px)</option>
              <option value="logo">Brand Logo (&le;512px)</option>
              <option value="background">Game Background (&le;1280px)</option>
              <option value="banner">Announcement Banner (&le;1280px)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Label / Asset Name</label>
            <input
              type="text"
              placeholder="e.g. Tactical Icon"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Alt Text</label>
            <input
              type="text"
              placeholder="Accessible description"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="border border-dashed border-zinc-700 hover:border-red-500/60 rounded-lg p-6 text-center transition-colors cursor-pointer relative">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <h3 className="text-white font-medium text-sm">
            Upload Icon or Image to Supabase Storage (Auto-Optimized WebP)
          </h3>
          {uploading && <p className="text-xs text-red-400 mt-1.5">Optimizing & uploading to Supabase Storage...</p>}
        </div>

        <form onSubmit={handleAddHttpsUrl} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="url"
              placeholder="Or paste an https:// image URL..."
              value={httpsUrl}
              onChange={(e) => setHttpsUrl(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 whitespace-nowrap"
          >
            Add HTTPS URL
          </button>
        </form>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {assets.map((img) => (
          <div key={img.id} className="bg-[#111115] border border-zinc-800/90 rounded-xl overflow-hidden flex flex-col">
            <div className="h-44 relative bg-zinc-950 overflow-hidden border-b border-zinc-800/80">
              <SafeAssetImage src={img.url} alt={img.altText || img.name} className="w-full h-full object-cover" />
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-zinc-500 flex items-center gap-2 mb-1 tabular-nums">
                    <span className="capitalize text-zinc-300">{img.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{img.sizeKb > 0 ? `${img.sizeKb} KB` : 'HTTPS URL'}</span>
                  </div>
                  <input
                    type="text"
                    value={img.name}
                    onChange={(e) =>
                      onAssetsChange(assets.map((a) => (a.id === img.id ? { ...a, name: e.target.value } : a)))
                    }
                    className="bg-transparent text-white text-sm font-semibold w-full border-b border-transparent focus:border-red-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">{img.altText}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(img)}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors shrink-0"
                  title="Delete asset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => onAssignToLogo(img.url)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-600/30"
                >
                  Set App Logo
                </button>
                {games[0] && (
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const [action, gameId] = e.target.value.split(':');
                      if (!gameId) return;
                      if (action === 'icon') onAssignToGameIcon(gameId, img.url);
                      if (action === 'bg') onAssignToGameBackground(gameId, img.url);
                      e.target.value = '';
                    }}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="">Assign to Game...</option>
                    {games.map((g) => (
                      <React.Fragment key={g.id}>
                        <option value={`icon:${g.id}`}>{g.name} — Icon</option>
                        <option value={`bg:${g.id}`}>{g.name} — Background</option>
                      </React.Fragment>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageManager;
