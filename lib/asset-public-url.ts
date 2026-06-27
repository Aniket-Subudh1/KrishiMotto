import Constants from 'expo-constants';

type AppExtra = {
  assetS3Bucket?: string;
  assetS3Region?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

const DEFAULT_ASSET_S3_BUCKET = 'gttech-assests';
const DEFAULT_ASSET_S3_REGION = 'ap-south-1';

/** Virtual-hosted public URL: https://{bucket}.s3.{region}.amazonaws.com/{key} */
export function buildAssetPublicUrl(assetKey: string): string {
  const bucket = extra.assetS3Bucket ?? DEFAULT_ASSET_S3_BUCKET;
  const region = extra.assetS3Region ?? DEFAULT_ASSET_S3_REGION;
  const encodedKey = assetKey
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}
