import {useEffect,useState} from 'react';
import {Image,Pressable,Text} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Button,Card,Screen,Field,styles as s} from '../ui';
import {useStore} from '../store';
import {useAuth} from '../auth';
import {colors} from '../theme';
import LocationFields from '../components/LocationFields';
import DateTimeFields,{formatLastSeen} from '../components/DateTimeFields';
import {formatGeneralLocation} from '../location';

function validDate(value){const date=new Date(value||Date.now());return Number.isNaN(date.getTime())?new Date():date}

export default function Missing(){
  const params=useLocalSearchParams(),{animals,publish}=useStore(),{session,setPendingAction}=useAuth();
  const [animalId,setAnimalId]=useState(params.selectedAnimalId||animals[0]?.id);
  const [lastSeenAt,setLastSeenAt]=useState(validDate(params.lastSeenAt));
  const [location,setLocation]=useState({province:params.province||'',city:params.city||'',suburb:params.suburb||''});
  const [extra,setExtra]=useState(params.extra||''),[notSure,setNotSure]=useState(params.notSure==='true'),[whatsapp,setWhatsapp]=useState(params.whatsapp==='true');
  const animal=animals.find(item=>item.id===animalId);
  useEffect(()=>{if(!animalId&&animals.length)setAnimalId(animals[0].id)},[animals,animalId]);
  useEffect(()=>{if(animal&&!location.province&&!location.city&&!location.suburb)setLocation({province:animal.province||'',city:animal.city||'',suburb:animal.suburb||''})},[animal,location]);
  function select(id){
    const selected=animals.find(item=>item.id===id);
    setAnimalId(id);
    setLocation({province:selected?.province||'',city:selected?.city||'',suburb:selected?.suburb||''});
  }
  function draft(){return {lastSeenAt:lastSeenAt.toISOString(),province:location.province,city:location.city,suburb:location.suburb,extra,notSure,whatsapp}}
  async function requireLogin(){await setPendingAction({route:'/report-missing',draft:draft()});router.push('/login')}
  async function submit(){
    if(!session)return requireLogin();
    if(!animal)return;
    const area=formatGeneralLocation(location);
    if(!location.province.trim()||!location.city.trim()||!location.suburb.trim())return;
    const id=publish({animalId,lastSeen:notSure?'Not sure':formatLastSeen(lastSeenAt),lastSeenAt:notSure?null:lastSeenAt.toISOString(),area,province:location.province.trim(),city:location.city.trim(),suburb:location.suburb.trim(),extra,whatsapp});
    router.replace(`/alert/${id}`);
  }
  function addAnimal(){
    if(!session)return requireLogin();
    router.push({pathname:'/animal/new',params:{returnTo:'report',...draft(),notSure:String(notSure),whatsapp:String(whatsapp)}});
  }
  const locationComplete=location.province.trim()&&location.city.trim()&&location.suburb.trim();
  return <Screen title="Publish a missing alert" lead="Check the public details, then share it quickly.">
    {!session?<Card><Text style={s.body}>Sign in and complete your profile to publish. Your report journey will resume afterwards.</Text><Button title="Log in to continue" onPress={requireLogin}/></Card>:null}
    <Text style={s.label}>Choose saved animal</Text>
    {animals.map(item=><Pressable key={item.id} onPress={()=>select(item.id)} style={[s.card,item.id===animalId&&{borderColor:colors.primary,backgroundColor:colors.primaryLight}]}><Text style={s.h2}>{item.name}</Text><Text style={s.body}>{item.type} · {item.area}</Text></Pressable>)}
    <Button title="Add animal now" kind="secondary" onPress={addAnimal}/>
    {animal?<Card><Image source={animal.photo} style={s.photo}/><Text style={s.h2}>Public preview</Text><Text style={s.body}>{animal.name} · {animal.type}</Text><Text style={s.body}>{animal.description}</Text><Text style={s.muted}>Only an approximate public area is shown.</Text></Card>:null}
    {!notSure?<DateTimeFields value={lastSeenAt} onChange={setLastSeenAt}/>:<Text style={s.body}>Last seen time: Not sure</Text>}
    <Button title={notSure?'Choose date and time':'Not sure'} kind="secondary" onPress={()=>setNotSure(value=>!value)}/>
    <LocationFields title="Last-seen location" value={location} onChange={setLocation}/>
    <Field label="Extra details (optional)" value={extra} onChangeText={setExtra} multiline/>
    <Button title={whatsapp?'WhatsApp contact enabled':'Enable WhatsApp contact (optional)'} kind="secondary" onPress={()=>setWhatsapp(value=>!value)}/>
    <Text style={s.muted}>If enabled, neighbours can open a prefilled message. Your private profile number is never shown publicly.</Text>
    <Button title="Publish alert" icon="alert-circle" disabled={!animal||!locationComplete} onPress={submit}/>
  </Screen>;
}
