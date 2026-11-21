import {useCallback,useEffect,useState} from 'react';
import {ActivityIndicator,Alert,Text} from 'react-native';
import * as Linking from 'expo-linking';
import {router,useLocalSearchParams} from 'expo-router';
import {Button,Card,Screen,styles as s} from '../../ui';
import {useAuth} from '../../auth';
import {useStore} from '../../store';
import {supabase} from '../../supabase';
import {whatsappNumber} from '../../mobile';
import {colors} from '../../theme';

export default function ContactSafety(){
  const params=useLocalSearchParams(),id=Array.isArray(params.id)?params.id[0]:params.id;
  const {profile}=useAuth(),{loadAlerts}=useStore();
  const [request,setRequest]=useState(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[understood,setUnderstood]=useState(false),[message,setMessage]=useState('');

  const load=useCallback(async()=>{
    const {data,error}=await supabase.rpc('get_sighting_contact_request',{p_sighting_id:id}).maybeSingle();
    if(error)setMessage(error.message);
    else setRequest(data);
    setLoading(false);
    return data;
  },[id]);
  useEffect(()=>{load()},[load]);

  async function respond(response){
    setBusy(true);setMessage('');
    const {error}=await supabase.rpc('respond_to_sighting_contact',{p_sighting_id:id,p_response:response});
    if(error){setBusy(false);return setMessage(error.message)}
    await loadAlerts();
    if(response==='declined'){setBusy(false);return router.back()}
    await load();
    setBusy(false);
  }

  function decline(){
    Alert.alert('Decline contact request?',`The ${request?.response_type==='found'?'found update':'sighting'} remains available, but WhatsApp contact will not be opened.`,[
      {text:'Cancel',style:'cancel'},
      {text:'Decline',style:'destructive',onPress:()=>respond('declined')},
    ]);
  }

  async function openWhatsApp(){
    const number=whatsappNumber(request?.mobile);
    if(!number)return setMessage('The requester does not have a valid South African mobile number.');
    const responseLabel=request.response_type==='found'?'found update':'sighting';
    const text=`Hi ${request.requester_name}, this is ${profile?.display_name||'the animal owner'} from Homeward Paws. I am contacting you about your ${responseLabel} for ${request.animal_name}, report ${request.alert_reference}.`;
    setBusy(true);setMessage('');
    try{await Linking.openURL(`https://wa.me/${number}?text=${encodeURIComponent(text)}`)}
    catch(error){setMessage(`WhatsApp could not be opened: ${error.message}`)}
    finally{setBusy(false)}
  }

  if(loading)return <Screen title="Contact & safety"><ActivityIndicator color={colors.primary}/></Screen>;
  if(!request)return <Screen title="Contact unavailable" lead="This private request is unavailable or does not belong to your report.">{message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}<Button title="Go back" onPress={()=>router.back()}/></Screen>;

  return <Screen title="Contact & safety" lead={`${request.animal_name} - ${request.alert_reference}`}>
    <Card><Text style={s.h2}>Contact request from {request.requester_name}</Text>{request.requester_area?<Text style={s.body}>{request.requester_area}</Text>:null}<Text style={s.body}>This member sent you a private {request.response_type==='found'?'found update':'sighting'} and asked you to continue the conversation on WhatsApp.</Text></Card>
    <Card><Text style={s.h2}>Before continuing</Text><Text style={s.body}>A found or sighted report does not prove that this is the same animal. Both parties should confirm identity using photos, a microchip or a distinctive marking that was not shared publicly.</Text><Text style={s.body}>Be cautious of anyone demanding money or pressuring you to pay a reward. Do not send money before the animal and the other party have been properly verified.</Text><Text style={s.body}>WhatsApp will show your phone number to the other person once you send the message. Avoid sharing sensitive information, meet in a public place where possible, and let someone you trust know where you are going.</Text><Text style={s.body}>Share an exact location only when you feel it is safe to do so.</Text></Card>
    {request.contact_status==='pending'?<><Button title={busy?'Accepting...':'Accept contact request'} icon="check" disabled={busy} onPress={()=>respond('accepted')}/><Button title="Decline request" kind="danger" disabled={busy} onPress={decline}/></>:null}
    {request.contact_status==='accepted'?<><Button title={understood?'Safety notice understood':'I understand the safety notice'} kind="secondary" icon={understood?'check-circle':'shield-check-outline'} disabled={busy} onPress={()=>setUnderstood(value=>!value)}/><Button title={busy?'Opening WhatsApp...':'Continue on WhatsApp'} icon="whatsapp" disabled={busy||!understood} onPress={openWhatsApp}/></>:null}
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
  </Screen>;
}
