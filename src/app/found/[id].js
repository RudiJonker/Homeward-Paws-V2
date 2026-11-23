import {useState} from 'react';
import {Alert,Image,Text} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Screen,Card,Button,Status,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';
import {colors} from '../../theme';

export default function FoundReport(){
  const {id}=useLocalSearchParams(),{foundReports,requestFoundContact}=useStore(),{session,setPendingAction}=useAuth(),report=foundReports.find(item=>item.id===id);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
  if(!report)return <Screen title="Found report unavailable" lead="This report may have been closed or removed."/>;
  const owns=report.ownerId===session?.user.id,existing=report.contacts?.find(item=>item.requester_id===session?.user.id);
  async function requestContact(){
    if(!session){await setPendingAction({route:`/found/${report.id}`});return router.push('/login')}
    setBusy(true);setMessage('');
    try{await requestFoundContact(report.id);Alert.alert('Request sent','The finder can now review your request. Your number remains private unless they accept and start the WhatsApp conversation.')}
    catch(error){setMessage(error.message)}finally{setBusy(false)}
  }
  return <Screen title="Found animal" lead={`Public report · ${report.id}`}>
    <Image source={report.photo} style={s.photo}/>
    <Status value={report.status}/>
    <Text style={s.muted}>Posted by {report.ownerName}</Text>
    <Card><Text style={s.h2}>{report.type}</Text><Text style={s.body}>{report.description}</Text></Card>
    <Card><Text style={s.h2}>Found near</Text><Text style={s.body}>{report.area}</Text><Text style={s.body}>{report.foundWhen}</Text>{report.extra?<Text style={s.body}>{report.extra}</Text>:null}</Card>
    {report.status==='reunited'?<Card><Text style={s.h2}>Reunited</Text><Text style={s.body}>This animal has been reunited. The report remains visible for 30 days so the community can see the outcome.</Text>{owns?<Button title="Manage this Found report" onPress={()=>router.push(`/manage-found/${report.id}`)}/>:null}</Card>:report.status==='closed'?<Card><Text style={s.h2}>Report closed</Text><Text style={s.body}>The reporter closed this case without confirming a reunion.</Text>{owns?<Button title="Manage this Found report" onPress={()=>router.push(`/manage-found/${report.id}`)}/>:null}</Card>:<Card><Text style={s.h2}>Contact & safety</Text><Text style={s.body}>Think this may be your animal? Ask the finder to contact you. Your mobile number remains private unless the finder accepts and starts the WhatsApp conversation.</Text><Text style={s.muted}>A similar appearance does not prove ownership. Both parties should verify distinctive markings, photos or a microchip. Never send money or pay a claimed reward before independently confirming the animal and the other person.</Text>{owns?<Button title="Manage this Found report" onPress={()=>router.push(`/manage-found/${report.id}`)}/>:existing?<Text style={s.body}>Contact request: {existing.contact_status.toUpperCase()}</Text>:<Button title={busy?'Sending request...':'Ask the finder to contact me'} icon="whatsapp" disabled={busy} onPress={requestContact}/>}</Card>}
    {message?<Text style={[s.body,{color:colors.error}]}>{message}</Text>:null}
  </Screen>;
}
