import * as Location from 'expo-location';

export function splitGeneralLocation(profile){
  const safeProfile=profile||{};
  if(safeProfile.home_province||safeProfile.home_city||safeProfile.home_suburb){
    return {province:safeProfile.home_province||'',city:safeProfile.home_city||'',suburb:safeProfile.home_suburb||''};
  }
  const parts=(safeProfile.home_area||'').split(',').map(value=>value.trim()).filter(Boolean);
  return {suburb:parts[0]||'',city:parts[1]||'',province:parts.slice(2).join(', ')||''};
}

export function formatGeneralLocation({province,city,suburb}){
  return [suburb,city,province].map(value=>value?.trim()).filter(Boolean).join(', ');
}

export async function detectGeneralLocation(){
  if(!await Location.hasServicesEnabledAsync())throw new Error('Turn on device location services, or enter your location manually.');
  const permission=await Location.requestForegroundPermissionsAsync();
  if(permission.status!=='granted')throw new Error('Location permission was not granted. You can enter the fields manually.');
  const position=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
  const [address]=await Location.reverseGeocodeAsync({latitude:position.coords.latitude,longitude:position.coords.longitude});
  if(!address)throw new Error('We could not identify a general location. Please enter it manually.');
  const province=(address.region||'').trim();
  const city=(address.city||address.subregion||'').trim();
  const district=(address.district||'').trim();
  const suburb=district&&district.toLowerCase()!==city.toLowerCase()?district:'';
  return {province,city,suburb};
}
