import {supabase} from './supabase';
import {File} from 'expo-file-system';
import {decode} from 'base64-arraybuffer';

const allowedTypes=new Set(['image/jpeg','image/png','image/webp']);

export function imageContentType(asset){
  const supplied=asset?.mimeType?.toLowerCase();
  if(allowedTypes.has(supplied))return supplied;
  const uri=asset?.uri?.toLowerCase()||'';
  if(uri.endsWith('.png'))return 'image/png';
  if(uri.endsWith('.webp'))return 'image/webp';
  return 'image/jpeg';
}

export async function uploadImage(bucket,path,asset){
  let body;
  try{body=asset.base64?decode(asset.base64):await new File(asset.uri).arrayBuffer()}catch{throw new Error('The selected photo could not be read. Please choose it again.')}
  const {error}=await supabase.storage.from(bucket).upload(path,body,{contentType:imageContentType(asset),upsert:true});
  if(error)throw error;
  return path;
}
