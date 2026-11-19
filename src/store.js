import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {useAuth} from './auth';
import {supabase} from './supabase';

const dog=require('../assets/animal-dog.png'),cat=require('../assets/animal-cat.png');
const initialAlerts=[
  {id:'FM3298',name:'Luna',type:'Cat',description:'Grey tabby with white paws and green eyes.',area:'Parkhurst, Johannesburg',lastSeen:'Today, around 08:30',photo:cat,status:'missing',whatsapp:true,sightings:[]},
  {id:'TY4923',name:'Milo',type:'Dog',description:'Small tan terrier with a blue collar. Friendly but nervous.',area:'Linden, Johannesburg',lastSeen:'Yesterday evening',photo:dog,status:'missing',whatsapp:false,sightings:[]},
];
const C=createContext();
function makeReference(existing){
  for(let attempt=0;attempt<100;attempt++){
    const letters=String.fromCharCode(65+Math.floor(Math.random()*26),65+Math.floor(Math.random()*26));
    const candidate=`${letters}${String(Math.floor(Math.random()*10000)).padStart(4,'0')}`;
    if(!existing.some(alert=>alert.id===candidate))return candidate;
  }
  throw new Error('Could not create a unique alert reference. Please try again.');
}

export function StoreProvider({children}){
  const {session}=useAuth(),userId=session?.user.id||null,activeUserId=useRef(userId);
  const [animals,setAnimals]=useState([]),[alerts,setAlerts]=useState(initialAlerts),[following,setFollowing]=useState([]);
  useEffect(()=>{activeUserId.current=userId},[userId]);
  const loadAnimals=useCallback(async()=>{
    if(!userId){setAnimals([]);return}
    const requestedUserId=userId;
    const {data,error}=await supabase.from('animals').select('*').eq('owner_id',requestedUserId).order('updated_at',{ascending:false});
    if(error)throw error;
    const rows=await Promise.all(data.map(async animal=>{
      let photo=animal.animal_type?.toLowerCase()==='cat'?cat:dog;
      if(animal.photo_path){const {data:signed}=await supabase.storage.from('animal-photos').createSignedUrl(animal.photo_path,3600);if(signed?.signedUrl)photo={uri:signed.signedUrl}}
      return {id:animal.id,name:animal.name,type:animal.animal_type,description:animal.description,area:animal.usual_area,photo,photoPath:animal.photo_path};
    }));
    if(activeUserId.current===requestedUserId)setAnimals(rows);
  },[userId]);
  useEffect(()=>{setAnimals([]);setFollowing([]);if(userId)loadAnimals().catch(()=>{})},[userId,loadAnimals]);
  const api=useMemo(()=>({
    role:session?'member':'guest',animals,alerts,following,loadAnimals,
    async saveAnimal(animal){
      if(!userId)throw new Error('Sign in to save an animal.');
      const row={owner_id:userId,name:animal.name.trim(),animal_type:animal.type.trim(),description:animal.description.trim(),usual_area:animal.area.trim(),photo_path:animal.photoPath||null};
      const query=animal.id&&animal.id!=='new'?supabase.from('animals').update(row).eq('id',animal.id).eq('owner_id',userId).select().single():supabase.from('animals').insert(row).select().single();
      const {data,error}=await query;if(error)throw error;await loadAnimals();return data.id;
    },
    async removeAnimal(animal){
      if(!userId)throw new Error('Sign in to remove an animal.');
      const {error}=await supabase.from('animals').delete().eq('id',animal.id).eq('owner_id',userId);if(error)throw error;
      if(animal.photoPath){const {error:photoError}=await supabase.storage.from('animal-photos').remove([animal.photoPath]);if(photoError)throw photoError}
      await loadAnimals();
    },
    publish(data){if(!userId)throw new Error('Sign in to publish.');const animal=animals.find(item=>item.id===data.animalId),id=makeReference(alerts);setAlerts(current=>[{...animal,...data,id,ownerId:userId,status:'missing',sightings:[]},...current]);return id},
    toggleFollow(id){setFollowing(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id])},
    addSighting(id,sighting){setAlerts(current=>current.map(alert=>alert.id===id?{...alert,sightings:[...alert.sightings,sighting]}:alert))},
    endAlert(id,status){setAlerts(current=>current.map(alert=>alert.id===id?{...alert,status}:alert))},
    clearPrivate(){setAnimals([]);setFollowing([])},
  }),[session,userId,animals,alerts,following,loadAnimals]);
  return <C.Provider value={api}>{children}</C.Provider>;
}
export const useStore=()=>useContext(C);
