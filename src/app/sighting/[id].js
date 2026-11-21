import {useState} from 'react';
import {Alert,Pressable,StyleSheet,Text} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {router,Stack,useLocalSearchParams} from 'expo-router';
import {Screen,Card,Button,Field,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';
import LocationFields from '../../components/LocationFields';
import DateTimeFields,{formatLastSeen} from '../../components/DateTimeFields';
import {formatGeneralLocation} from '../../location';
import {colors} from '../../theme';

function validDate(value){const date=new Date(value||Date.now());return Number.isNaN(date.getTime())?new Date():date}
function ContactCheckbox({checked,onPress}){return <Pressable accessibilityRole="checkbox" accessibilityState={{checked}} onPress={onPress} style={({pressed})=>[local.checkbox,checked&&local.checkboxChecked,pressed&&{opacity:.8}]}><MaterialCommunityIcons name={checked?'checkbox-marked':'checkbox-blank-outline'} size={26} color={checked?colors.primary:colors.muted}/><Text style={[s.body,local.checkboxLabel]}>Ask the owner to contact me on WhatsApp</Text></Pressable>}

export default function Sighting(){
  const params=useLocalSearchParams(),{id}=params,{alerts,addSighting}=useStore(),{session,pendingAction,setPendingAction}=useAuth();
  const alert=alerts.find(item=>item.id===id),pendingDraft=pendingAction?.route===`/sighting/${id}`?pendingAction.draft:null;
  const responseType=(params.responseType||pendingDraft?.responseType)==='found'?'found':'sighted',isFound=responseType==='found';
  const [location,setLocation]=useState({province:params.province||pendingDraft?.province||'',city:params.city||pendingDraft?.city||'',suburb:params.suburb||pendingDraft?.suburb||''});
  const [details,setDetails]=useState(params.details||pendingDraft?.details||''),[seenAt,setSeenAt]=useState(validDate(params.seenAt||pendingDraft?.seenAt));
  const [whatsappRequested,setWhatsappRequested]=useState(pendingDraft?.whatsappRequested||false);
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  if(!alert)return <Screen title="Alert unavailable"/>;
  function draft(){return {province:location.province,city:location.city,suburb:location.suburb,details,seenAt:seenAt.toISOString(),whatsappRequested,responseType}}
  async function send(){
    if(!session){await setPendingAction({route:`/sighting/${alert.id}`,draft:draft()});router.push('/login');return}
    if(!location.province.trim()||!location.city.trim()||!location.suburb.trim())return setMessage('Province, city and suburb are required.');
    if(isFound&&!whatsappRequested)return setMessage('WhatsApp contact consent is required when you have found the animal so the owner can arrange a safe handover.');
    setBusy(true);setMessage('');
    try{
      await addSighting(alert.id,{location,details,seenAt:seenAt.toISOString(),area:formatGeneralLocation(location),when:formatLastSeen(seenAt),whatsappRequested,responseType});
      await setPendingAction(null);
      Alert.alert(isFound?'Found update sent privately':'Sighting sent privately',`Only ${alert.name}'s owner can read it.`,[{text:'Done',onPress:()=>router.replace(`/alert/${alert.id}`)}]);
    }catch(error){setMessage(error.message);setBusy(false)}
  }
  const locationComplete=location.province.trim()&&location.city.trim()&&location.suburb.trim();
  return <Screen title={`${isFound?'I found':'I saw'} ${alert.name}`} lead={isFound?'Tell the owner where the animal is currently safe.':'This sighting goes privately to the owner.'}>
    <Stack.Screen options={{title:isFound?'Found animal':'Send a sighting'}}/>
    <Card><Text style={s.h2}>{alert.id}</Text><Text style={s.body}>Share only a general location here. You can provide an exact location directly to the owner at your discretion.</Text></Card>
    <LocationFields title={isFound?'Current general location':'Sighting location'} value={location} onChange={setLocation}/>
    <Field label="Additional location information (optional)" value={details} onChangeText={setDetails} placeholder={isFound?'Where the animal is safe or how it was secured':'Landmark, road or direction of travel'} multiline/>
    <DateTimeFields value={seenAt} onChange={setSeenAt}/>
    <Card><Text style={s.h2}>{isFound?'Contact required for handover':'Contact request (optional)'}</Text><Text style={s.body}>{isFound?'Because the animal is in your care, the owner needs a safe way to arrange identification and handover.':'You can ask the owner to contact you after reviewing this sighting.'} Your mobile number remains private unless the owner accepts and starts the WhatsApp conversation.</Text><ContactCheckbox checked={whatsappRequested} onPress={()=>setWhatsappRequested(value=>!value)}/>{isFound&&!whatsappRequested?<Text style={[s.muted,{color:colors.error}]}>Select this checkbox before sending a Found update.</Text>:null}<Text style={s.muted}>A found or sighted report does not prove that this is the same animal. Confirm distinctive markings, photos or a microchip before meeting or handing over an animal. Be cautious of anyone demanding money or a reward.</Text></Card>
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
    <Button title={busy?'Sending...':session?(isFound?'Send found update':'Send private sighting'):'Log in & keep these details'} icon={isFound?'home-heart':'eye'} disabled={busy||!locationComplete||(isFound&&!whatsappRequested)} onPress={send}/>
  </Screen>;
}

const local=StyleSheet.create({
  checkbox:{minHeight:54,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:14,paddingVertical:10,borderWidth:1,borderColor:colors.border,borderRadius:12,backgroundColor:colors.surface},
  checkboxChecked:{borderColor:colors.primary,backgroundColor:colors.primaryLight},
  checkboxLabel:{flex:1,fontFamily:'Nunito_700Bold'},
});
