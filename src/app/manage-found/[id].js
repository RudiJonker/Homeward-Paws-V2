import {Alert,Text} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Screen,Card,Button,Status,styles as s} from '../../ui';
import {useAuth} from '../../auth';
import {useStore} from '../../store';

export default function ManageFound(){
  const {id}=useLocalSearchParams(),{session}=useAuth(),{foundReports,endFoundReport}=useStore();
  const report=foundReports.find(item=>item.id===id&&item.ownerId===session?.user.id);
  if(!report)return <Screen title="Report unavailable" lead="This Found report is unavailable or does not belong to your account."/>;
  const pending=report.contacts.filter(item=>item.contact_status==='pending').length;
  function finish(status){
    const reunited=status==='reunited';
    Alert.alert(reunited?'Mark animal reunited?':'Close this Found report?',reunited?'The card will show REUNITED in Browse → Found for 30 days, then leave the public list automatically.':'The report will leave Browse → Found immediately. You can still see it under My reports.',[
      {text:'Cancel',style:'cancel'},
      {text:reunited?'Mark reunited':'Close report',style:reunited?'default':'destructive',onPress:()=>endFoundReport(report.id,status).catch(error=>Alert.alert('Report could not be updated',error.message))},
    ]);
  }
  return <Screen title="Manage Found report" lead={report.id}>
    <Status value={report.status}/>
    <Button title="View public report" kind="secondary" onPress={()=>router.push(`/found/${report.id}`)}/>
    <Text style={s.h2}>Private contact requests ({report.contacts.length})</Text>
    {pending?<Text style={s.body}>{pending} request {pending===1?'is':'are'} waiting for your review.</Text>:null}
    {report.contacts.map(request=><Card key={request.id}><Text style={s.h2}>Possible owner contact request</Text><Text style={s.body}>Status: {request.contact_status.toUpperCase()}</Text>{request.contact_status!=='declined'?<Button title={request.contact_status==='accepted'?'Contact & safety':'Review contact request'} kind="secondary" icon="whatsapp" onPress={()=>router.push({pathname:`/contact/${request.id}`,params:{kind:'found'}})}/>:null}</Card>)}
    {!report.contacts.length?<Card><Text style={s.body}>No one has requested contact yet.</Text></Card>:null}
    {report.status==='found'?<Card><Text style={s.h2}>End this Found report</Text><Button title="Mark reunited" icon="home-heart" onPress={()=>finish('reunited')}/><Button title="Close without reunion" kind="danger" onPress={()=>finish('closed')}/></Card>:report.status==='reunited'?<Card><Text style={s.h2}>Reunion confirmed</Text><Text style={s.body}>This report remains visible under Browse → Found for 30 days after the reunion.</Text></Card>:<Card><Text style={s.body}>This report is closed and no longer appears in public Browse results.</Text></Card>}
  </Screen>;
}
