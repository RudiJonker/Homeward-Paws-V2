import {useState} from 'react';
import {Alert,Linking,Text} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Screen,Card,Button,Field,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';
import LocationFields from '../../components/LocationFields';
import DateTimeFields,{formatLastSeen} from '../../components/DateTimeFields';
import {formatGeneralLocation} from '../../location';
import {colors} from '../../theme';

function validDate(value){const date=new Date(value||Date.now());return Number.isNaN(date.getTime())?new Date():date}

export default function Sighting(){
  const params=useLocalSearchParams(),{id}=params,{alerts,addSighting}=useStore(),{session,pendingAction,setPendingAction}=useAuth();
  const alert=alerts.find(item=>item.id===id),pendingDraft=pendingAction?.route===`/sighting/${id}`?pendingAction.draft:null;
  const [location,setLocation]=useState({province:params.province||pendingDraft?.province||'',city:params.city||pendingDraft?.city||'',suburb:params.suburb||pendingDraft?.suburb||''});
  const [details,setDetails]=useState(params.details||pendingDraft?.details||''),[seenAt,setSeenAt]=useState(validDate(params.seenAt||pendingDraft?.seenAt));
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  if(!alert)return <Screen title="Alert unavailable"/>;
  function draft(){return {province:location.province,city:location.city,suburb:location.suburb,details,seenAt:seenAt.toISOString()}}
  async function send(){
    if(!session){await setPendingAction({route:`/sighting/${alert.id}`,draft:draft()});router.push('/login');return}
    if(!location.province.trim()||!location.city.trim()||!location.suburb.trim())return setMessage('Province, city and suburb are required.');
    setBusy(true);setMessage('');
    try{
      await addSighting(alert.id,{location,details,seenAt:seenAt.toISOString(),area:formatGeneralLocation(location),when:formatLastSeen(seenAt)});
      await setPendingAction(null);
      Alert.alert('Sighting sent privately',`Only ${alert.name}’s owner can read it.`,[{text:'Done',onPress:()=>router.replace(`/alert/${alert.id}`)}]);
    }catch(error){setMessage(error.message);setBusy(false)}
  }
  const area=formatGeneralLocation(location),locationComplete=location.province.trim()&&location.city.trim()&&location.suburb.trim();
  return <Screen title={`I saw ${alert.name}`} lead="This sighting goes privately to the owner.">
    <Card><Text style={s.h2}>{alert.id}</Text><Text style={s.body}>Share only a general location here. You can provide an exact location directly to the owner at your discretion.</Text></Card>
    <LocationFields title="Sighting location" value={location} onChange={setLocation}/>
    <Field label="Additional location information (optional)" value={details} onChangeText={setDetails} placeholder="Landmark, road or direction of travel" multiline/>
    <DateTimeFields value={seenAt} onChange={setSeenAt}/>
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
    <Button title={busy?'Sending…':session?'Send private sighting':'Log in & keep these details'} icon="eye" disabled={busy||!locationComplete} onPress={send}/>
    {alert.whatsapp?<Button title="Preview WhatsApp message" kind="secondary" icon="whatsapp" onPress={()=>Linking.openURL(`https://wa.me/?text=${encodeURIComponent(`I may have seen ${alert.name}. Report ${alert.id}. Near ${[area,details].filter(Boolean).join(' · ')||'[area]'}.`)}`)}/>:null}
  </Screen>;
}
