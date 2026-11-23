import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {useAuth} from './auth';
import {supabase} from './supabase';

const dog=require('../assets/animal-dog.png'),cat=require('../assets/animal-cat.png');
const C=createContext();

function fallbackPhoto(type){return type?.toLowerCase()==='cat'?cat:dog}
async function signedAnimalPhoto(path,type){
  if(!path)return fallbackPhoto(type);
  const {data}=await supabase.storage.from('animal-photos').createSignedUrl(path,3600);
  return data?.signedUrl?{uri:data.signedUrl}:fallbackPhoto(type);
}

export function StoreProvider({children}){
  const {session}=useAuth(),userId=session?.user.id||null,activeUserId=useRef(userId);
  const [animals,setAnimals]=useState([]),[alerts,setAlerts]=useState([]),[foundReports,setFoundReports]=useState([]),[sightedReports,setSightedReports]=useState([]),[following,setFollowing]=useState([]);
  useEffect(()=>{activeUserId.current=userId},[userId]);

  const loadAnimals=useCallback(async()=>{
    if(!userId){setAnimals([]);return}
    const requestedUserId=userId;
    const {data,error}=await supabase.from('animals').select('*').eq('owner_id',requestedUserId).order('updated_at',{ascending:false});
    if(error)throw error;
    const rows=await Promise.all(data.map(async animal=>{
      const photoPaths=animal.photo_paths?.length?animal.photo_paths:(animal.photo_path?[animal.photo_path]:[]);
      const photos=await Promise.all(photoPaths.map(async path=>({path,source:await signedAnimalPhoto(path,animal.animal_type)})));
      return {
        id:animal.id,name:animal.name,type:animal.animal_type,description:animal.description,area:animal.usual_area,
        province:animal.home_province||'',city:animal.home_city||'',suburb:animal.home_suburb||'',useOwnerLocation:animal.use_owner_location,
        breed:animal.breed||'',colours:animal.colours||[],sex:animal.sex||'',age:animal.approximate_age?.toString()||'',ageUnit:animal.age_unit||'',features:animal.identifiable_features||'',
        hasMedical:animal.has_medical_requirements,medical:animal.medical_requirements||'',chipped:animal.chipped,approach:animal.approach_guidance||'',
        photo:await signedAnimalPhoto(animal.photo_path,animal.animal_type),photoPath:animal.photo_path,photoPaths,photos,
      };
    }));
    if(activeUserId.current===requestedUserId)setAnimals(rows);
  },[userId]);

  const loadAlerts=useCallback(async()=>{
    const requestedUserId=userId;
    const {data,error}=await supabase.from('missing_alerts').select('*').order('created_at',{ascending:false});
    if(error)throw error;
    let followRows=[],sightingRows=[];
    if(requestedUserId){
      const [{data:follows,error:followError},{data:sightings,error:sightingError}]=await Promise.all([
        supabase.from('alert_follows').select('alert_reference').eq('user_id',requestedUserId),
        supabase.from('alert_sightings').select('*').order('created_at',{ascending:true}),
      ]);
      if(followError)throw followError;if(sightingError)throw sightingError;
      followRows=follows||[];sightingRows=sightings||[];
    }
    const rows=await Promise.all((data||[]).map(async alert=>({
      databaseId:alert.id,id:alert.reference,ownerId:alert.owner_id,ownerName:alert.owner_display_name||'Homeward Paws member',animalId:alert.animal_id,
      name:alert.animal_name,type:alert.animal_type,description:alert.description,
      area:[alert.suburb,alert.city,alert.province].filter(Boolean).join(', '),province:alert.province,city:alert.city,suburb:alert.suburb,
      lastSeen:alert.last_seen_unknown?'Not sure':new Date(alert.last_seen_at).toLocaleString('en-ZA',{dateStyle:'medium',timeStyle:'short'}),
      lastSeenAt:alert.last_seen_at,createdAt:alert.created_at,extra:alert.extra_details,whatsapp:alert.whatsapp_enabled,status:alert.status,
      photo:await signedAnimalPhoto(alert.photo_path,alert.animal_type),photoPath:alert.photo_path,
      sightings:sightingRows.filter(item=>item.alert_reference===alert.reference).map(item=>({
        id:item.id,
        responseType:item.response_type||'sighted',
        whatsappRequested:item.whatsapp_requested,
        contactStatus:item.contact_status,
        area:item.province&&item.city&&item.suburb?[item.suburb,item.city,item.province].join(', '):item.area,
        when:item.seen_at?new Date(item.seen_at).toLocaleString('en-ZA',{dateStyle:'medium',timeStyle:'short'}):item.seen_when,
        note:[item.location_details,item.note].filter(Boolean).join(' · '),
      })),
    })));
    if(activeUserId.current===requestedUserId){setAlerts(rows);setFollowing(followRows.map(item=>item.alert_reference))}
  },[userId]);

  const loadFoundReports=useCallback(async()=>{
    let contactRows=[];
    if(userId){const {data:contacts,error:contactError}=await supabase.from('found_report_contacts').select('*').order('created_at',{ascending:true});if(contactError)throw contactError;contactRows=contacts||[]}
    const {data,error}=await supabase.from('found_reports').select('*').order('created_at',{ascending:false});
    if(error)throw error;
    const rows=await Promise.all((data||[]).map(async report=>({
      databaseId:report.id,id:report.reference,ownerId:report.reporter_id,ownerName:report.reporter_display_name||'Homeward Paws member',
      name:'Found animal',type:report.animal_type,description:report.description,
      area:[report.suburb,report.city,report.province].filter(Boolean).join(', '),province:report.province,city:report.city,suburb:report.suburb,
      foundAt:report.found_at,foundWhen:new Date(report.found_at).toLocaleString('en-ZA',{dateStyle:'medium',timeStyle:'short'}),createdAt:report.created_at,reunitedAt:report.reunited_at,
      extra:report.location_details,status:report.status,photoPath:report.photo_path,photo:await signedAnimalPhoto(report.photo_path,report.animal_type),
      contacts:contactRows.filter(item=>item.report_reference===report.reference),
    })));
    setFoundReports(rows);
  },[userId]);

  const loadSightedReports=useCallback(async()=>{
    let contactRows=[];
    if(userId){const {data:contacts,error:contactError}=await supabase.from('sighted_report_contacts').select('*').order('created_at',{ascending:true});if(contactError)throw contactError;contactRows=contacts||[]}
    const {data,error}=await supabase.from('sighted_reports').select('*').order('created_at',{ascending:false});if(error)throw error;
    const rows=await Promise.all((data||[]).map(async report=>({
      databaseId:report.id,id:report.reference,ownerId:report.reporter_id,ownerName:report.reporter_display_name||'Homeward Paws member',name:'Sighted animal',type:report.animal_type,description:report.description,
      area:[report.suburb,report.city,report.province].filter(Boolean).join(', '),province:report.province,city:report.city,suburb:report.suburb,
      sightedAt:report.sighted_at,sightedWhen:new Date(report.sighted_at).toLocaleString('en-ZA',{dateStyle:'medium',timeStyle:'short'}),createdAt:report.created_at,
      extra:report.location_details,status:report.status,photoPath:report.photo_path,photo:await signedAnimalPhoto(report.photo_path,report.animal_type),contacts:contactRows.filter(item=>item.report_reference===report.reference),
    })));
    setSightedReports(rows);
  },[userId]);

  useEffect(()=>{
    setAnimals([]);setFollowing([]);
    if(userId)loadAnimals().catch(()=>{});
    loadAlerts().catch(()=>{});loadFoundReports().catch(()=>{});loadSightedReports().catch(()=>{});
  },[userId,loadAnimals,loadAlerts,loadFoundReports,loadSightedReports]);

  const pendingContactCount=userId?
    alerts.filter(item=>item.ownerId===userId).reduce((total,item)=>total+item.sightings.filter(response=>response.contactStatus==='pending').length,0)+
    foundReports.filter(item=>item.ownerId===userId).reduce((total,item)=>total+item.contacts.filter(request=>request.contact_status==='pending').length,0)+
    sightedReports.filter(item=>item.ownerId===userId).reduce((total,item)=>total+item.contacts.filter(request=>request.contact_status==='pending').length,0):0;

  const api=useMemo(()=>({
    role:session?'member':'guest',animals,alerts,foundReports,sightedReports,following,pendingContactCount,loadAnimals,loadAlerts,loadFoundReports,loadSightedReports,
    async saveAnimal(animal){
      if(!userId)throw new Error('Sign in to save an animal.');
      const row={owner_id:userId,name:animal.name.trim(),animal_type:animal.type.trim(),description:animal.description.trim(),usual_area:animal.area.trim(),home_province:animal.location.province.trim(),home_city:animal.location.city.trim(),home_suburb:animal.location.suburb.trim(),use_owner_location:animal.useOwnerLocation,photo_path:animal.photoPath||null,photo_paths:animal.photoPaths,breed:animal.breed.trim(),colours:animal.colours,sex:animal.sex,approximate_age:Number(animal.age),age_unit:animal.ageUnit,identifiable_features:animal.features.trim(),has_medical_requirements:animal.hasMedical,medical_requirements:animal.hasMedical?animal.medical.trim():'',chipped:animal.chipped,approach_guidance:animal.approach};
      const query=animal.id&&animal.id!=='new'?supabase.from('animals').update(row).eq('id',animal.id).eq('owner_id',userId).select().single():supabase.from('animals').insert(row).select().single();
      const {data,error}=await query;if(error)throw error;await Promise.all([loadAnimals(),loadAlerts()]);return data.id;
    },
    async removeAnimal(animal){
      if(!userId)throw new Error('Sign in to remove an animal.');
      const {error}=await supabase.from('animals').delete().eq('id',animal.id).eq('owner_id',userId);if(error)throw error;
      const paths=[...new Set([...(animal.photoPaths||[]),animal.photoPath].filter(Boolean))];
      if(paths.length){const {error:photoError}=await supabase.storage.from('animal-photos').remove(paths);if(photoError)throw photoError}
      await loadAnimals();
    },
    async publish(report){
      if(!userId)throw new Error('Sign in to publish.');
      const animal=animals.find(item=>item.id===report.animalId);if(!animal)throw new Error('Choose an animal before publishing.');
      const row={owner_id:userId,animal_id:animal.id,animal_name:animal.name,animal_type:animal.type,description:animal.description,photo_path:animal.photoPath||null,last_seen_at:report.lastSeenAt,last_seen_unknown:!report.lastSeenAt,province:report.province,city:report.city,suburb:report.suburb,extra_details:report.extra||''};
      const {data,error}=await supabase.from('missing_alerts').insert(row).select('reference').single();if(error)throw error;
      await loadAlerts();return data.reference;
    },
    async publishFound(report){
      if(!userId)throw new Error('Sign in to publish.');
      const {data,error}=await supabase.from('found_reports').insert({reporter_id:userId,animal_type:report.type,description:report.description,photo_path:report.photoPath,found_at:report.foundAt,province:report.location.province.trim(),city:report.location.city.trim(),suburb:report.location.suburb.trim(),location_details:report.details}).select('reference').single();
      if(error)throw error;await loadFoundReports();return data.reference;
    },
    async publishSighted(report){
      if(!userId)throw new Error('Sign in to publish.');
      const {data,error}=await supabase.from('sighted_reports').insert({reporter_id:userId,animal_type:report.type,description:report.description,photo_path:report.photoPath,sighted_at:report.sightedAt,province:report.location.province.trim(),city:report.location.city.trim(),suburb:report.location.suburb.trim(),location_details:report.details}).select('reference').single();
      if(error)throw error;await loadSightedReports();return data.reference;
    },
    async requestSightedContact(reference){
      if(!userId)throw new Error('Sign in to request contact.');
      const {error}=await supabase.from('sighted_report_contacts').insert({report_reference:reference,requester_id:userId});
      if(error?.code==='23505')throw new Error('You have already asked the reporter to contact you.');
      if(error)throw error;await loadSightedReports();
    },
    async endSightedReport(reference,status){
      if(!userId)throw new Error('Sign in to manage this report.');
      if(status!=='resolved'&&status!=='closed')throw new Error('Invalid Sighted report status.');
      const {error}=await supabase.from('sighted_reports').update({status}).eq('reference',reference).eq('reporter_id',userId);
      if(error)throw error;await loadSightedReports();
    },
    async requestFoundContact(reference){
      if(!userId)throw new Error('Sign in to request contact.');
      const {error}=await supabase.from('found_report_contacts').insert({report_reference:reference,requester_id:userId});
      if(error?.code==='23505')throw new Error('You have already asked the finder to contact you.');
      if(error)throw error;await loadFoundReports();
    },
    async endFoundReport(reference,status){
      if(!userId)throw new Error('Sign in to manage this report.');
      if(status!=='reunited'&&status!=='closed')throw new Error('Invalid Found report status.');
      const {error}=await supabase.from('found_reports').update({status,reunited_at:status==='reunited'?new Date().toISOString():null}).eq('reference',reference).eq('reporter_id',userId);
      if(error)throw error;await loadFoundReports();
    },
    async toggleFollow(reference){
      if(!userId)throw new Error('Sign in to follow an alert.');
      if(following.includes(reference)){const {error}=await supabase.from('alert_follows').delete().eq('user_id',userId).eq('alert_reference',reference);if(error)throw error}
      else{const {error}=await supabase.from('alert_follows').insert({user_id:userId,alert_reference:reference});if(error)throw error}
      await loadAlerts();
    },
    async addSighting(reference,sighting){
      if(!userId)throw new Error('Sign in to send a sighting.');
      const {error}=await supabase.from('alert_sightings').insert({alert_reference:reference,author_id:userId,response_type:sighting.responseType==='found'?'found':'sighted',area:sighting.area.trim(),seen_when:sighting.when.trim(),province:sighting.location.province.trim(),city:sighting.location.city.trim(),suburb:sighting.location.suburb.trim(),location_details:sighting.details.trim(),seen_at:sighting.seenAt,note:'',whatsapp_requested:!!sighting.whatsappRequested,contact_status:sighting.whatsappRequested?'pending':'none'});if(error)throw error;
      await loadAlerts();
    },
    async endAlert(reference,status){
      if(!userId)throw new Error('Sign in to manage an alert.');
      const {error}=await supabase.from('missing_alerts').update({status}).eq('reference',reference).eq('owner_id',userId);if(error)throw error;
      await loadAlerts();
    },
    clearPrivate(){setAnimals([]);setFollowing([])},
  }),[session,userId,animals,alerts,foundReports,sightedReports,following,pendingContactCount,loadAnimals,loadAlerts,loadFoundReports,loadSightedReports]);
  return <C.Provider value={api}>{children}</C.Provider>;
}
export const useStore=()=>useContext(C);
