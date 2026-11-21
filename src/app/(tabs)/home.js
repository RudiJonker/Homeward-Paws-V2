import {Image,Text} from 'react-native';
import {router} from 'expo-router';
import {Screen,Card,Button,AlertCard,styles as s} from '../../ui';
import {useStore} from '../../store';
import {useAuth} from '../../auth';

export default function Home(){
  const {alerts,pendingContactCount}=useStore();
  const {session}=useAuth();
  const active=alerts.find(alert=>alert.ownerId===session?.user.id&&alert.status==='missing');
  const responseCount=active?.sightings.length||0,pendingContacts=active?.sightings.filter(item=>item.contactStatus==='pending').length||0;
  return <Screen title="Bring them home" lead="Quick help when an animal goes missing.">
    <Image source={require('../../../assets/logo-horizontal.png')} style={{width:220,height:82,resizeMode:'contain',alignSelf:'center'}}/>
    <Card>
      <Button title="Report my animal missing" icon="alert-circle" onPress={()=>router.push('/report-missing')}/>
      <Button title="Browse missing animals" icon="magnify" kind="secondary" onPress={()=>router.push('/browse')}/>
    </Card>
    {pendingContactCount?<Card><Text style={s.h2}>Contact requests waiting: {pendingContactCount}</Text><Text style={s.body}>Someone is waiting for you to review a private contact request about one of your reports.</Text><Button title="Review contact requests" icon="message-alert" onPress={()=>router.push('/my-reports')}/></Card>:null}
    {active&&<><Text style={s.h2}>My active alert</Text><AlertCard alert={active} onPress={()=>router.push(`/manage/${active.id}`)}/><Card><Text style={s.h2}>Community responses: {responseCount}</Text><Text style={s.body}>{responseCount?`${responseCount} ${responseCount===1?'person has':'people have'} sent a sighting or found update.`:'No sightings or found updates have been received yet.'}</Text>{pendingContacts?<Text style={s.body}>{pendingContacts} WhatsApp contact {pendingContacts===1?'request is':'requests are'} waiting for review.</Text>:null}<Button title={`Review responses (${responseCount})`} icon="eye" onPress={()=>router.push(`/manage/${active.id}`)}/></Card><Button title="Share again (preview)" kind="secondary" icon="share-variant" onPress={()=>router.push(`/alert/${active.id}`)}/></>}
  </Screen>;
}
