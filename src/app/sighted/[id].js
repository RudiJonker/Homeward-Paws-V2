import {useState} from 'react';
import {Alert,Image,Text} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Screen,Card,Button,Status,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';
import {colors} from '../../theme';

export default function SightedReport(){
  const {id}=useLocalSearchParams(),{sightedReports,requestSightedContact}=useStore(),{session,setPendingAction}=useAuth(),report=sightedReports.find(item=>item.id===id);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
  if(!report)return <Screen title="Sighted report unavailable" lead="This report may have been closed or removed."/>;
  const owns=report.ownerId===session?.user.id,existing=report.contacts?.find(item=>item.requester_id===session?.user.id);
  async function requestContact(){
    if(!session){await setPendingAction({route:`/sighted/${report.id}`});return router.push('/login')}
    setBusy(true);setMessage('');
    try{await requestSightedContact(report.id);Alert.alert('Request sent','The reporter can now review your request. Your number remains private unless they accept and start the WhatsApp conversation.')}
    catch(error){setMessage(error.message)}finally{setBusy(false)}
  }
  return <Screen title="Animal sighting" lead={`Public report · ${report.id}`}>
    <Image source={report.photo} style={s.photo}/><Status value={report.status}/><Text style={s.muted}>Posted by {report.ownerName}</Text>
    <Card><Text style={s.h2}>{report.type}</Text><Text style={s.body}>{report.description}</Text></Card>
    <Card><Text style={s.h2}>Sighted near</Text><Text style={s.body}>{report.area}</Text><Text style={s.body}>{report.sightedWhen}</Text>{report.extra?<Text style={s.body}>{report.extra}</Text>:null}</Card>
    {report.status==='resolved'?<Card><Text style={s.h2}>Sighting no longer active</Text><Text style={s.body}>The reporter confirmed that the animal is no longer at or near this location.</Text>{owns?<Button title="Manage this Sighted report" onPress={()=>router.push(`/manage-sighted/${report.id}`)}/>:null}</Card>:report.status==='closed'?<Card><Text style={s.h2}>Report closed</Text><Text style={s.body}>The reporter closed this sighting as incorrect, duplicate or no longer valid.</Text>{owns?<Button title="Manage this Sighted report" onPress={()=>router.push(`/manage-sighted/${report.id}`)}/>:null}</Card>:<Card><Text style={s.h2}>Contact & safety</Text><Text style={s.body}>Think this may be your animal? Ask the reporter to contact you. Your mobile number remains private unless they accept and start the WhatsApp conversation.</Text><Text style={s.muted}>This animal was not reported as being in the poster’s care. Do not enter private property, traffic or another unsafe area while searching. Confirm distinctive markings and be cautious of payment or reward demands.</Text>{owns?<Button title="Manage this Sighted report" onPress={()=>router.push(`/manage-sighted/${report.id}`)}/>:existing?<Text style={s.body}>Contact request: {existing.contact_status.toUpperCase()}</Text>:<Button title={busy?'Sending request...':'Ask the reporter to contact me'} icon="whatsapp" disabled={busy} onPress={requestContact}/>}</Card>}
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
  </Screen>;
}
