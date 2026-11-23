import {Alert,Text} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Screen,Card,Button,Status,styles as s} from '../../ui';
import {useAuth} from '../../auth';
import {useStore} from '../../store';

export default function ManageSighted(){
  const {id}=useLocalSearchParams(),{session}=useAuth(),{sightedReports,endSightedReport}=useStore();
  const report=sightedReports.find(item=>item.id===id&&item.ownerId===session?.user.id);
  if(!report)return <Screen title="Report unavailable" lead="This Sighted report is unavailable or does not belong to your account."/>;
  const pending=report.contacts.filter(item=>item.contact_status==='pending').length;
  function finish(status){
    const resolved=status==='resolved';
    Alert.alert(resolved?'Mark sighting no longer active?':'Close this Sighted report?',resolved?'Use this when the animal is no longer at or near the reported location. The report will leave public Browse but remain under My reports.':'Use this for an incorrect, duplicate or otherwise invalid report. It will leave public Browse immediately.',[
      {text:'Cancel',style:'cancel'},
      {text:resolved?'Mark no longer active':'Close report',style:resolved?'default':'destructive',onPress:()=>endSightedReport(report.id,status).catch(error=>Alert.alert('Report could not be updated',error.message))},
    ]);
  }
  return <Screen title="Manage Sighted report" lead={report.id}>
    <Status value={report.status}/><Button title="View public report" kind="secondary" onPress={()=>router.push(`/sighted/${report.id}`)}/>
    <Text style={s.h2}>Private contact requests ({report.contacts.length})</Text>
    {pending?<Text style={s.body}>{pending} request {pending===1?'is':'are'} waiting for your review.</Text>:null}
    {report.contacts.map(request=><Card key={request.id}><Text style={s.h2}>Possible owner contact request</Text><Text style={s.body}>Status: {request.contact_status.toUpperCase()}</Text>{request.contact_status!=='declined'?<Button title={request.contact_status==='accepted'?'Contact & safety':'Review contact request'} kind="secondary" icon="whatsapp" onPress={()=>router.push({pathname:`/contact/${request.id}`,params:{kind:'sighted'}})}/>:null}</Card>)}
    {!report.contacts.length?<Card><Text style={s.body}>No one has requested contact yet.</Text></Card>:null}
    {report.status==='sighted'?<Card><Text style={s.h2}>End this Sighted report</Text><Button title="Animal no longer in this area" icon="eye-off-outline" onPress={()=>finish('resolved')}/><Button title="Close incorrect or duplicate report" kind="danger" onPress={()=>finish('closed')}/></Card>:report.status==='resolved'?<Card><Text style={s.h2}>Sighting no longer active</Text><Text style={s.body}>This report remains under My reports but no longer appears in public Browse results.</Text></Card>:<Card><Text style={s.body}>This report is closed and no longer appears in public Browse results.</Text></Card>}
  </Screen>;
}
